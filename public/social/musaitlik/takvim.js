/* takvim.js — müsaitlik motoru. Tüm veri config.json'dan gelir; burada yalnız hesap var.
   Saatler kaynak saat diliminde (Europe/Istanbul, sabit +03:00) tanımlanır. */

const CACHE_KEY = 'bk-musaitlik-config-v1';

export async function configYukle(yol = '/config.json') {
  try {
    const r = await fetch(yol, { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const cfg = await r.json();
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cfg)); } catch (e) {}
    return cfg;
  } catch (e) {
    try {
      const c = localStorage.getItem(CACHE_KEY);
      if (c) return JSON.parse(c);
    } catch (e2) {}
    throw new Error('config.json okunamadı');
  }
}

/* ── tarih yardımcıları ───────────────────────────────────────────── */

const isoBicim = (tz) => new Intl.DateTimeFormat('en-CA', {
  timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
});

export function bugunISO(cfg, now = new Date()) {
  return isoBicim(cfg.saat.kaynakSaatDilimi).format(now);
}
export function haftaninGunu(iso) {              // 0=Pazar … 6=Cumartesi
  return new Date(iso + 'T12:00:00Z').getUTCDay();
}
export function gunEkle(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function an(cfg, iso, hhmm) {             // kaynak saat dilimini gerçek ana çevir
  return new Date(`${iso}T${hhmm}:00${cfg.saat.kaynakOfset}`);
}
export function yerelSaatStr(d) {
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
export function ziyaretciSaatDilimi() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; }
}
export function saatKaymasiVar(cfg, ornekISO) {
  const d = an(cfg, ornekISO, '12:00');
  return yerelSaatStr(d) !== '12:00';
}

/* ── gün tipi ─────────────────────────────────────────────────────── */

export function gunSaati(cfg, iso) {
  const h = cfg.haftalikSaatler || {};
  const g = h[String(haftaninGunu(iso))];
  return g && g.acik && g.bas && g.bit ? g : null;
}

/* Bir güne ait TÜM istisnalar (aynı güne birden fazla eklenebilir) */
export function gunIstisnalari(cfg, iso) {
  return (cfg.istisnalar || []).filter((x) => x && x.tarih === iso);
}

/* Günün meşgul aralıkları (hh:mm) — istisnalar EKLENİR, ezmez.

   durum:
     'acik'   → okulun ÜSTÜNE ek meşguliyet (nöbet, toplantı…)  ← varsayılan
     'yalniz' → o gün yalnız bu saatler; haftalık okul saatlerini değiştirir
     'tumgun' → tüm gün meşgul
     'kapali' → izin: haftalık okul saatleri düşer (ek meşguliyetler yine geçerli) */
export function gunBilgiTemel(cfg, iso) {
  const istler = gunIstisnalari(cfg, iso);
  const ad = (x) => x.kategori || x.not || 'Özel gün';
  const varsayilanSaat = gunSaati(cfg, iso);
  const tat = (cfg.tatiller || []).find((t) => iso >= t.baslangic && iso <= t.bitis);

  const tumgun = istler.find((x) => x.durum === 'tumgun');
  if (tumgun) {
    return { iso, tip: 'istisna', acik: true, not: tumgun.not, kategori: tumgun.kategori, etiket: ad(tumgun),
      bas: '00:00', bit: '23:59',
      notlar: [tumgun.not].filter(Boolean),
      bloklar: [{ bas: '00:00', bit: '23:59', etiket: ad(tumgun), not: tumgun.not, tur: 'istisna' }] };
  }

  const yalnizlar = istler.filter((x) => x.durum === 'yalniz' && x.bas && x.bit);
  const izin = istler.find((x) => x.durum === 'kapali');
  const ekler = istler.filter((x) => x.durum === 'acik');

  let temel = [];
  if (yalnizlar.length) {
    temel = yalnizlar.map((x) => ({ bas: x.bas, bit: x.bit, etiket: ad(x), not: x.not, tur: 'istisna' }));
  } else if (!izin && !tat && varsayilanSaat) {
    temel = [{ bas: varsayilanSaat.bas, bit: varsayilanSaat.bit, etiket: 'Okul', tur: 'calisma' }];
  }

  const ekBloklar = ekler.map((x) => ({
    bas: x.bas || (varsayilanSaat ? varsayilanSaat.bas : '09:00'),
    bit: x.bit || (varsayilanSaat ? varsayilanSaat.bit : '16:00'),
    etiket: ad(x), not: x.not, tur: 'istisna'
  }));

  const bloklar = [...temel, ...ekBloklar].sort((a, b) => a.bas.localeCompare(b.bas));
  const oncelik = ekler[0] || yalnizlar[0] || izin;

  let tip, etiket;
  if (istler.length) {
    tip = (!bloklar.length && izin) ? 'izin' : 'istisna';
    etiket = ad(oncelik || istler[0]);
  } else if (tat) {
    tip = 'tatil'; etiket = tat.ad;
  } else if (!varsayilanSaat) {
    tip = 'haftasonu'; etiket = 'Bugün okul yok';
  } else {
    tip = 'acik'; etiket = 'Okul';
  }

  return {
    iso, tip, etiket, bloklar,
    // Gün notları herkese açık. Blok üretmeyen kayıtlar da (izin gibi) dahil.
    notlar: [...new Set([...istler.map((x) => x.not), tat && tat.not].filter(Boolean))],
    acik: bloklar.length > 0,
    bas: bloklar.length ? bloklar[0].bas : undefined,
    bit: bloklar.length ? bloklar[bloklar.length - 1].bit : undefined,
    not: (oncelik && oncelik.not) || (tat && tat.not),
    kategori: oncelik && oncelik.kategori
  };
}

