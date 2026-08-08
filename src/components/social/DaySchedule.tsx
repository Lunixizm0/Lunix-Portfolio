import React from "react";
import {
  MusaitlikConfig,
  an,
  bugunISO,
  gunBilgi,
  tarihMetni,
  yerelSaatStr,
} from "../../utils/musaitlik";
import { seciliDurumMetni } from "./Calendar";
import {
  CizelgeBaslik,
  KartEtiket,
  SeciliDurum,
  SeciliTarih,
  CizelgeStrip,
  Dilim,
  BlokListesi,
  BlokSatir,
  BlokNokta,
  BlokGovde,
  BlokUst,
  BlokSaat,
  BlokEtiket,
  BlokNot,
  GunNotlari,
  GunNotu,
  CizelgeBos,
} from "../styles/Social.styled";
import { t } from "../../i18n";

type Props = { cfg: MusaitlikConfig; seciliISO: string };

const dk = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const DaySchedule: React.FC<Props> = ({ cfg, seciliISO }) => {
  const d = gunBilgi(cfg, seciliISO);
  const bugun = bugunISO(cfg);
  const ciz = cfg.cizelge || { bas: "06:00", saat: 18 };
  const toplam = (ciz.saat || 18) * 2;
  const basDk = dk(ciz.bas || "06:00");

  const dilimler = [];
  for (let i = 0; i < toplam; i++) {
    const dkBas = basDk + i * 30;
    const hh = String(Math.floor(dkBas / 60)).padStart(2, "0");
    const mm = String(dkBas % 60).padStart(2, "0");
    const bas = `${hh}:${mm}`;
    const start = an(cfg, seciliISO, bas);
    const end = new Date(start.getTime() + 30 * 60000);
    const dolu = d.araliklar.some(a => a.bas < end && a.bit > start);
    dilimler.push(
      <Dilim key={bas} dolu={dolu} title={bas}>
        <span className="bk-saat">{dkBas % 60 === 0 ? bas : ""}</span>
        <span className="bk-bar" />
      </Dilim>
    );
  }

  return (
    <>
      <CizelgeBaslik>
        <KartEtiket>{t("social.daySchedule.gunCizelgesi")}</KartEtiket>
        <SeciliDurum>{seciliDurumMetni(cfg, seciliISO, bugun, d)}</SeciliDurum>
      </CizelgeBaslik>
      <SeciliTarih>{tarihMetni(cfg, seciliISO, true)}</SeciliTarih>

      <CizelgeStrip>{dilimler}</CizelgeStrip>

      {d.araliklar.length > 0 && (
        <BlokListesi>
          {d.araliklar.map(ar => (
            <BlokSatir key={String(ar.bas.getTime())}>
              <BlokNokta style={{ background: "rgba(255,59,48,.55)" }} />
              <BlokGovde>
                <BlokUst>
                  <BlokSaat>
                    {yerelSaatStr(ar.bas)}–{yerelSaatStr(ar.bit)}
                  </BlokSaat>
                  <BlokEtiket>
                    {ar.etiket || t("social.engine.okul")}
                  </BlokEtiket>
                </BlokUst>
                {ar.not ? <BlokNot>{ar.not}</BlokNot> : null}
              </BlokGovde>
            </BlokSatir>
          ))}
        </BlokListesi>
      )}

      {d.notlar && d.notlar.length > 0 && (
        <GunNotlari>
          {d.notlar.map(n => (
            <GunNotu key={n}>{n}</GunNotu>
          ))}
        </GunNotlari>
      )}

      {d.araliklar.length === 0 && (
        <CizelgeBos>{t("social.daySchedule.bosGun")}</CizelgeBos>
      )}
    </>
  );
};

export default DaySchedule;
