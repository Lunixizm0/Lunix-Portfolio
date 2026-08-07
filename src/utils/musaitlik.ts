/* musaitlik.ts — müsaitlik motoru (takvim.js + site.js portu).
   Tüm veri config'den gelir; burada yalnız hesap var. Saatler kaynak saat
   diliminde (Europe/Istanbul, sabit ofset) tanımlanır, ziyaretçiye kendi
   saat diliminde gösterilir. DOM/SEO katmanı yok — saf TS. */

export type MusaitlikConfig = {
  surum?: number;
  kisi?: {
    ad?: string;
    unvan?: string;
    kisaTanim?: string;
    site?: string;
    sosyalUrl?: string;
    sosyalEtiket?: string;
  };
  ters?: boolean;
  saat?: {
    kaynakSaatDilimi?: string;
    kaynakOfset?: string;
    ziyaretciSaatineCevir?: boolean;
  };
  haftalikSaatler?: Record<string, { acik: boolean; bas: string; bit: string }>;
  tatiller?: Array<{
    baslangic: string;
    bitis: string;
    ad?: string;
    not?: string;
  }>;
  istisnalar?: Array<{
    tarih: string;
    durum: string;
    kategori?: string;
    not?: string;
    bas?: string;
    bit?: string;
  }>;
  cizelge?: { bas: string; saat: number };
  uyku?: { acik: boolean; bas: string; bit: string; etiket?: string };
  mesajlar?: {
    musait?: string;
    mesgul?: string;
    mesgulAlt?: string;
    mesaiBitti?: string;
    uyku?: string;
    haftaSonu?: string;
    musaitOncesi?: string;
    musaitTumGun?: string;
    musaitTatil?: string;
    calisiyor?: string;
    calismiyor?: string;
    gunler?: string[];
    gunlerKisa?: string[];
    aylar?: string[];
  };
  goruntulenme?: number;
};

export type Blok = {
  bas: string;
  bit: string;
  etiket: string;
  not?: string;
  tur: string;
};

export type Aralik = {
  bas: Date;
  bit: Date;
  etiket: string;
  not: string;
  tur: string;
  uyku?: boolean;
};

export type GunBilgi = {
  iso: string;
  tip: string;
  etiket: string;
  bloklar: Blok[];
  notlar: string[];
  acik: boolean;
  bas?: string;
  bit?: string;
  not?: string;
  kategori?: string;
  araliklar: Aralik[];
  basYerel?: string;
  bitYerel?: string;
  aralikMetni?: string;
};

export type SonrakiSayim = { iso: string; an: Date; aralik: Aralik };

export type Durum = {
  acik: boolean;
  calisiyor: boolean;
  uykuda: boolean;
  musait: boolean;
  bugunSonraCalisma: boolean;
  bugun: GunBilgi;
  bugunISO: string;
  basAn: Date | null;
  bitisAn: Date | null;
  suanAralik: Aralik | null;
  sonraki: SonrakiSayim | null;
  now: Date;
  kalanMs: number;
};

export type AyHucresi =
  | {
      bos: true;
      key: string;
      gun?: undefined;
      iso?: undefined;
      bilgi?: undefined;
    }
  | { bos: false; key: string; gun: number; iso: string; bilgi: GunBilgi };

export type KartVerisi = {
  ad: string;
  unvan: string;
  bugunTarih: string;
  durumMetni: string;
  geriSayimCumle: string;
  altMetin: string;
  tzNot: string;
  goruntulenme: string;
  durumRenk: string;
};

const CACHE_KEY = "bk-musaitlik-config-v1";

export async function configYukle(
  yol = "/musaitlik.json"
): Promise<MusaitlikConfig> {
  try {
    const r = await fetch(yol, { cache: "no-store" });
    if (!r.ok) throw new Error(String(r.status));
    const cfg = (await r.json()) as MusaitlikConfig;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cfg));
    } catch {
      // depolama engelliyse sessizce geç
    }
    return cfg;
  } catch (e) {
    try {
      const c = localStorage.getItem(CACHE_KEY);
      if (c) return JSON.parse(c) as MusaitlikConfig;
    } catch {
      // cache bozuksa aşağı at
    }
    throw new Error("müsaitlik verisi okunamadı");
  }
}