/* Günün gerçek (Date'li) meşgul aralıkları */
export function gunBilgi(cfg, iso) {
  const g = { ...gunBilgiTemel(cfg, iso) };
  const araliklar = [];
  for (const b of g.bloklar || []) {
    if (b.bas && b.bit) araliklar.push({
      bas: an(cfg, iso, b.bas), bit: an(cfg, iso, b.bit),
      etiket: b.etiket || 'Okul', not: b.not || '', tur: b.tur || 'calisma'
    });
  }
  araliklar.sort((a, b) => a.bas - b.bas);
  g.araliklar = araliklar;
  if (araliklar.length) {
    g.acik = true;
    g.basYerel = yerelSaatStr(araliklar[0].bas);
    g.bitYerel = yerelSaatStr(araliklar.reduce((t, x) => (x.bit > t ? x.bit : t), araliklar[0].bit));
    g.aralikMetni = araliklar.map((x) => `${yerelSaatStr(x.bas)}–${yerelSaatStr(x.bit)}`).join(', ');
  }
  return g;
}

/* ── uyku penceresi (gece) ──
   Yalnız GERİ SAYIM ve anlık durum hesabına katılır; aylık takvim ve
   gün çizelgesi etkilenmez. */
export function uykuAralik(cfg, iso) {
  const u = cfg.uyku;
  if (!u || u.acik === false || !u.bas || !u.bit) return null;
  const bas = an(cfg, iso, u.bas);
  const bit = an(cfg, iso, u.bit);
  if (!(bit > bas)) return null; // gece yarısını aşan pencere desteklenmez
  return { bas, bit, uyku: true, etiket: u.etiket || 'Uyku' };
}

/* günün meşgul + uyku aralıkları (geri sayım için) */
function sayimListesi(cfg, iso) {
  const uy = uykuAralik(cfg, iso);
  const l = gunBilgi(cfg, iso).araliklar;
  return (uy ? [...l, uy] : l).slice().sort((a, b) => a.bas - b.bas);
}

/* uyku dahil bir sonraki meşgul aralık (gün aşan) */
function sonrakiSayim(cfg, now, limit = 400) {
  const bas = bugunISO(cfg, now);
  for (let i = 0; i < limit; i++) {
    const iso = gunEkle(bas, i);
    const a = sayimListesi(cfg, iso).find((x) => x.bas > now);
    if (a) return { iso, an: a.bas, aralik: a };
  }
  return null;
}

export function durum(cfg, now = new Date()) {
  const iso = bugunISO(cfg, now);
  const bugun = gunBilgi(cfg, iso);
  const sayim = sayimListesi(cfg, iso);
  const suan = sayim.find((x) => now >= x.bas && now < x.bit);
  const sonrakiBugun = sayim.find((x) => x.bas > now);
  const uykuda = !!(suan && suan.uyku);
  const mesgulSuan = !!suan;
  const calisiyor = mesgulSuan && !suan.uyku;
  const sonraki = mesgulSuan ? null : sonrakiSayim(cfg, now);
  return {
    acik: calisiyor, calisiyor, uykuda,
    musait: cfg.ters ? !mesgulSuan : mesgulSuan,
    bugunSonraCalisma: !mesgulSuan && !!sonrakiBugun && !sonrakiBugun.uyku,
    bugun, bugunISO: iso,
    basAn: sonrakiBugun ? sonrakiBugun.bas : (bugun.araliklar[0] ? bugun.araliklar[0].bas : null),
    bitisAn: suan ? suan.bit : null,
    suanAralik: suan || null, sonraki, now,
    kalanMs: suan ? suan.bit - now
      : sonrakiBugun ? sonrakiBugun.bas - now
      : sonraki ? sonraki.an - now : 0
  };
}

/* ── ay ızgarası (Pazartesi başlangıçlı, en fazla 6 hafta) ─────────── */

