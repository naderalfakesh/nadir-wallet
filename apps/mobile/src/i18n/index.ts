import activity from "./locales/en/activity.json";
import common from "./locales/en/common.json";
import home from "./locales/en/home.json";
import liveness from "./locales/en/liveness.json";
import lock from "./locales/en/lock.json";
import onboarding from "./locales/en/onboarding.json";
import receive from "./locales/en/receive.json";
import scan from "./locales/en/scan.json";
import security from "./locales/en/security.json";
import send from "./locales/en/send.json";
import settings from "./locales/en/settings.json";
import sheets from "./locales/en/sheets.json";
import status from "./locales/en/status.json";
import token from "./locales/en/token.json";
import tx from "./locales/en/tx.json";

// English is the source and fallback language. Strings live in per-domain files
// so the app can become multilingual without a rewrite.
const resources = {
  common,
  onboarding,
  lock,
  home,
  activity,
  security,
  settings,
  status,
  send,
  token,
  tx,
  receive,
  sheets,
  liveness,
  scan,
} as const;

export type TranslationVars = Record<string, string | number>;

// Every dotted path to a string in the resources, e.g. "send.review.total".
type LeafPaths<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: LeafPaths<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>;
    }[keyof T & string];

/** A key that exists in the English resources; a typo fails typecheck. */
export type TranslationKey = LeafPaths<typeof resources>;

export type TFunction = (key: TranslationKey, vars?: TranslationVars) => string;

// Values every string may use without the caller passing them (the device's
// biometry name, set once at boot).
let defaultVars: TranslationVars = {};

export function setDefaultVars(vars: TranslationVars): void {
  defaultVars = { ...defaultVars, ...vars };
}

export function t(key: TranslationKey, callerVars?: TranslationVars): string {
  const [namespace, ...path] = key.split(".");
  let node: unknown = (resources as Record<string, unknown>)[namespace];
  for (const segment of path) {
    if (node && typeof node === "object" && segment in node) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return key;
    }
  }
  if (typeof node !== "string") return key;
  const vars = { ...defaultVars, ...callerVars };
  return node.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    name in vars ? String(vars[name]) : `{{${name}}}`,
  );
}
