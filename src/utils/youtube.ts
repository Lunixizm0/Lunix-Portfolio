/* youtube.ts — YouTube IFrame API için küçük yükleme yardımcısı.
   Script bir kez yüklenir; YT hazır olduğunda promise döner. */

export type YTPlayerEvents = {
  onReady?: (event: unknown) => void;
  onStateChange?: (event: { data: number }) => void;
  onError?: (event: unknown) => void;
};

export type YTPlayer = {
  playVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (v: number) => void;
  getVolume: () => number;
  seekTo: (t: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
};

export type YTNamespace = {
  Player: new (
    id: string | HTMLElement,
    opts: {
      videoId: string;
      playerVars?: Record<string, number | string>;
      events?: YTPlayerEvents;
    }
  ) => YTPlayer;
  PlayerState: { ENDED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytPromise: Promise<YTNamespace> | null = null;

function loadScript(): Promise<YTNamespace> {
  return new Promise(resolve => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (existing) {
      const check = () => {
        if (window.YT && window.YT.Player) resolve(window.YT);
        else requestAnimationFrame(check);
      };
      check();
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT && window.YT.Player) resolve(window.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
}

export function youTubeReady(): Promise<YTNamespace> {
  if (!ytPromise) ytPromise = loadScript();
  return ytPromise;
}