export function ayIzgarasi(cfg, yil, ay) {       // ay: 0-11
  const ilk = `${yil}-${String(ay + 1).padStart(2, '0')}-01`;
  const kaydir = (haftaninGunu(ilk) + 6) % 7;
  const gunSayisi = new Date(Date.UTC(yil, ay + 1, 0)).getUTCDate();
  const hucreler = [];
  for (let i = 0; i < 42; i++) {
    const gun = i - kaydir + 1;
    if (gun < 1 || gun > gunSayisi) { hucreler.push({ bos: true, key: 'b' + i }); continue; }
    const iso = `${yil}-${String(ay + 1).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
    hucreler.push({ bos: false, key: iso, gun, iso, bilgi: gunBilgi(cfg, iso) });
  }
  while (hucreler.length > 35 && hucreler.slice(35).every((h) => h.bos)) hucreler.length = 35;
  return hucreler;
}

/* ── metin üretimleri ──────────────────────────────────────────────── */

export function gunSirasi() { return [1, 2, 3, 4, 5, 6, 0]; }

/* "Pzt–Cum 09:00–16:00 · Cmt 10:00–14:00" — aynı saatli günleri gruplar */
export function haftalikOzet(cfg) {
  const k = cfg.mesajlar.gunlerKisa;
  const h = cfg.haftalikSaatler || {};
  const idx = (g) => (g === 0 ? 6 : g - 1);
  const acik = gunSirasi().filter((g) => h[String(g)] && h[String(g)].acik);
  if (!acik.length) return 'Hiçbir gün okul yok';
  const gruplar = [];
  for (const g of acik) {
    const s = h[String(g)];
    const son = gruplar[gruplar.length - 1];
    if (son && son.bas === s.bas && son.bit === s.bit && idx(g) === idx(son.gunler[son.gunler.length - 1]) + 1) son.gunler.push(g);
    else gruplar.push({ bas: s.bas, bit: s.bit, gunler: [g] });
  }
  return gruplar.map((gr) => {
    const ad = gr.gunler.length > 2
      ? `${k[idx(gr.gunler[0])]}–${k[idx(gr.gunler[gr.gunler.length - 1])]}`
      : gr.gunler.map((g) => k[idx(g)]).join(', ');
    return `${ad} ${gr.bas}–${gr.bit}`;
  }).join(' · ');
}

export function gunlerMetni(cfg) {
  const k = cfg.mesajlar.gunlerKisa;
  const h = cfg.haftalikSaatler || {};
  const sirali = gunSirasi().filter((g) => h[String(g)] && h[String(g)].acik);
  if (!sirali.length) return '—';
  const idx = (g) => (g === 0 ? 6 : g - 1);
  const ardisik = sirali.every((g, i) => i === 0 || idx(g) === idx(sirali[i - 1]) + 1);
  return ardisik && sirali.length > 2
    ? `${k[idx(sirali[0])]}–${k[idx(sirali[sirali.length - 1])]}`
    : sirali.map((g) => k[idx(g)]).join(', ');
}

export function tarihMetni(cfg, iso, uzun = false) {
  const [y, m, g] = iso.split('-').map(Number);
  const ad = cfg.mesajlar.aylar[m - 1];
  const gunAd = cfg.mesajlar.gunler[haftaninGunu(iso)];
  return uzun ? `${g} ${ad} ${y}, ${gunAd}` : `${g} ${ad} ${gunAd}`;
}

export function geriSayim(ms) {
  if (ms <= 0) return '';
  const dk = Math.floor(ms / 60000), s = Math.floor(dk / 60), g = Math.floor(s / 24);
  if (g >= 1) return `${g} gün ${s % 24} saat`;
  if (s >= 1) return `${s} saat ${dk % 60} dakika`;
  return `${dk} dakika`;
}

/* Durum cümlesi — kart ve meta aynı metni kullansın diye tek yerde. */
export function altMetinUret(cfg, d) {
  const m = cfg.mesajlar || {};
  const mesaiBitti = !d.calisiyor && !d.bugunSonraCalisma && d.bugun.araliklar.length > 0;
  if (d.uykuda) return m.uyku || 'Gece uykusu';
  if (d.calisiyor) return (m.mesgulAlt || '{bit}’de okul bitiyor').replace('{bit}', yerelSaatStr(d.bitisAn));
  if (d.bugunSonraCalisma) return (m.musaitOncesi || '{bas}’a kadar müsaitim').replace('{bas}', yerelSaatStr(d.basAn));
  if (mesaiBitti) return m.mesaiBitti || 'Okul bitti — müsaitim';
  if (d.bugun.tip === 'tatil') return (m.musaitTatil || '{tatilAd} — tüm gün müsaitim').replace('{tatilAd}', d.bugun.etiket);
  if (d.bugun.tip === 'haftasonu') return m.haftaSonu || 'Hafta sonu — müsaitim';
  return m.musaitTumGun || 'Bugün okul yok, tüm gün müsaitim';
}

/* ── dinamik SEO ───────────────────────────────────────────────────── */

function metaYaz(attr, ad, deger) {
  let el = document.head.querySelector(`meta[${attr}="${ad}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, ad); document.head.appendChild(el); }
  el.setAttribute('content', deger);
}

export function seoUygula(cfg, d) {
  const m = cfg.mesajlar, s = cfg.seo;
  const durumMetni = d.musait ? m.musait : m.mesgul;
  let sonrakiMetin = '';
  if (d.uykuda) sonrakiMetin = `${yerelSaatStr(d.bitisAn)}'dan sonra tekrar müsaitim.`;
  else if (d.calisiyor) sonrakiMetin = `${yerelSaatStr(d.bitisAn)}'de müsait olacağım.`;
  else if (d.bugunSonraCalisma) sonrakiMetin = `${yerelSaatStr(d.basAn)}'a kadar müsaitim.`;
  else if (d.sonraki) sonrakiMetin = `Sonraki okul: ${tarihMetni(cfg, d.sonraki.iso)} ${yerelSaatStr(d.sonraki.an)}.`;

  const baslik = ((window.matchMedia('(max-width: 768px)').matches
    ? s.baslikKalibiMobil
    : s.baslikKalibi) || '{durum} · {ad}')
    .replace('{durum}', durumMetni).replace('{ad}', cfg.kisi.ad);
  const aciklama = (s.aciklamaKalibi || '')
    .replace('{ad}', cfg.kisi.ad)
    .replace('{saatler}', haftalikOzet(cfg))
    .replace('{gunler}', gunlerMetni(cfg))
    .replace('{sonraki}', sonrakiMetin);

  document.title = baslik;
  metaYaz('name', 'description', aciklama);
  jsonLd(cfg, aciklama);
  return { baslik, aciklama };
}

function jsonLd(cfg, aciklama) {
  const gunAdi = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const h = cfg.haftalikSaatler || {};
  const veri = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: cfg.kisi.ad,
    description: aciklama,
    url: cfg.kisi.sosyalUrl,
    sameAs: cfg.kisi.sosyalUrl ? [cfg.kisi.sosyalUrl] : undefined,
    hoursAvailable: Object.keys(h).filter((k) => h[k] && h[k].acik).map((k) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'https://schema.org/' + gunAdi[Number(k)],
      opens: h[k].bas, closes: h[k].bit
    }))
  };
  let el = document.getElementById('bk-jsonld');
  if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'bk-jsonld'; document.head.appendChild(el); }
  el.textContent = JSON.stringify(veri);
}

