import React, { useEffect, useRef, useState } from "react";
import {
  MusaitlikConfig,
  bugunISO,
  durum,
  kartVerisi,
} from "../../utils/musaitlik";
import Calendar, { ayKaydir, buguneDon } from "./Calendar";
import DaySchedule from "./DaySchedule";
import {
  DurumSatir,
  DurumNokta,
  KartEtiket,
  DurumTarih,
  DurumMetni,
  GeriSayim,
  AltMetin,
  IcKart,
  KartAlt,
  TzNot,
  HataMetni,
} from "../styles/Social.styled";
import { t } from "../../i18n";

type Props = { cfg: MusaitlikConfig | null; hata: string };

const AvailabilityCard: React.FC<Props> = ({ cfg, hata }) => {
  const [yil, setYil] = useState(0);
  const [ay, setAy] = useState(0); // 0-11
  const [seciliISO, setSeciliISO] = useState("");
  const [now, setNow] = useState(() => new Date());
  const baslangicRef = useRef(false);
  const lastBugunRef = useRef("");

  /* İlk kurulum: bugünün ayına/gününe git */
  useEffect(() => {
    if (!cfg || baslangicRef.current) return;
    baslangicRef.current = true;
    const b = buguneDon(cfg);
    setYil(b.yil);
    setAy(b.ay);
    setSeciliISO(b.seciliISO);
  }, [cfg]);

  /* Her saniye: geri sayım + gün değişince ay/gün sıfırla */
  useEffect(() => {
    if (!cfg) return;
    const id = setInterval(() => {
      const t = new Date();
      setNow(t);
      const bugun = bugunISO(cfg, t);
      if (bugun !== lastBugunRef.current) {
        lastBugunRef.current = bugun;
        const b = buguneDon(cfg);
        setYil(b.yil);
        setAy(b.ay);
        setSeciliISO(b.seciliISO);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [cfg]);

  if (!cfg) {
    return (
      <>
        <DurumSatir>
          <DurumNokta />
          <KartEtiket>{t("social.kart.musaitlikDurumu")}</KartEtiket>
          <DurumTarih>—</DurumTarih>
        </DurumSatir>
        <DurumMetni>{t("social.kart.musaitlikYukleniyor")}</DurumMetni>
        {hata && <HataMetni>{hata}</HataMetni>}
      </>
    );
  }

  const d = durum(cfg, now);
  const veri = kartVerisi(cfg, d);

  const onceki = () => {
    const b = ayKaydir(yil, ay, seciliISO, -1);
    setYil(b.yil);
    setAy(b.ay);
    setSeciliISO(b.seciliISO);
  };
  const sonraki = () => {
    const b = ayKaydir(yil, ay, seciliISO, 1);
    setYil(b.yil);
    setAy(b.ay);
    setSeciliISO(b.seciliISO);
  };
  const bugune = () => {
    const b = buguneDon(cfg);
    setYil(b.yil);
    setAy(b.ay);
    setSeciliISO(b.seciliISO);
  };

  return (
    <>
      <DurumSatir>
        <DurumNokta renk={veri.durumRenk} />
        <KartEtiket>{t("social.kart.musaitlikDurumu")}</KartEtiket>
        <DurumTarih>{veri.bugunTarih}</DurumTarih>
      </DurumSatir>

      <DurumMetni renk={veri.durumRenk}>{veri.durumMetni}</DurumMetni>
      <GeriSayim>{veri.geriSayimCumle}</GeriSayim>
      <AltMetin>{veri.altMetin}</AltMetin>
      {hata && <HataMetni>{hata}</HataMetni>}

      {seciliISO && (
        <>
          <IcKart ust>
            <Calendar
              cfg={cfg}
              yil={yil}
              ay={ay}
              seciliISO={seciliISO}
              onSec={setSeciliISO}
              onOnceki={onceki}
              onSonraki={sonraki}
              onBugun={bugune}
            />
          </IcKart>

          <IcKart>
            <DaySchedule cfg={cfg} seciliISO={seciliISO} />
          </IcKart>
        </>
      )}

      <KartAlt>
        <TzNot>{veri.tzNot}</TzNot>
      </KartAlt>
    </>
  );
};

export default AvailabilityCard;
