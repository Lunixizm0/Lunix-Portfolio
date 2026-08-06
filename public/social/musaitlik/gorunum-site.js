/* gorunum-site.js — Sayfa görünümü. Statik index.html'deki kabuklara (data-bk / #bk-*)
   canlı veriyi yazar. import: bilesen.js (mini DOM runtime) + site.js (Motor) + takvim.js. */

import { Bilesen, h, yamala, goster, stilYaz, metinYaz } from './bilesen.js';
import { Motor } from './site.js';
import {
  ayIzgarasi, gunBilgi, gunEkle, haftaninGunu, bugunISO,
  tarihMetni, yerelSaatStr, seoUygula, an
} from './takvim.js';

const dk = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export class SiteGorunum extends Bilesen {
  constructor(kok) {
    super();
    this.kok = kok;
    this.motor = new Motor(window.BK_CONFIG_YOLU || '/config.json');
    this._el = {
      nokta: kok.querySelector('#bk-nokta'),
      durumMetni: kok.querySelector('[data-bk="durumMetni"]'),
      ay: kok.querySelector('#bk-ay'),
      izgara: kok.querySelector('#bk-izgara'),
      cizelge: kok.querySelector('#bk-cizelge'),
      bloklar: kok.querySelector('#bk-blok-listesi'),
      notlar: kok.querySelector('#bk-gun-notlari'),
      cizelgeBos: kok.querySelector('#bk-cizelge-bos'),
      hata: kok.querySelector('#bk-hata'),
      seciliDurum: kok.querySelector('[data-bk="seciliDurum"]'),
      seciliTarih: kok.querySelector('[data-bk="seciliTarih"]')
    };
    this.state = { cfg: null, hata: '', yil: 0, ay: 0, seciliISO: null, durum: null };
    this._sonDurumTipi = '';
    this._bugunISO = '';
    this._tick = null;

    kok.querySelector('#bk-onceki').addEventListener('click', () => this.ayKaydir(-1));
    kok.querySelector('#bk-sonraki').addEventListener('click', () => this.ayKaydir(1));
    kok.querySelector('#bk-bugun').addEventListener('click', () => this.buguneDon());
    this._el.izgara.addEventListener('click', (e) => {
      const hucre = e.target.closest('[data-iso]');
      if (hucre) this.sec(hucre.dataset.iso);
    });
  }

  async kurulum() {
    try {
      const cfg = await this.motor.hazirla();
      const simdi = new Date();
      const bugun = bugunISO(cfg, simdi);
      const [y, m] = bugun.split('-').map(Number);
      this._bugunISO = bugun;
      this.setState({ cfg, yil: y, ay: m - 1, seciliISO: bugun, durum: this.motor.durum(simdi) });
    } catch (e) {
      this.setState({ hata: 'Müsaitlik verisi yüklenemedi. ' + (e && e.message ? e.message : '') });
    }
    this._tick = setInterval(() => this.tikla(), 1000);
  }

  /* ── her saniye: durum + geri sayım + renk; gün değişince tam çizim ── */

  tikla() {
    if (!this.state.cfg) return;
    const bugun = bugunISO(this.state.cfg);
    if (bugun !== this._bugunISO) {
      this._bugunISO = bugun;
      const [y, m] = bugun.split('-').map(Number);
      this.setState({ yil: y, ay: m - 1, seciliISO: bugun, durum: this.motor.durum() });
      return;
    }
    this.durumDomGuncelle();
  }

  durumDomGuncelle() {
    if (!this.state.cfg) return;
    const durum = this.motor.durum();
    this.state.durum = durum;
    const veri = this.motor.kartaVer(durum);
    metinYaz(this.kok, veri, [
      'ad', 'unvan', 'bugunTarih', 'durumMetni', 'geriSayimCumle', 'altMetin', 'tzNot', 'goruntulenme'
    ]);
    if (this._el.nokta) stilYaz(this._el.nokta, null, { background: veri.durumRenk, color: veri.durumRenk });
    if (this._el.durumMetni) stilYaz(this._el.durumMetni, null, { color: veri.durumRenk });

    const tip = durum.musait ? 'musait' : durum.uykuda ? 'uyku' : 'mesgul';
    if (tip !== this._sonDurumTipi) {
      this._sonDurumTipi = tip;
      try { seoUygula(this.state.cfg, durum); } catch (e) {}
    }
  }

  /* ── tam çizim (durum değişikliği / ay / gün seçimi) ── */

  render() {
    const { cfg, yil, ay, seciliISO, hata } = this.state;
    goster(this._el.hata, !!hata, 'block');
    if (hata) { this._el.hata.textContent = hata; return; }
    if (!cfg) return;

    this._el.ay.textContent = `${cfg.mesajlar.aylar[ay]} ${yil}`;
    yamala(this._el.izgara, this.takvimHucrleri(cfg, yil, ay, seciliISO));
    this.cizelgeCiz(cfg, seciliISO);
    this.durumDomGuncelle();
  }

  takvimHucrleri(cfg, yil, ay, seciliISO) {
    const kisa = cfg.mesajlar.gunlerKisa;
    const bugun = bugunISO(cfg);
    const hucreler = ayIzgarasi(cfg, yil, ay).map((huc) => {
      if (huc.bos) return h('div', { className: 'bk-hucre bk-hucre--bos', key: huc.key }, '');
      const b = huc.bilgi;
      let sinif = 'bk-hucre';
      if (b.tip === 'tatil') sinif += ' bk-hucre--tatil';
      else if (b.acik) sinif += ' bk-hucre--calisma';
      else sinif += ' bk-hucre--musait';
      if (huc.iso === bugun) sinif += ' bk-hucre--bugun';
      if (huc.iso === seciliISO) sinif += ' bk-hucre--secili';
      return h('div', { className: sinif, 'data-iso': huc.iso, key: huc.key,
        title: tarihMetni(cfg, huc.iso, true) }, huc.gun);
    });
    const baslik = kisa.slice(0, 7).map((g, i) =>
      h('div', { className: 'bk-gun-basligi', key: 'h' + i }, g));
    return [...baslik, ...hucreler];
  }

  /* ── seçili gün çizelgesi ── */

  cizelgeCiz(cfg, iso) {
    const d = gunBilgi(cfg, iso);
    const bugun = bugunISO(cfg);
    this._el.seciliDurum.textContent = this.seciliDurumMetni(cfg, iso, bugun, d);
    this._el.seciliTarih.textContent = tarihMetni(cfg, iso, true);

    yamala(this._el.cizelge, [h('div', { className: 'bk-cizelge-strip' }, this.dilimler(cfg, iso, d))]);

    const bloklar = d.araliklar.map((ar) => this.blokSatir(ar));
    goster(this._el.bloklar, bloklar.length > 0);
    yamala(this._el.bloklar, bloklar);

    const notlar = (d.notlar || []).map((n) => h('div', { className: 'gun-notu', key: n }, n));
    goster(this._el.notlar, notlar.length > 0);
    yamala(this._el.notlar, notlar);

    goster(this._el.cizelgeBos, d.araliklar.length === 0);
  }

  seciliDurumMetni(cfg, iso, bugun, d) {
    const kisa = cfg.mesajlar.gunlerKisa;
    const wd = haftaninGunu(iso);
    let rel;
    if (iso === bugun) rel = 'Bugün';
    else if (iso === gunEkle(bugun, 1)) rel = 'Yarın';
    else rel = kisa[wd === 0 ? 6 : wd - 1];
    return `${rel} · ${d.acik ? 'okul' : 'müsaitim'}`;
  }

  dilimler(cfg, iso, d) {
    const ciz = cfg.cizelge || { bas: '06:00', saat: 18 };
    const toplam = (ciz.saat || 18) * 2;
    const basDk = dk(ciz.bas || '06:00');
    const dilimler = [];
    for (let i = 0; i < toplam; i++) {
      const dkBas = basDk + i * 30;
      const hh = String(Math.floor(dkBas / 60)).padStart(2, '0');
      const mm = String(dkBas % 60).padStart(2, '0');
      const bas = `${hh}:${mm}`;
      const start = an(cfg, iso, bas);
      const end = new Date(start.getTime() + 30 * 60000);
      const dolu = d.araliklar.some((a) => a.bas < end && a.bit > start);
      dilimler.push(h('div', {
        className: 'bk-dilim' + (dolu ? ' bk-dilim--dolu' : ''),
        title: bas, key: bas
      }, [
        h('span', { className: 'bk-saat' }, dkBas % 60 === 0 ? bas : ''),
        h('span', { className: 'bk-bar' })
      ]));
    }
    return dilimler;
  }

  blokSatir(ar) {
    return h('div', { className: 'blok-satir', key: String(+ar.bas) }, [
      h('span', { className: 'blok-nokta', style: { background: 'rgba(255,59,48,.55)' } }),
      h('div', { className: 'blok-govde' }, [
        h('div', { className: 'blok-ust' }, [
          h('span', { className: 'blok-saat' }, `${yerelSaatStr(ar.bas)}–${yerelSaatStr(ar.bit)}`),
          h('span', { className: 'blok-etiket' }, ar.etiket || 'Okul')
        ]),
        ar.not ? h('div', { className: 'blok-not' }, ar.not) : null
      ])
    ]);
  }

  /* ── gezinti ── */

  ayKaydir(n) {
    const { yil, ay, seciliISO } = this.state;
    let y = yil, m = ay + n;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    const onEk = `${y}-${String(m + 1).padStart(2, '0')}`;
    const secili = seciliISO && seciliISO.startsWith(onEk) ? seciliISO : `${onEk}-01`;
    this.setState({ yil: y, ay: m, seciliISO: secili });
  }

  buguneDon() {
    if (!this.state.cfg) return;
    const bugun = bugunISO(this.state.cfg);
    const [y, m] = bugun.split('-').map(Number);
    this.setState({ yil: y, ay: m - 1, seciliISO: bugun });
  }

  sec(iso) {
    if (this.state.seciliISO === iso) return;
    this.setState({ seciliISO: iso });
  }
}

/* ── başlat ── */

if (window.BK_SURUM) {
  const g = new SiteGorunum(document.body);
  window.__siteGorunum = g;
  g.kurulum();
}