/* ── .ics üretimi (takvime ekleme/abone olma) ──────────────────────── */

const utc = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const kacir = (s) => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');

export function icsUret(cfg, { baslangicISO, ayAdedi = 12, tekGun = null } = {}) {
  const bas = tekGun || baslangicISO || bugunISO(cfg);
  const son = tekGun || gunEkle(bas, Math.round(ayAdedi * 30.5));
  const satir = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'PRODID:-//' + kacir(cfg.kisi.ad) + '//Musaitlik//TR',
    'X-WR-CALNAME:' + kacir(cfg.kisi.ad + ' — Okul saatleri'),
    'X-WR-TIMEZONE:' + cfg.saat.kaynakSaatDilimi
  ];
  for (let iso = bas; iso <= son; iso = gunEkle(iso, 1)) {
    const g = gunBilgi(cfg, iso);
    if (!g.acik || !g.araliklar.length) continue;
    for (const ar of g.araliklar) {
      satir.push(
        'BEGIN:VEVENT',
        'UID:' + iso + '-' + (+ar.bas) + '-musaitlik@' + (cfg.kisi.site || 'local'),
        'DTSTAMP:' + utc(new Date()),
        'DTSTART:' + utc(ar.bas),
        'DTEND:' + utc(ar.bit),
        'SUMMARY:' + kacir(cfg.kisi.ad + (cfg.ters ? ' okulda — müsait değil' : ' müsait')),
        'DESCRIPTION:' + kacir(`${ar.etiket || 'Okul'}${g.not ? ' · ' + g.not : ''}`),
        'TRANSP:OPAQUE', 'STATUS:CONFIRMED',
        'URL:' + (cfg.kisi.sosyalUrl || ''),
        'END:VEVENT'
      );
    }
  }
  satir.push('END:VCALENDAR');
  return satir.join('\r\n');
}

export function icsIndir(cfg, opts) {
  const blob = new Blob([icsUret(cfg, opts)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'calisma-saatleri' + (opts && opts.tekGun ? '-' + opts.tekGun : '') + '.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
