import styled, { css, keyframes } from "styled-components";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const bkNabiz = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
  50% { box-shadow: 0 0 0 7px transparent; opacity: 0.55; }
`;

const font =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export const SocialRoot = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  isolation: isolate;
  background: #0a0a0a;
  color: #ffffff;
  font-family: ${font};
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`;

/* ── Video arka plan ── */
/* z-index: -1 → video, SocialRoot'un stacking context'i içinde her şeyin
   ARKASINDA kalır (eski public/social static sürümündeki .video-container
   gibi). Böylece hiçbir dokunuş/tık iframe'e ulaşamaz: iOS Safari'de
   iframe'lerde pointer-events: none çalışmaz (WebKit bug 154807) ve
   playsinline YouTube video'ları dokunuşu yakalayıp videoyu durdurabilir. */
export const VideoLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  background: radial-gradient(
    120% 90% at 20% 10%,
    #1c2434 0%,
    #101420 40%,
    #0a0a0a 75%
  );
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      180deg,
      rgba(10, 10, 10, 0.3) 0%,
      rgba(10, 10, 10, 0.6) 50%,
      rgba(10, 10, 10, 0.9) 100%
    );
    pointer-events: none;
  }
`;

export const PlayerWrap = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 177.78vh;
  min-width: 100%;
  height: 56.25vw;
  min-height: 100%;
  overflow: hidden;
  iframe {
    width: 100% !important;
    height: 100% !important;
    border: 0;
    pointer-events: none !important;
  }
`;

/* video modunda tıklamaları YouTube iframe'ine ulaştırmadan yutar */
export const VideoClickCatcher = styled.div<{ active?: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 50;
  cursor: default;
  display: ${({ active }) => (active ? "block" : "none")};
`;

export const MainWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(16px, 4vw, 28px) clamp(12px, 3.5vw, 20px)
    calc(96px + env(safe-area-inset-bottom, 0px));
  &.hidden {
    display: none;
  }
`;

export const CardsGrid = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-wrap: wrap;
  gap: clamp(14px, 3vw, 20px);
  align-items: stretch;
  justify-content: center;
`;

export const GlassCard = styled.div<{ delay?: number }>`
  flex: 1 1 340px;
  max-width: 430px;
  min-width: 0;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: clamp(18px, 5vw, 24px);
  display: flex;
  flex-direction: column;
  padding: clamp(20px, 5vw, 28px) clamp(16px, 4.5vw, 24px);
  animation: ${fadeInUp} 0.8s ease-out ${({ delay }) => `${delay ?? 0}s`}
    backwards;
`;

/* ── Sol kart: profil ── */
export const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 28px;
`;

export const ProfileName = styled.h1`
  font-size: clamp(23px, 6.5vw, 28px);
  font-weight: 700;
  margin-bottom: 6px;
  background: linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const ProfileBio = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
`;

export const WidgetsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
  flex: 1;
  justify-content: center;
`;

export const WidgetCard = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 12px;
  transition: all 0.3s ease;
  overflow: hidden;
  &:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }
`;

export const GithubWidgetCard = styled(WidgetCard)`
  padding: clamp(18px, 4.5vw, 26px);
`;

export const GwYukleniyor = styled.p`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  padding: 20px 0;
`;

export const GwUstBaslik = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const GwLogo = styled.span`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.85);
`;

export const GwGor = styled.a`
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s ease;
  &:hover {
    color: #fff;
  }
`;

export const GwUst = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 16px;
`;

export const GwAvatar = styled.img`
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.12);
  flex: none;
`;

export const GwBilgi = styled.div`
  flex: 1;
  min-width: 0;
`;

export const GwIsim = styled.div`
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const GwKullanici = styled.a`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  &:hover {
    color: #fff;
  }
`;

export const GwBiyo = styled.span`
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.5;
  margin-top: 8px;
`;

export const GwStats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  text-align: center;
  margin-top: 20px;
