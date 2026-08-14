import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ThemeProvider } from "styled-components";
import { useTheme } from "./hooks/useTheme";
import GlobalStyle from "./components/styles/GlobalStyle";
import DesktopShortcuts from "./components/DesktopShortcuts";
import WelcomeBrowserWindow from "./components/WelcomeBrowserWindow";
import FullscreenToggle from "./components/FullscreenToggle";
import WindowFallback from "./components/WindowFallback";

// Loaded on demand so the initial bundle stays small. The browser window
// (shown on startup) stays eager.
const TerminalWindow = lazy(() => import("./components/TerminalWindow"));
const ResumeWindow = lazy(() => import("./components/ResumeWindow"));
const SocialWindow = lazy(() => import("./components/SocialWindow"));

type VendorDocument = Document & {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

type VendorElement = Element & {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
};

function App() {
  // themes
  const { theme, themeLoaded } = useTheme();

  // Device detection
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const requestFullscreen = async () => {
    const el = document.documentElement as VendorElement;
    try {
      if (!document.fullscreenElement && el.requestFullscreen)
        await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
    } catch {
      // some browsers require a user gesture before entering fullscreen
    }
  };
  const exitFullscreen = async () => {
    const doc = document as VendorDocument;
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
      else if (doc.msExitFullscreen) await doc.msExitFullscreen();
    } catch {
      // exit fullscreen can fail if no request was ever granted
    }
  };
  const toggleFullscreen = useCallback(async () => {
    if (!isFullscreen) await requestFullscreen();
    else await exitFullscreen();
  }, [isFullscreen]);
  useEffect(() => {
    const doc = document as VendorDocument;
    const onChange = () =>
      setIsFullscreen(
        !!document.fullscreenElement ||
          !!doc.webkitFullscreenElement ||
          !!doc.msFullscreenElement
      );
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    document.addEventListener("msfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      document.removeEventListener("msfullscreenchange", onChange);
    };
  }, []);
  // Auto-enter fullscreen on load (best-effort; some browsers require gesture)
  useEffect(() => {
    if (themeLoaded && isMobile) {
      requestFullscreen();
    }
  }, [themeLoaded, isMobile]);

  // Terminal window state
  const [terminalMounted, setTerminalMounted] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [terminalMaximized, setTerminalMaximized] = useState(false);
  const [winX, setWinX] = useState(0);
  const [winY, setWinY] = useState(0);
  const [winW, setWinW] = useState(960);
  const [winH, setWinH] = useState(640);

  // Welcome browser window state (shown on load on desktop only)
  const [welcomeMounted, setWelcomeMounted] = useState(true);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [welcomeMaximized, setWelcomeMaximized] = useState(false);

  // Resume window state
  const [resumeMounted, setResumeMounted] = useState(false);
  const [resumeVisible, setResumeVisible] = useState(false);
  const [resumeMaximized, setResumeMaximized] = useState(false);
  const resumeOpenedRef = useRef<number | null>(null);

  // Social window state
  const [socialMounted, setSocialMounted] = useState(false);
  const [socialVisible, setSocialVisible] = useState(false);
  const [socialMaximized, setSocialMaximized] = useState(false);
  const socialOpenedRef = useRef<number | null>(null);

  // z-index stacking for windows (desktop): highest index on last focused.
  // Kept in a ref (never rendered) so bring-to-front callbacks stay stable.
  const zTopRef = useRef(500);
  const [zBrowser, setZBrowser] = useState(200);
  const [zTerminal, setZTerminal] = useState(300);
  const [zResume, setZResume] = useState(400);
  const [zSocial, setZSocial] = useState(450);
  const bringBrowserToFront = useCallback(() => {
    zTopRef.current += 1;
    setZBrowser(zTopRef.current);
  }, []);
  const bringTerminalToFront = useCallback(() => {
    zTopRef.current += 1;
    setZTerminal(zTopRef.current);
  }, []);
  const bringResumeToFront = useCallback(() => {
    zTopRef.current += 1;
    setZResume(zTopRef.current);
  }, []);
  const bringSocialToFront = useCallback(() => {
    zTopRef.current += 1;
    setZSocial(zTopRef.current);
  }, []);
  const [wbX, setWbX] = useState(140);
  const [wbY, setWbY] = useState(60);
  const [wbW, setWbW] = useState(900);
  const [wbH, setWbH] = useState(680);
  const [rsX, setRsX] = useState(160);
  const [rsY, setRsY] = useState(80);
  const [rsW, setRsW] = useState(900);
  const [rsH, setRsH] = useState(560);

  const [scX, setScX] = useState(120);
  const [scY, setScY] = useState(50);
  const [scW, setScW] = useState(1000);
  const [scH, setScH] = useState(820);

  // Startup layout: mobile => browser only, maximized; desktop => browser only centered
  useEffect(() => {
    if (!themeLoaded) return;
    if (isMobile) {
      setWelcomeMounted(true);
      setWelcomeVisible(true);
      setWelcomeMaximized(true); // force maximized on mobile

      setTerminalMounted(false);
      setTerminalVisible(false);
      setTerminalMaximized(false);

      setSocialMounted(false);
      setSocialVisible(false);
      setSocialMaximized(false);
    } else {
      setWelcomeMounted(true);
      setWelcomeVisible(true);
      setWelcomeMaximized(false);
      // Center browser on desktop startup
      const ww = window.innerWidth,
        wh = window.innerHeight;
      const w = wbW,
        h = wbH;
      setWbX(Math.max(0, Math.round((ww - w) / 2)));
      setWbY(Math.max(0, Math.round((wh - h) / 2)));
      bringBrowserToFront();

      setTerminalMounted(false);
      setTerminalVisible(false);
      setTerminalMaximized(false);

      setSocialMounted(false);
      setSocialVisible(false);
      setSocialMaximized(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, themeLoaded]);

  // Terminal handlers
  const handleClose = useCallback(() => {
    setTerminalMounted(false);
    setTerminalVisible(false);
    setTerminalMaximized(false);
  }, []);
  const handleMinimize = useCallback(() => {
    setTerminalVisible(false);
    setTerminalMaximized(false);
  }, []);
  const handleOpenFromShortcut = useCallback(() => {
    if (isMobile) {
      // Force maximized on mobile
      setTerminalMounted(true);
      setTerminalVisible(true);
      setTerminalMaximized(true);
      bringTerminalToFront();
      return;
    }
    // center on open (desktop)
    const ww = window.innerWidth,
      wh = window.innerHeight;
    const w = winW,
      h = winH;
    setWinX(Math.max(0, Math.round((ww - w) / 2)));
    setWinY(Math.max(0, Math.round((wh - h) / 2)));
    setTerminalMounted(true);
    setTerminalVisible(true);
    bringTerminalToFront();
  }, [isMobile, winW, winH, bringTerminalToFront]);
  const handleToggleMaximize = useCallback(() => {
    setTerminalMaximized(prev => !prev);
    setTerminalVisible(true);
  }, []);
  const handleTerminalMove = useCallback(
    (x: number, y: number) => {
      setWinX(x);
      setWinY(y);
      bringTerminalToFront();
    },
    [bringTerminalToFront]
  );
  const handleTerminalResize = useCallback(
    ({
      width,
      height,
      x,
      y,
    }: {
      width: number;
      height: number;
      x?: number;
      y?: number;
    }) => {
      if (x !== undefined) setWinX(x);
      if (y !== undefined) setWinY(y);
      setWinW(width);
      setWinH(height);
      bringTerminalToFront();
    },
    [bringTerminalToFront]
  );

  // Resume window handlers
  const handleResumeClose = useCallback(() => {
    setResumeMounted(false);
    setResumeVisible(false);
    setResumeMaximized(false);
  }, []);
  const handleResumeMinimize = useCallback(() => {
    setResumeVisible(false);
    setResumeMaximized(false);
  }, []);
  const handleOpenResume = useCallback(() => {
    if (isMobile) {
      setResumeMounted(true);
      setResumeVisible(true);
      setResumeMaximized(true);
      bringResumeToFront();
      return;
    }
    const ww = window.innerWidth,
      wh = window.innerHeight;
    setRsX(0);
    setRsY(0);
    setRsW(ww);
    setRsH(wh);
    setResumeMounted(true);
    setResumeVisible(true);
    setResumeMaximized(true);
    bringResumeToFront();
  }, [isMobile, bringResumeToFront]);
  const handleResumeToggleMax = useCallback(() => {
    setResumeMaximized(p => !p);
    setResumeVisible(true);
  }, []);
  const handleResumeMove = useCallback(
    (x: number, y: number) => {
      setRsX(x);
      setRsY(y);
      bringResumeToFront();
    },
    [bringResumeToFront]
  );
  const handleResumeResize = useCallback(
    ({
      width,
      height,
      x,
      y,
    }: {
      width: number;
      height: number;
      x?: number;
      y?: number;
    }) => {
      if (x !== undefined) setRsX(x);
      if (y !== undefined) setRsY(y);
      setRsW(width);
      setRsH(height);
      bringResumeToFront();
    },
    [bringResumeToFront]
  );

  // Social window handlers
  const handleSocialClose = useCallback(() => {
    setSocialMounted(false);
    setSocialVisible(false);
    setSocialMaximized(false);
  }, []);
  const handleSocialMinimize = useCallback(() => {
    setSocialVisible(false);
    setSocialMaximized(false);
  }, []);
  const handleOpenSocial = useCallback(() => {
    if (isMobile) {
      setSocialMounted(true);
      setSocialVisible(true);
      setSocialMaximized(true);
      bringSocialToFront();
      return;
    }
    const ww = window.innerWidth,
      wh = window.innerHeight;
    const w = scW,
      h = scH;
    setScX(Math.max(0, Math.round((ww - w) / 2)));
    setScY(Math.max(0, Math.round((wh - h) / 2)));
    setSocialMounted(true);
    setSocialVisible(true);
    setSocialMaximized(true);
    bringSocialToFront();
  }, [isMobile, scW, scH, bringSocialToFront]);
  const handleSocialToggleMax = useCallback(() => {
    setSocialMaximized(p => !p);
    setSocialVisible(true);
  }, []);
  const handleSocialMove = useCallback(
    (x: number, y: number) => {
      setScX(x);
      setScY(y);
      bringSocialToFront();
    },
    [bringSocialToFront]
  );
  const handleSocialResize = useCallback(
    ({
      width,
      height,
      x,
      y,
    }: {
      width: number;
      height: number;
      x?: number;
      y?: number;
    }) => {
      if (x !== undefined) setScX(x);
      if (y !== undefined) setScY(y);
      setScW(width);
      setScH(height);
      bringSocialToFront();
    },
    [bringSocialToFront]
  );

  // Welcome window handlers
  const handleWelcomeClose = useCallback(() => {
    setWelcomeMounted(false);
    setWelcomeVisible(false);
    setWelcomeMaximized(false);
  }, []);
  const handleWelcomeMinimize = useCallback(() => {
    setWelcomeVisible(false);
    setWelcomeMaximized(false);
  }, []);
  const handleOpenWelcome = useCallback(() => {
    if (isMobile) {
      // Force maximized on mobile
      setWelcomeMounted(true);
      setWelcomeVisible(true);
      setWelcomeMaximized(true);
      bringBrowserToFront();
      return;
    }
    // Center on open (desktop)
    const ww = window.innerWidth,
      wh = window.innerHeight;
    const w = wbW,
      h = wbH;
    setWbX(Math.max(0, Math.round((ww - w) / 2)));
    setWbY(Math.max(0, Math.round((wh - h) / 2)));
    setWelcomeMounted(true);
    setWelcomeVisible(true);
    bringBrowserToFront();
  }, [isMobile, wbW, wbH, bringBrowserToFront]);
  const handleWelcomeToggleMax = useCallback(() => {
    setWelcomeMaximized(p => !p);
    setWelcomeVisible(true);
  }, []);
  const handleBrowserMove = useCallback(
    (x: number, y: number) => {
      setWbX(x);
      setWbY(y);
      bringBrowserToFront();
    },
    [bringBrowserToFront]
  );
  const handleBrowserResize = useCallback(
    ({
      width,
      height,
      x,
      y,
    }: {
      width: number;
      height: number;
      x?: number;
      y?: number;
    }) => {
      if (x !== undefined) setWbX(x);
      if (y !== undefined) setWbY(y);
      setWbW(width);
      setWbH(height);
      bringBrowserToFront();
    },
    [bringBrowserToFront]
  );

  // Listen for open-resume events from terminal command
  useEffect(() => {
    const handler = (e: Event) => {
      const idx = (e as CustomEvent).detail?.index;
      if (idx === undefined) return;
      if (idx !== resumeOpenedRef.current) {
        resumeOpenedRef.current = idx;
        handleOpenResume();
      } else if (resumeMounted && !resumeVisible) {
        setResumeVisible(true);
        bringResumeToFront();
      }
    };
    document.addEventListener("open-resume", handler);
    return () => document.removeEventListener("open-resume", handler);
  }, [resumeMounted, resumeVisible, handleOpenResume, bringResumeToFront]);

  // Listen for open-social events from terminal command
  useEffect(() => {
    const handler = (e: Event) => {
      const idx = (e as CustomEvent).detail?.index;
      if (idx === undefined) return;
      if (idx !== socialOpenedRef.current) {
        socialOpenedRef.current = idx;
        handleOpenSocial();
      } else if (socialMounted && !socialVisible) {
        setSocialVisible(true);
        bringSocialToFront();
      }
    };
    document.addEventListener("open-social", handler);
    return () => document.removeEventListener("open-social", handler);
  }, [socialMounted, socialVisible, handleOpenSocial, bringSocialToFront]);

  // Disable browser's default behavior
  useEffect(() => {
    window.addEventListener(
      "keydown",
      e => {
        ["ArrowUp", "ArrowDown"].indexOf(e.code) > -1 && e.preventDefault();
      },
      false
    );
  }, []);

  // Update meta tag colors when switching themes
  useEffect(() => {
    const themeColor = theme.colors?.body;
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    const maskIcon = document.querySelector("link[rel='mask-icon']");
    const metaMsTileColor = document.querySelector(
      "meta[name='msapplication-TileColor']"
    );
    metaThemeColor && metaThemeColor.setAttribute("content", themeColor);
    metaMsTileColor && metaMsTileColor.setAttribute("content", themeColor);
    maskIcon && maskIcon.setAttribute("color", themeColor);
  }, [theme]);

  return (
    <>
      <h1 className="sr-only" aria-label="Utku Ceylan">
        Utku Ceylan
      </h1>
      {themeLoaded && (
        <ThemeProvider theme={theme}>
          <GlobalStyle theme={theme} />
          {/* Desktop Icons - below windows, hidden when any window is maximized */}
          <DesktopShortcuts
            onOpenTerminal={handleOpenFromShortcut}
            onOpenWelcome={handleOpenWelcome}
            onOpenResume={handleOpenResume}
            onOpenSocial={handleOpenSocial}
            hidden={
              terminalMaximized ||
              welcomeMaximized ||
              resumeMaximized ||
              socialMaximized
            }
            activeTerminal={!isMobile && terminalMounted && terminalVisible}
            activeBrowser={!isMobile && welcomeMounted && welcomeVisible}
            activeResume={!isMobile && resumeMounted && resumeVisible}
            activeSocial={!isMobile && socialMounted && socialVisible}
            mobileExpanded={isMobile && !terminalMounted}
          />

          {/* Fullscreen toggle control: hide when any window maximized; allow windows to overlap due to low z-index */}
          <FullscreenToggle
            isFullscreen={isFullscreen}
            onToggle={toggleFullscreen}
            hidden={
              terminalMaximized ||
              welcomeMaximized ||
              resumeMaximized ||
              socialMaximized
            }
          />

          {/* Welcome Browser Window opens on start on desktop only */}
          {welcomeMounted && (
            <WelcomeBrowserWindow
              onClose={handleWelcomeClose}
              onMinimize={!isMobile ? handleWelcomeMinimize : undefined}
              onToggleMaximize={!isMobile ? handleWelcomeToggleMax : undefined}
              isMaximized={welcomeMaximized}
              visible={welcomeVisible}
              x={wbX}
              y={wbY}
              width={wbW}
              height={wbH}
              onMove={handleBrowserMove}
              onResize={handleBrowserResize}
              onFocus={bringBrowserToFront}
              zIndex={zBrowser}
              onOpenResume={handleOpenResume}
            />
          )}

          {/* Terminal Window */}
          {terminalMounted && (
            <Suspense
              fallback={
                <WindowFallback
                  x={winX}
                  y={winY}
                  width={winW}
                  height={winH}
                  maximized={terminalMaximized}
                  zIndex={zTerminal}
                />
              }
            >
              <TerminalWindow
                onClose={handleClose}
                // On mobile: only close button (omit minimize/maximize)
                onMinimize={!isMobile ? handleMinimize : undefined}
                onToggleMaximize={!isMobile ? handleToggleMaximize : undefined}
                isMaximized={terminalMaximized}
                visible={terminalVisible}
                x={winX}
                y={winY}
                width={winW}
                height={winH}
                onMove={handleTerminalMove}
                onResize={handleTerminalResize}
                onFocus={bringTerminalToFront}
                zIndex={zTerminal}
              />
            </Suspense>
          )}

          {/* Resume Window */}
          {resumeMounted && (
            <Suspense
              fallback={
                <WindowFallback
                  x={rsX}
                  y={rsY}
                  width={rsW}
                  height={rsH}
                  maximized={resumeMaximized}
                  zIndex={zResume}
                />
              }
            >
              <ResumeWindow
                onClose={handleResumeClose}
                // On mobile: only close button (omit minimize/maximize)
                onMinimize={!isMobile ? handleResumeMinimize : undefined}
                onToggleMaximize={!isMobile ? handleResumeToggleMax : undefined}
                isMaximized={resumeMaximized}
                visible={resumeVisible}
                x={rsX}
                y={rsY}
                width={rsW}
                height={rsH}
                onMove={handleResumeMove}
                onResize={handleResumeResize}
                onFocus={bringResumeToFront}
                zIndex={zResume}
              />
            </Suspense>
          )}

          {/* Social Window */}
          {socialMounted && (
            <Suspense
              fallback={
                <WindowFallback
                  x={scX}
                  y={scY}
                  width={scW}
                  height={scH}
                  maximized={socialMaximized}
                  zIndex={zSocial}
                />
              }
            >
              <SocialWindow
                onClose={handleSocialClose}
                // On mobile: only close button (omit minimize/maximize)
                onMinimize={!isMobile ? handleSocialMinimize : undefined}
                onToggleMaximize={!isMobile ? handleSocialToggleMax : undefined}
                isMaximized={socialMaximized}
                visible={socialVisible}
                x={scX}
                y={scY}
                width={scW}
                height={scH}
                onMove={handleSocialMove}
                onResize={handleSocialResize}
                onFocus={bringSocialToFront}
                zIndex={zSocial}
              />
            </Suspense>
          )}
        </ThemeProvider>
      )}
    </>
  );
}

export default App;
