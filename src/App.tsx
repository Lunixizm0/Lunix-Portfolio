import { createContext, useEffect, useRef, useState } from "react";
import { DefaultTheme, ThemeProvider } from "styled-components";
import { useTheme } from "./hooks/useTheme";
import GlobalStyle from "./components/styles/GlobalStyle";
import TerminalWindow from "./components/TerminalWindow";
import DesktopShortcuts from "./components/DesktopShortcuts";
import WelcomeBrowserWindow from "./components/WelcomeBrowserWindow";
import ResumeWindow from "./components/ResumeWindow";
import SocialWindow from "./components/SocialWindow";
import FullscreenToggle from "./components/FullscreenToggle";

export const themeContext = createContext<
  ((switchTheme: DefaultTheme) => void) | null
>(null);

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
  const { theme, themeLoaded, setMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

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
  const toggleFullscreen = async () => {
    if (!isFullscreen) await requestFullscreen();
    else await exitFullscreen();
  };
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

  // z-index stacking for windows (desktop): highest index on last focused
  const [zTop, setZTop] = useState(500);
  const [zBrowser, setZBrowser] = useState(200);
  const [zTerminal, setZTerminal] = useState(300);
  const [zResume, setZResume] = useState(400);
  const [zSocial, setZSocial] = useState(450);
  const bringBrowserToFront = () => {
    const next = zTop + 1;
    setZTop(next);
    setZBrowser(next);
  };
  const bringTerminalToFront = () => {
    const next = zTop + 1;
    setZTop(next);
    setZTerminal(next);
  };
  const bringResumeToFront = () => {
    const next = zTop + 1;
    setZTop(next);
    setZResume(next);
  };
  const bringSocialToFront = () => {
    const next = zTop + 1;
    setZTop(next);
    setZSocial(next);
  };
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
  }, [isMobile, themeLoaded]);

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
  });

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
  });

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

  useEffect(() => {
    setSelectedTheme(theme);
  }, [themeLoaded]);

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
  }, [selectedTheme]);

  const themeSwitcher = (switchTheme: DefaultTheme) => {
    setSelectedTheme(switchTheme);
    setMode(switchTheme);
  };

  // Terminal handlers
  const handleClose = () => {
    setTerminalMounted(false);
    setTerminalVisible(false);
    setTerminalMaximized(false);
  };
  const handleMinimize = () => {
    setTerminalVisible(false);
    setTerminalMaximized(false);
  };
  const handleOpenFromShortcut = () => {
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
    if (!terminalMounted) setTerminalMounted(true);
    setTerminalVisible(true);
    bringTerminalToFront();
  };
  const handleToggleMaximize = () => {
    setTerminalMaximized(prev => !prev);
    setTerminalVisible(true);
  };

  // Resume window handlers
  const handleResumeClose = () => {
    setResumeMounted(false);
    setResumeVisible(false);
    setResumeMaximized(false);
  };
  const handleResumeMinimize = () => {
    setResumeVisible(false);
    setResumeMaximized(false);
  };
  const handleOpenResume = () => {
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
    if (!resumeMounted) setResumeMounted(true);
    setResumeVisible(true);
    setResumeMaximized(true);
    bringResumeToFront();
  };
  const handleResumeToggleMax = () => {
    setResumeMaximized(p => !p);
    setResumeVisible(true);
  };

  // Social window handlers
  const handleSocialClose = () => {
    setSocialMounted(false);
    setSocialVisible(false);
    setSocialMaximized(false);
  };
  const handleSocialMinimize = () => {
    setSocialVisible(false);
    setSocialMaximized(false);
  };
  const handleOpenSocial = () => {
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
    if (!socialMounted) setSocialMounted(true);
    setSocialVisible(true);
    setSocialMaximized(true);
    bringSocialToFront();
  };
  const handleSocialToggleMax = () => {
    setSocialMaximized(p => !p);
    setSocialVisible(true);
  };

  // Welcome window handlers
  const handleWelcomeClose = () => {
    setWelcomeMounted(false);
    setWelcomeVisible(false);
    setWelcomeMaximized(false);
  };
  const handleWelcomeMinimize = () => {
    setWelcomeVisible(false);
    setWelcomeMaximized(false);
  };
  const handleOpenWelcome = () => {
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
    if (!welcomeMounted) setWelcomeMounted(true);
    setWelcomeVisible(true);
    bringBrowserToFront();
  };
  const handleWelcomeToggleMax = () => {
    setWelcomeMaximized(p => !p);
    setWelcomeVisible(true);
  };

  return (
    <>
      <h1 className="sr-only" aria-label="Utku Ceylan">
        Utku Ceylan
      </h1>
      {themeLoaded && (
        <ThemeProvider theme={selectedTheme}>
          <GlobalStyle theme={selectedTheme} />
          <themeContext.Provider value={themeSwitcher}>
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
                onToggleMaximize={
                  !isMobile ? handleWelcomeToggleMax : undefined
                }
                isMaximized={welcomeMaximized}
                visible={welcomeVisible}
                x={wbX}
                y={wbY}
                width={wbW}
                height={wbH}
                onMove={(x, y) => {
                  setWbX(x);
                  setWbY(y);
                  bringBrowserToFront();
                }}
                onResize={({ width, height, x, y }) => {
                  if (x !== undefined) setWbX(x);
                  if (y !== undefined) setWbY(y);
                  setWbW(width);
                  setWbH(height);
                  bringBrowserToFront();
                }}
                onFocus={bringBrowserToFront}
                zIndex={zBrowser}
                onOpenResume={handleOpenResume}
              />
            )}

            {/* Terminal Window */}
            {terminalMounted && (
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
                onMove={(x, y) => {
                  setWinX(x);
                  setWinY(y);
                  bringTerminalToFront();
                }}
                onResize={({ width, height, x, y }) => {
                  if (x !== undefined) setWinX(x);
                  if (y !== undefined) setWinY(y);
                  setWinW(width);
                  setWinH(height);
                  bringTerminalToFront();
                }}
                onFocus={bringTerminalToFront}
                zIndex={zTerminal}
              />
            )}

            {/* Resume Window */}
            {resumeMounted && (
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
                onMove={(x, y) => {
                  setRsX(x);
                  setRsY(y);
                  bringResumeToFront();
                }}
                onResize={({ width, height, x, y }) => {
                  if (x !== undefined) setRsX(x);
                  if (y !== undefined) setRsY(y);
                  setRsW(width);
                  setRsH(height);
                  bringResumeToFront();
                }}
                onFocus={bringResumeToFront}
                zIndex={zResume}
              />
            )}

            {/* Social Window */}
            {socialMounted && (
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
                onMove={(x, y) => {
                  setScX(x);
                  setScY(y);
                  bringSocialToFront();
                }}
                onResize={({ width, height, x, y }) => {
                  if (x !== undefined) setScX(x);
                  if (y !== undefined) setScY(y);
                  setScW(width);
                  setScH(height);
                  bringSocialToFront();
                }}
                onFocus={bringSocialToFront}
                zIndex={zSocial}
              />
            )}
          </themeContext.Provider>
        </ThemeProvider>
      )}
    </>
  );
}

export default App;
