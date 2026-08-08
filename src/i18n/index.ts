import { Lang, LANG } from "./lang";
import { en, En } from "./messages/en";
import { tr } from "./messages/tr";

export type { Lang } from "./lang";
export { LANG, DEFAULT_LANG, detectLang } from "./lang";
export type { En } from "./messages/en";

export type Messages = En;

const dictionaries: Record<Lang, Messages> = { en, tr };

export const messages: Messages = dictionaries[LANG];

/* Dot-path lookup with {var} interpolation, e.g. t("terminal.notFound", { cmd: "foo" }) */
export function t(key: string, vars?: Record<string, string | number>): string {
  const value = key.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object")
      return (acc as Record<string, unknown>)[k];
    return undefined;
  }, messages);
  let str = typeof value === "string" ? value : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}
