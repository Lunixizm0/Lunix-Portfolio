export type Lang = "en" | "tr";

export const DEFAULT_LANG: Lang = "en";

declare global {
  interface Window {
    __APP_LANG__?: Lang;
  }
}

/* Synchronous language detection — runs before the first React render.
   The inline <head> script in index.html sets window.__APP_LANG__; if it's
   missing (e.g. stale cached HTML) we fall back to the browser locale. */
export function detectLang(): Lang {
  const inline =
    typeof window !== "undefined" ? window.__APP_LANG__ : undefined;
  if (inline === "tr" || inline === "en") return inline;
  const nav =
    typeof navigator !== "undefined"
      ? (navigator.language || "").toLowerCase()
      : "";
  return nav.startsWith("tr") ? "tr" : "en";
}

export const LANG: Lang = detectLang();