/* ── tarih yardımcıları ───────────────────────────────────────────── */

const isoBicim = (tz: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export function bugunISO(cfg: MusaitlikConfig, now = new Date()): string {
  return isoBicim(cfg.saat?.kaynakSaatDilimi || "Europe/Istanbul").format(now);
}

export function haftaninGunu(iso: string): number {
  // 0=Pazar … 6=Cumartesi
  return new Date(iso + "T12:00:00Z").getUTCDay();
}

export function gunEkle(iso: string, n: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function an(cfg: MusaitlikConfig, iso: string, hhmm: string): Date {
  // kaynak saat dilimini gerçek ana çevir
  return new Date(`${iso}T${hhmm}:00${cfg.saat?.kaynakOfset || "+03:00"}`);
}

export function yerelSaatStr(d: Date): string {
  return d.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ziyaretciSaatDilimi(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
}

export function saatKaymasiVar(
  cfg: MusaitlikConfig,
  ornekISO: string
): boolean {
  const d = an(cfg, ornekISO, "12:00");
  return yerelSaatStr(d) !== "12:00";
}

/* ── gün tipi ─────────────────────────────────────────────────────── */

export function gunSaati(
  cfg: MusaitlikConfig,
  iso: string
): { acik: boolean; bas: string; bit: string } | null {
  const h = cfg.haftalikSaatler || {};
  const g = h[String(haftaninGunu(iso))];
  return g && g.acik && g.bas && g.bit ? g : null;
}

export function gunIstisnalari(
  cfg: MusaitlikConfig,
  iso: string
): NonNullable<MusaitlikConfig["istisnalar"]> {
  return (cfg.istisnalar || []).filter(x => x && x.tarih === iso);
}

/* Günün meşgul aralıkları (hh:mm) — istisnalar EKLENİR, ezmez.
   durum:
     'acik'   → okulun ÜSTÜNE ek meşguliyet
     'yalniz' → o gün yalnız bu saatler
     'tumgun' → tüm gün meşgul
     'kapali' → izin: haftalık saatler düşer */
export function gunBilgiTemel(
  cfg: MusaitlikConfig,
  iso: string
): Omit<GunBilgi, "araliklar" | "basYerel" | "bitYerel" | "aralikMetni"> {
  const istler = gunIstisnalari(cfg, iso);
  const ad = (x: { kategori?: string; not?: string }) =>
    x.kategori || x.not || "Özel gün";
  const varsayilanSaat = gunSaati(cfg, iso);
  const tat = (cfg.tatiller || []).find(
    t => iso >= t.baslangic && iso <= t.bitis
  );

  const tumgun = istler.find(x => x.durum === "tumgun");
  if (tumgun) {
    return {
      iso,
      tip: "istisna",
      acik: true,
      not: tumgun.not,
      kategori: tumgun.kategori,
      etiket: ad(tumgun),
      bas: "00:00",
      bit: "23:59",
      notlar: [tumgun.not].filter((n): n is string => Boolean(n)),
      bloklar: [
        {
          bas: "00:00",
          bit: "23:59",
          etiket: ad(tumgun),
          not: tumgun.not,
          tur: "istisna",
        },
      ],
    };
  }

  const yalnizlar = istler.filter(x => x.durum === "yalniz" && x.bas && x.bit);
  const izin = istler.find(x => x.durum === "kapali");
  const ekler = istler.filter(x => x.durum === "acik");

  let temel: Blok[] = [];
  if (yalnizlar.length) {
    temel = yalnizlar.map(x => ({
      bas: x.bas as string,
      bit: x.bit as string,
      etiket: ad(x),
      not: x.not,
      tur: "istisna",
    }));
  } else if (!izin && !tat && varsayilanSaat) {
    temel = [
      {
        bas: varsayilanSaat.bas,
        bit: varsayilanSaat.bit,
        etiket: "Okul",
        tur: "calisma",
      },
    ];
  }

  const ekBloklar: Blok[] = ekler.map(x => ({
    bas: x.bas || (varsayilanSaat ? varsayilanSaat.bas : "09:00"),
    bit: x.bit || (varsayilanSaat ? varsayilanSaat.bit : "16:00"),
    etiket: ad(x),
    not: x.not,
    tur: "istisna",
  }));

  const bloklar = [...temel, ...ekBloklar].sort((a, b) =>
    a.bas.localeCompare(b.bas)
  );
  const oncelik = ekler[0] || yalnizlar[0] || izin;

  let tip: string;
  let etiket: string;
  if (istler.length) {
    tip = !bloklar.length && izin ? "izin" : "istisna";
    etiket = ad(oncelik || istler[0]);
  } else if (tat) {
    tip = "tatil";
    etiket = tat.ad || "Tatil";
  } else if (!varsayilanSaat) {
    tip = "haftasonu";
    etiket = "Bugün okul yok";
  } else {
    tip = "acik";
    etiket = "Okul";
  }

  return {
    iso,
    tip,
    etiket,
    bloklar,
    notlar: [
      ...new Set(
        [...istler.map(x => x.not), tat && tat.not].filter((n): n is string =>
          Boolean(n)
        )
      ),
    ],
    acik: bloklar.length > 0,
    bas: bloklar.length ? bloklar[0].bas : undefined,
    bit: bloklar.length ? bloklar[bloklar.length - 1].bit : undefined,
    not: (oncelik && oncelik.not) || (tat && tat.not),
    kategori: oncelik && oncelik.kategori,
  };
}

/* Günün gerçek (Date'li) meşgul aralıkları */
export function gunBilgi(cfg: MusaitlikConfig, iso: string): GunBilgi {
  const g: GunBilgi = {
    ...gunBilgiTemel(cfg, iso),
    araliklar: [],
  };
  const araliklar: Aralik[] = [];
  for (const b of g.bloklar || []) {
    if (b.bas && b.bit) {
      araliklar.push({
        bas: an(cfg, iso, b.bas),
        bit: an(cfg, iso, b.bit),
        etiket: b.etiket || "Okul",
        not: b.not || "",
        tur: b.tur || "calisma",
      });
    }
  }
  araliklar.sort((a, b) => a.bas.getTime() - b.bas.getTime());
  g.araliklar = araliklar;
  if (araliklar.length) {
    g.acik = true;
    g.basYerel = yerelSaatStr(araliklar[0].bas);
    g.bitYerel = yerelSaatStr(
      araliklar.reduce((t, x) => (x.bit > t ? x.bit : t), araliklar[0].bit)
    );
    g.aralikMetni = araliklar
      .map(x => `${yerelSaatStr(x.bas)}–${yerelSaatStr(x.bit)}`)
      .join(", ");
  }
  return g;
}

/* ── uyku penceresi (gece) ──
   Yalnız geri sayım ve anlık durum hesabına katılır; takvim ve çizelge
   etkilenmez. */
export function uykuAralik(cfg: MusaitlikConfig, iso: string): Aralik | null {
  const u = cfg.uyku;
  if (!u || u.acik === false || !u.bas || !u.bit) return null;
  const bas = an(cfg, iso, u.bas);
  const bit = an(cfg, iso, u.bit);
  if (!(bit > bas)) return null; // gece yarısını aşan pencere desteklenmez
  return {
    bas,
    bit,
    uyku: true,
    etiket: u.etiket || "Uyku",
    not: "",
    tur: "uyku",
  };
}

function sayimListesi(cfg: MusaitlikConfig, iso: string): Aralik[] {
  const uy = uykuAralik(cfg, iso);
  const l = gunBilgi(cfg, iso).araliklar;
  return (uy ? [...l, uy] : l)
    .slice()
    .sort((a, b) => a.bas.getTime() - b.bas.getTime());
}

/* uyku dahil bir sonraki meşgul aralık (gün aşan) */
function sonrakiSayim(
  cfg: MusaitlikConfig,
  now: Date,
  limit = 400
): SonrakiSayim | null {
  const bas = bugunISO(cfg, now);
  for (let i = 0; i < limit; i++) {
    const iso = gunEkle(bas, i);
    const a = sayimListesi(cfg, iso).find(x => x.bas > now);
    if (a) return { iso, an: a.bas, aralik: a };
  }
  return null;
}

export function durum(cfg: MusaitlikConfig, now = new Date()): Durum {
  const iso = bugunISO(cfg, now);
  const bugun = gunBilgi(cfg, iso);
  const sayim = sayimListesi(cfg, iso);
  const suan = sayim.find(x => now >= x.bas && now < x.bit);
  const sonrakiBugun = sayim.find(x => x.bas > now);
  const uykuda = !!(suan && suan.uyku);
  const mesgulSuan = !!suan;
  const calisiyor = mesgulSuan && !suan.uyku;
  const sonraki = mesgulSuan ? null : sonrakiSayim(cfg, now);
  return {
    acik: calisiyor,
    calisiyor,
    uykuda,
    musait: cfg.ters ? !mesgulSuan : mesgulSuan,
    bugunSonraCalisma: !mesgulSuan && !!sonrakiBugun && !sonrakiBugun.uyku,
    bugun,
    bugunISO: iso,
    basAn: sonrakiBugun
      ? sonrakiBugun.bas
      : bugun.araliklar[0]
        ? bugun.araliklar[0].bas
        : null,
    bitisAn: suan ? suan.bit : null,
    suanAralik: suan || null,
    sonraki,
    now,
    kalanMs: suan
      ? suan.bit.getTime() - now.getTime()
      : sonrakiBugun
        ? sonrakiBugun.bas.getTime() - now.getTime()
        : sonraki
          ? sonraki.an.getTime() - now.getTime()
          : 0,
  };
}

/* ── ay ızgarası (Pazartesi başlangıçlı, en fazla 6 hafta) ─────────── */

export function ayIzgarasi(
  cfg: MusaitlikConfig,
  yil: number,
  ay: number // 0-11
): AyHucresi[] {
  const ilk = `${yil}-${String(ay + 1).padStart(2, "0")}-01`;
  const kaydir = (haftaninGunu(ilk) + 6) % 7;
  const gunSayisi = new Date(Date.UTC(yil, ay + 1, 0)).getUTCDate();
  const hucreler: AyHucresi[] = [];
  for (let i = 0; i < 42; i++) {
    const gun = i - kaydir + 1;
    if (gun < 1 || gun > gunSayisi) {
      hucreler.push({ bos: true, key: "b" + i });
      continue;
    }
    const iso = `${yil}-${String(ay + 1).padStart(2, "0")}-${String(gun).padStart(2, "0")}`;
    hucreler.push({
      bos: false,
      key: iso,
      gun,
      iso,
      bilgi: gunBilgi(cfg, iso),
    });
  }
  while (hucreler.length > 35 && hucreler.slice(35).every(h => h.bos)) {
    hucreler.length = 35;
  }
  return hucreler;
}

/* ── metin üretimleri ──────────────────────────────────────────────── */

export function gunSirasi(): number[] {
  return [1, 2, 3, 4, 5, 6, 0];
}

/* "Pzt–Cum 09:00–16:00 · Cmt 10:00–14:00" — aynı saatli günleri gruplar */
export function haftalikOzet(cfg: MusaitlikConfig): string {
  const k = cfg.mesajlar?.gunlerKisa || [];
  const h = cfg.haftalikSaatler || {};
  const idx = (g: number) => (g === 0 ? 6 : g - 1);
  const acik = gunSirasi().filter(g => h[String(g)] && h[String(g)].acik);
  if (!acik.length) return "Hiçbir gün okul yok";
  const gruplar: Array<{ bas: string; bit: string; gunler: number[] }> = [];
  for (const g of acik) {
    const s = h[String(g)];
    const son = gruplar[gruplar.length - 1];
    if (
      son &&
      son.bas === s.bas &&
      son.bit === s.bit &&
      idx(g) === idx(son.gunler[son.gunler.length - 1]) + 1
    ) {
      son.gunler.push(g);
    } else {
      gruplar.push({ bas: s.bas, bit: s.bit, gunler: [g] });
    }
  }
  return gruplar
    .map(gr => {
      const ad =
        gr.gunler.length > 2
          ? `${k[idx(gr.gunler[0])]}–${k[idx(gr.gunler[gr.gunler.length - 1])]}`
          : gr.gunler.map(g => k[idx(g)]).join(", ");
      return `${ad} ${gr.bas}–${gr.bit}`;
    })
    .join(" · ");
}

export function gunlerMetni(cfg: MusaitlikConfig): string {
  const k = cfg.mesajlar?.gunlerKisa || [];
  const h = cfg.haftalikSaatler || {};
  const sirali = gunSirasi().filter(g => h[String(g)] && h[String(g)].acik);
  if (!sirali.length) return "—";
  const idx = (g: number) => (g === 0 ? 6 : g - 1);
  const ardisik = sirali.every(
    (g, i) => i === 0 || idx(g) === idx(sirali[i - 1]) + 1
  );
  return ardisik && sirali.length > 2
    ? `${k[idx(sirali[0])]}–${k[idx(sirali[sirali.length - 1])]}`
    : sirali.map(g => k[idx(g)]).join(", ");
}

export function tarihMetni(
  cfg: MusaitlikConfig,
  iso: string,
  uzun = false
): string {
  const [y, m, g] = iso.split("-").map(Number);
  const ad = cfg.mesajlar?.aylar ? cfg.mesajlar.aylar[m - 1] : String(m);
  const gunAd = cfg.mesajlar?.gunler
    ? cfg.mesajlar.gunler[haftaninGunu(iso)]
    : "";
  return uzun ? `${g} ${ad} ${y}, ${gunAd}` : `${g} ${ad} ${gunAd}`;
}

export function geriSayim(ms: number): string {
  if (ms <= 0) return "";
  const dk = Math.floor(ms / 60000);
  const s = Math.floor(dk / 60);
  const g = Math.floor(s / 24);
  if (g >= 1) return `${g} gün ${s % 24} saat`;
  if (s >= 1) return `${s} saat ${dk % 60} dakika`;
  return `${dk} dakika`;
}

/* Durum cümlesi — kart ve meta aynı metni kullansın diye tek yerde. */
export function altMetinUret(cfg: MusaitlikConfig, d: Durum): string {
  const m = cfg.mesajlar || {};
  const mesaiBitti =
    !d.calisiyor && !d.bugunSonraCalisma && d.bugun.araliklar.length > 0;
  if (d.uykuda) return m.uyku || "Gece uykusu";
  if (d.calisiyor)
    return (m.mesgulAlt || "{bit}’de okul bitiyor").replace(
      "{bit}",
      yerelSaatStr(d.bitisAn as Date)
    );
  if (d.bugunSonraCalisma)
    return (m.musaitOncesi || "{bas}’a kadar müsaitim").replace(
      "{bas}",
      yerelSaatStr(d.basAn as Date)
    );
  if (mesaiBitti) return m.mesaiBitti || "Okul bitti — müsaitim";
  if (d.bugun.tip === "tatil")
    return (m.musaitTatil || "{tatilAd} — tüm gün müsaitim").replace(
      "{tatilAd}",
      d.bugun.etiket
    );
  if (d.bugun.tip === "haftasonu")
    return m.haftaSonu || "Hafta sonu — müsaitim";
  return m.musaitTumGun || "Bugün okul yok, tüm gün müsaitim";
}

/* ── kart verisi (site.js Motor.kartaVer portu) ────────────────────── */

export function kartVerisi(cfg: MusaitlikConfig, d: Durum): KartVerisi {
  const m = cfg.mesajlar;
  const tur = d.musait ? "musait" : d.uykuda ? "uyku" : "mesgul";
  const g = geriSayim(d.kalanMs);
  let geriSayimCumle = "";
  if (g)
    geriSayimCumle =
      tur === "mesgul"
        ? `Kalan iş: ${g}`
        : tur === "uyku"
          ? `Uyku: ${g}`
          : `Müsaitim: ${g}`;

  const tz = ziyaretciSaatDilimi();
  const kayar = saatKaymasiVar(cfg, bugunISO(cfg, d.now));

  return {
    ad: cfg.kisi?.ad || "",
    unvan: cfg.kisi?.unvan || "",
    bugunTarih: tarihMetni(cfg, d.bugunISO),
    durumMetni: d.musait
      ? m?.musait || "ŞU AN MÜSAİTİM"
      : m?.mesgul || "ŞU AN MÜSAİT DEĞİLİM",
    geriSayimCumle,
    altMetin: altMetinUret(cfg, d),
    tzNot: kayar
      ? `Saatler senin saat dilimine göre${tz ? ` (${tz})` : ""}`
      : "Saatler Türkiye saatiyle",
    goruntulenme: `${cfg.goruntulenme || 0} görüntülenme`,
    durumRenk: d.musait
      ? "#1ed760"
      : d.uykuda
        ? "rgba(255,255,255,.55)"
        : "#ff453a",
  };
}

/* ── .ics üretimi ──────────────────────────────────────────────────── */

const utc = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
const kacir = (s: string) =>
  String(s || "")
    .replace(/([,;\\])/g, "\\$1")
    .replace(/\n/g, "\\n");

export function icsUret(
  cfg: MusaitlikConfig,
  {
    baslangicISO,
    ayAdedi = 12,
    tekGun = null,
  }: { baslangicISO?: string; ayAdedi?: number; tekGun?: string | null } = {}
): string {
  const bas = tekGun || baslangicISO || bugunISO(cfg);
  const son = tekGun || gunEkle(bas, Math.round(ayAdedi * 30.5));
  const satir = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "PRODID:-//" + kacir(cfg.kisi?.ad || "") + "//Musaitlik//TR",
    "X-WR-CALNAME:" + kacir((cfg.kisi?.ad || "") + " — Okul saatleri"),
    "X-WR-TIMEZONE:" + (cfg.saat?.kaynakSaatDilimi || "Europe/Istanbul"),
  ];
  for (let iso = bas; iso <= son; iso = gunEkle(iso, 1)) {
    const g = gunBilgi(cfg, iso);
    if (!g.acik || !g.araliklar.length) continue;
    for (const ar of g.araliklar) {
      satir.push(
        "BEGIN:VEVENT",
        "UID:" +
          iso +
          "-" +
          ar.bas.getTime() +
          "-musaitlik@" +
          (cfg.kisi?.site || "local"),
        "DTSTAMP:" + utc(new Date()),
        "DTSTART:" + utc(ar.bas),
        "DTEND:" + utc(ar.bit),
        "SUMMARY:" +
          kacir(
            cfg.kisi?.ad ||
              "" + (cfg.ters ? " okulda — müsait değil" : " müsait")
          ),
        "DESCRIPTION:" +
          kacir(`${ar.etiket || "Okul"}${g.not ? " · " + g.not : ""}`),
        "TRANSP:OPAQUE",
        "STATUS:CONFIRMED",
        "URL:" + (cfg.kisi?.sosyalUrl || ""),
        "END:VEVENT"
      );
    }
  }
  satir.push("END:VCALENDAR");
  return satir.join("\r\n");
}