`;

export const GwStat = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  padding: 16px 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const GwSayi = styled.span`
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
`;

export const GwEtiket = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

export const GwDilCubuk = styled.div`
  display: flex;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  margin-top: 20px;
  i {
    height: 100%;
  }
`;

export const GwDilLejant = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 10px;
`;

export const GwAltBaslik = styled.div`
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 22px;
`;

export const GwAktif = styled.div`
  display: grid;
  gap: 11px;
  margin-top: 12px;
`;

export const GwAktifSatir = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  line-height: 1.5;
`;

export const GwAktifNokta = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1ed760;
  flex: none;
`;

export const GwAktifMetin = styled.span`
  flex: 1;
  min-width: 0;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const GwAktifZaman = styled.span`
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  font-size: 12px;
`;

export const GithubHata = styled.div`
  p {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }
`;

export const GwLink = styled.a`
  display: inline-block;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  padding: 8px 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.14);
  }
`;

/* ── Sosyal linkler ── */
export const SocialSection = styled.div`
  margin-bottom: 24px;
`;

export const SocialGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

export const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex: none;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }
  svg {
    width: 18px;
    height: 18px;
  }
  &.github:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
  &.email:hover {
    background: rgba(234, 67, 53, 0.12);
    border-color: rgba(234, 67, 53, 0.35);
    color: #ea4335;
  }
  &.linkedin:hover {
    background: rgba(10, 102, 194, 0.15);
    border-color: rgba(10, 102, 194, 0.45);
    color: #5bb0ef;
  }
`;

/* ── Sağ kart: müsaitlik ── */
export const DurumSatir = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 14px;
`;

export const DurumNokta = styled.span<{ renk?: string }>`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  background: ${({ renk }) => renk || "#1ed760"};
  color: ${({ renk }) => renk || "#1ed760"};
  animation: ${bkNabiz} 2.4s ease-out infinite;
  flex: none;
`;

export const KartEtiket = styled.span`
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`;

export const DurumTarih = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin-left: auto;
`;

export const DurumMetni = styled.div<{ renk?: string }>`
  font-size: clamp(21px, 6vw, 26px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.12;
  text-wrap: balance;
  color: ${({ renk }) => renk || "#1ed760"};
`;

export const GeriSayim = styled.div`
  font-size: clamp(14px, 4vw, 16px);
  font-weight: 600;
  margin-top: 8px;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.92);
  min-height: 19px;
`;

export const AltMetin = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 3px;
`;

export const IcKart = styled.div<{ ust?: boolean }>`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 14px;
  margin-top: 14px;
  ${({ ust }) =>
    ust &&
    css`
      margin-top: 18px;
    `}
`;

export const AySatir = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
`;

export const AyAdi = styled.span`
  flex: 1;
  font-size: 14px;
  font-weight: 600;
`;

export const AyDugme = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  font-family: inherit;
  &:hover {
    background: rgba(255, 255, 255, 0.14);
  }
`;

export const AyDugmeBugun = styled(AyDugme)`
  width: auto;
  height: 28px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 11px;
`;

export const Izgara = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

export const GunBasligi = styled.div`
  text-align: center;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  padding-bottom: 3px;
`;

export const Hucre = styled.div<{
  bos?: boolean;
  calisma?: boolean;
  tatil?: boolean;
  bugun?: boolean;
  secili?: boolean;
}>`
  aspect-ratio: 1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition:
    transform 0.15s ease,
    background 0.2s ease,
    border-color 0.2s ease;
  &:not(:disabled):hover {
    transform: scale(1.06);
  }
  ${({ bos }) =>
    bos &&
    css`
      pointer-events: none;
      visibility: hidden;
    `}
  ${({ calisma }) =>
    calisma &&
    css`
      background: rgba(255, 59, 48, 0.22);
      border-color: rgba(255, 59, 48, 0.3);
      color: #ff9d92;
    `}
  ${({ tatil }) =>
    tatil &&
    css`
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.35);
      border: 1px dashed rgba(255, 255, 255, 0.18);
    `}
  ${({ bugun }) =>
    bugun &&
    css`
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
    `}
  ${({ secili }) =>
    secili &&
    css`
      outline: 2px solid #fff;
      outline-offset: 1px;
      z-index: 1;
    `}
