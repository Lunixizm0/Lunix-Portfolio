import React from "react";
import {
  GunBilgi,
  MusaitlikConfig,
  ayIzgarasi,
  bugunISO,
  haftaninGunu,
  tarihMetni,
  gunEkle,
} from "../../utils/musaitlik";
import {
  AySatir,
  AyAdi,
  AyDugme,
  AyDugmeBugun,
  Izgara,
  GunBasligi,
  Hucre,
  Lejant,
} from "../styles/Social.styled";
import { t } from "../../i18n";

type Props = {
  cfg: MusaitlikConfig;
  yil: number;
  ay: number; // 0-11
  seciliISO: string;
  onSec: (iso: string) => void;
  onOnceki: () => void;
  onSonraki: () => void;
  onBugun: () => void;
};

function hucresinif(b: GunBilgi): {
  calisma?: boolean;
  tatil?: boolean;
} {
  if (b.tip === "tatil") return { tatil: true };
  if (b.acik) return { calisma: true };
  return {};
}

const Calendar: React.FC<Props> = ({
  cfg,
  yil,
  ay,
  seciliISO,
  onSec,
  onOnceki,
  onSonraki,
  onBugun,
}) => {
  const kisa = cfg.mesajlar?.gunlerKisa || [];
  const bugun = bugunISO(cfg);
  const hucreler = ayIzgarasi(cfg, yil, ay);

  return (
    <>
      <AySatir>
        <AyAdi>
          {cfg.mesajlar?.aylar?.[ay] || String(ay + 1)} {yil}
        </AyAdi>
        <AyDugme
          type="button"
          aria-label={t("social.calendar.oncekiAy")}
          onClick={onOnceki}
        >
          ‹
        </AyDugme>
        <AyDugmeBugun type="button" onClick={onBugun}>
          {t("social.calendar.bugun")}
        </AyDugmeBugun>
        <AyDugme
          type="button"
          aria-label={t("social.calendar.sonrakiAy")}
          onClick={onSonraki}
        >
          ›
        </AyDugme>
      </AySatir>

      <Izgara>
        {kisa.slice(0, 7).map((g, i) => (
          <GunBasligi key={"h" + i}>{g}</GunBasligi>
        ))}
        {hucreler.map(huc =>
          huc.bos ? (
            <Hucre key={huc.key} bos />
          ) : (
            <Hucre
              key={huc.key}
              onClick={() => onSec(huc.iso)}
              title={tarihMetni(cfg, huc.iso, true)}
              {...hucresinif(huc.bilgi)}
              bugun={huc.iso === bugun}
              secili={huc.iso === seciliISO}
            >
              {huc.gun}
            </Hucre>
          )
        )}
      </Izgara>

      <Lejant>
        <span>
          <i style={{ background: "rgba(255,59,48,.24)" }} />
          {t("social.calendar.okul")}
        </span>
        <span>
          <i style={{ background: "rgba(255,255,255,.07)" }} />
          {t("social.calendar.musaitim")}
        </span>
        <span>
          <i style={{ border: "1px solid rgba(255,255,255,.18)" }} />
          {t("social.calendar.tatil")}
        </span>
      </Lejant>
    </>
  );
};

/* Ay gezintisi yardımcıları — gorunum-site.js'teki mantığın portu */
export function ayKaydir(
  yil: number,
  ay: number,
  seciliISO: string,
  n: number
): { yil: number; ay: number; seciliISO: string } {
  let y = yil;
  let m = ay + n;
  if (m < 0) {
    m = 11;
    y--;
  }
  if (m > 11) {
    m = 0;
    y++;
  }
  const onEk = `${y}-${String(m + 1).padStart(2, "0")}`;
  const secili =
    seciliISO && seciliISO.startsWith(onEk) ? seciliISO : `${onEk}-01`;
  return { yil: y, ay: m, seciliISO: secili };
}

export function buguneDon(cfg: MusaitlikConfig): {
  yil: number;
  ay: number;
  seciliISO: string;
} {
  const bugun = bugunISO(cfg);
  const [y, m] = bugun.split("-").map(Number);
  return { yil: y, ay: m - 1, seciliISO: bugun };
}

export function seciliDurumMetni(
  cfg: MusaitlikConfig,
  iso: string,
  bugun: string,
  d: GunBilgi
): string {
  const kisa = cfg.mesajlar?.gunlerKisa || [];
  const wd = haftaninGunu(iso);
  let rel: string;
  if (iso === bugun) rel = t("social.calendar.bugun");
  else if (iso === gunEkle(bugun, 1)) rel = t("social.calendar.yarin");
  else rel = kisa[wd === 0 ? 6 : wd - 1];
  return `${rel} · ${d.acik ? t("social.calendar.okul") : t("social.calendar.musaitim")}`;
}

export default Calendar;
