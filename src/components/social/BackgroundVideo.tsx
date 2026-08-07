import React, { useCallback, useEffect, useRef, useState } from "react";
import { youTubeReady, YTPlayer } from "../../utils/youtube";
import {
  PlayerWrap,
  VideoClickCatcher,
  VideoLayer,
  SoundControls,
  SoundBtn,
  VolumeSlider,
  VolumePercent,
  VideoModeBtn,
} from "../styles/Social.styled";

type Props = {
  videoOnly: boolean;
  onToggleVideoMode: () => void;
};

const VIDEO_ID_MOBIL = "FtutLA63Cp8"; // Bad Apple!! PV (Rule 86)
const VIDEO_ID_MASAUSTU = "30jrmzzgHLc";

const BackgroundVideo: React.FC<Props> = ({ videoOnly, onToggleVideoMode }) => {
  const playerWrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerReadyRef = useRef(false);

  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(25);
  const [videoGecti, setVideoGecti] = useState(false);

  useEffect(() => {
    let iptal = false;
    const isMobil = window.matchMedia("(max-width: 768px)").matches;
    const videoId = isMobil ? VIDEO_ID_MOBIL : VIDEO_ID_MASAUSTU;

    youTubeReady().then(YT => {
      if (iptal || !playerWrapRef.current) return;
      const player = new YT.Player(playerWrapRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          // YouTube IFrame API parametresi (snake_case)
          // eslint-disable-next-line camelcase
          iv_load_policy: 3,
          modestbranding: 1,
          mute: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            playerReadyRef.current = true;
            player.setVolume(25);
            player.mute();
            player.playVideo();
          },
          onStateChange: e => {
            if (e.data === YT.PlayerState.ENDED) {
              player.seekTo(0, true);
              player.playVideo();
            }
          },
          onError: () => {
            setVideoGecti(true);
          },
        },
      });
      playerRef.current = player;
    });

    return () => {
      iptal = true;
      playerReadyRef.current = false;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  const sesiAc = useCallback(() => {
    if (!playerReadyRef.current || !playerRef.current) return;
    setMuted(false);
    playerRef.current.unMute();
    playerRef.current.setVolume(volume);
    playerRef.current.playVideo();
  }, [volume]);

  const sesiKapat = useCallback(() => {
    if (!playerReadyRef.current || !playerRef.current) return;
    setMuted(true);
    playerRef.current.mute();
  }, []);

  const toggleSes = useCallback(() => {
    if (muted) sesiAc();
    else sesiKapat();
  }, [muted, sesiAc, sesiKapat]);

  const changeVolume = useCallback(
    (value: number) => {
      setVolume(value);
      if (playerReadyRef.current && playerRef.current) {
        playerRef.current.setVolume(value);
      }
      if (value > 0 && muted) {
        setMuted(false);
        if (playerReadyRef.current && playerRef.current) {
          playerRef.current.unMute();
        }
      }
      if (value === 0) setMuted(true);
    },
    [muted]
  );

  return (
    <>
      <VideoLayer>
        <PlayerWrap ref={playerWrapRef} />
      </VideoLayer>
      <VideoClickCatcher active={videoOnly} />

      {!videoGecti && (
        <>
          <VideoModeBtn
            className={videoOnly ? "active" : ""}
            type="button"
            aria-label="Videoyu göster veya gizle"
            onClick={onToggleVideoMode}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
            </svg>
            {videoOnly ? "Videoyu gizle" : "Videoyu göster"}
          </VideoModeBtn>

          <SoundControls className="sound-controls">
            <SoundBtn
              className={muted ? "muted" : "on"}
              type="button"
              title="Sesi Aç/Kapat"
              aria-label="Sesi aç veya kapat"
              onClick={toggleSes}
            >
              <svg
                className="muted"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
              <svg
                className="unmuted"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            </SoundBtn>
            <VolumeSlider
              type="range"
              min="0"
              max="100"
              value={volume}
              aria-label="Ses seviyesi"
              onChange={e => changeVolume(Number(e.target.value))}
            />
            <VolumePercent>{volume}%</VolumePercent>
          </SoundControls>
        </>
      )}
    </>
  );
};

export default BackgroundVideo;