`;

export const Lejant = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  span {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  i {
    width: 9px;
    height: 9px;
    border-radius: 3px;
    display: inline-block;
  }
`;

/* Gün çizelgesi şeridi */
export const CizelgeBaslik = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  ${KartEtiket} {
    flex: 1;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.35);
  }
`;

export const SeciliDurum = styled.div`
  font-size: 12px;
  font-weight: 600;
`;

export const SeciliTarih = styled.div`
  font-size: 15px;
  font-weight: 600;
  margin-top: 3px;
`;

export const CizelgeStrip = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 42px;
  gap: 4px;
  overflow-x: auto;
  padding: 2px 2px 8px;
  margin-top: 12px;
  scrollbar-width: thin;
`;

export const Dilim = styled.div<{ dolu?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
  .bk-saat {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.35);
    height: 11px;
    line-height: 11px;
    white-space: nowrap;
  }
  .bk-bar {
    width: 100%;
    height: 26px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition: background 0.2s ease;
  }
  ${({ dolu }) =>
    dolu &&
    css`
      .bk-bar {
        background: rgba(255, 59, 48, 0.32);
        border-color: rgba(255, 59, 48, 0.38);
      }
      &:hover .bk-bar {
        background: rgba(255, 59, 48, 0.48);
      }
    `}
`;

export const CizelgeBos = styled.div`
  font-size: 12px;
  color: #1ed760;
  margin-top: 10px;
`;

export const BlokListesi = styled.div`
  display: grid;
  gap: 5px;
  margin-top: 12px;
`;

export const BlokSatir = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11px;
  line-height: 1.35;
`;

export const BlokNokta = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 3px;
  flex: none;
  display: inline-block;
  margin-top: 3px;
`;

export const BlokGovde = styled.div`
  flex: 1;
  min-width: 0;
`;

export const BlokUst = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

export const BlokSaat = styled.span`
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

export const BlokEtiket = styled.span`
  color: rgba(255, 255, 255, 0.62);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BlokNot = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.58);
  margin-top: 2px;
  line-height: 1.4;
`;

export const GunNotlari = styled.div`
  display: grid;
  gap: 6px;
  margin-top: 12px;
`;

export const GunNotu = styled.div`
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.62);
  padding: 8px 11px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border-left: 2px solid rgba(255, 255, 255, 0.18);
`;

export const KartAlt = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

export const TzNot = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.32);
  flex: 1;
`;

export const HataMetni = styled.p`
  font-size: 12px;
  color: #ff8a80;
  margin: 8px 0 0;
`;

/* ── Ses kontrolleri ── */
export const SoundControls = styled.div`
  position: absolute;
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  right: clamp(12px, 4vw, 20px);
  display: flex;
  align-items: center;
  gap: clamp(8px, 2.5vw, 12px);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50px;
  padding: 7px clamp(11px, 3.5vw, 16px);
  z-index: 100;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

export const SoundBtn = styled.button`
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  svg {
    width: 18px;
    height: 18px;
  }
  svg.unmuted,
  svg.muted {
    display: none;
  }
  &.muted svg.unmuted {
    display: none;
  }
  &.muted svg.muted {
    display: block;
  }
  &.on svg.unmuted {
    display: block;
  }
`;

export const VolumeSlider = styled.input`
  width: clamp(56px, 18vw, 80px);
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    height: 6px;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    background: #ffffff;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    &:hover {
      transform: scale(1.2);
    }
  }
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #ffffff;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

export const VolumePercent = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 32px;
  text-align: center;
  font-weight: 500;
`;

export const VideoModeBtn = styled.button`
  position: absolute;
  bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 10px 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 99;
  cursor: pointer;
  animation: ${fadeInUp} 0.5s ease;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.28);
    color: #ffffff;
  }
  &.active {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.35);
    color: #ffffff;
  }
  svg {
    width: 16px;
    height: 16px;
  }
`;
