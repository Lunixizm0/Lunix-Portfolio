import React, { useEffect, useState } from "react";
import {
  MusaitlikConfig,
  configYukle,
  gorunumCfg,
} from "../../utils/musaitlik";
import BackgroundVideo from "./BackgroundVideo";
import ProfileCard from "./ProfileCard";
import AvailabilityCard from "./AvailabilityCard";
import { t } from "../../i18n";
import {
  SocialRoot,
  MainWrapper,
  CardsGrid,
  GlassCard,
} from "../styles/Social.styled";

const SocialContent: React.FC = () => {
  const [cfg, setCfg] = useState<MusaitlikConfig | null>(null);
  const [hata, setHata] = useState("");
  const [videoOnly, setVideoOnly] = useState(false);

  useEffect(() => {
    let iptal = false;
    configYukle()
      .then(c => {
        /* görüntüleme diline göre mesajları çevir (veri dosyası değişmez) */
        if (!iptal) setCfg(gorunumCfg(c));
      })
      .catch(e => {
        if (!iptal)
          setHata(
            t("social.kart.veriHatasi", {
              msg: e instanceof Error ? e.message : "",
            })
          );
      });
    return () => {
      iptal = true;
    };
  }, []);

  return (
    <SocialRoot>
      <BackgroundVideo
        videoOnly={videoOnly}
        onToggleVideoMode={() => setVideoOnly(v => !v)}
      />

      <MainWrapper className={videoOnly ? "hidden" : ""}>
        <CardsGrid>
          <GlassCard delay={0}>
            <ProfileCard cfg={cfg} />
          </GlassCard>
          <GlassCard delay={0.1}>
            <AvailabilityCard cfg={cfg} hata={hata} />
          </GlassCard>
        </CardsGrid>
      </MainWrapper>
    </SocialRoot>
  );
};

export default SocialContent;
