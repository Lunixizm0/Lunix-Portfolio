/* site.js — Motor. Veri sahibi (config) + anlık durum hesabı.
   Görünüm bileşeni buradan hazır "kart verisi" alır; takvim hesabı takvim.js'te. */

import * as T from './takvim.js';

export class Motor {
  constructor(yol) {
    this.yol = yol;
    this.cfg = null;
  }

  async hazirla() {
    this.cfg = await T.configYukle(this.yol);
    return this.cfg;
  }

  durum(now) {
    return T.durum(this.cfg, now || new Date());
  }

  /* data-bk="anahtar" elemanlarına yazılacak metinler. Geri sayım her saniye değişir;
     metinYaz yalnız değişince yazar. */
  kartaVer(d) {
    const cfg = this.cfg, m = cfg.mesajlar;
    const tur = d.musait ? 'musait' : d.uykuda ? 'uyku' : 'mesgul';
    const g = T.geriSayim(d.kalanMs);
    let geriSayimCumle = '';
    if (g) geriSayimCumle = tur === 'mesgul'
      ? `Kalan iş: ${g}` : tur === 'uyku' ? `Uyku: ${g}` : `Müsaitim: ${g}`;

    const tz = T.ziyaretciSaatDilimi();
    const kayar = T.saatKaymasiVar(cfg, T.bugunISO(cfg, d.now));

    return {
      ad: cfg.kisi.ad,
      unvan: cfg.kisi.unvan,
      bugunTarih: T.tarihMetni(cfg, d.bugunISO),
      durumMetni: d.musait ? m.musait : m.mesgul,
      geriSayimCumle,
      altMetin: T.altMetinUret(cfg, d),
      tzNot: kayar
        ? `Saatler senin saat dilimine göre${tz ? ' (' + tz + ')' : ''}`
        : 'Saatler Türkiye saatiyle',
      goruntulenme: `${cfg.goruntulenme || 0} görüntülenme`,
      durumRenk: d.musait ? '#1ed760' : d.uykuda ? 'rgba(255,255,255,.55)' : '#ff453a'
    };
  }
}
