import common from "./locales/en/common.json";
import onboarding from "./locales/en/onboarding.json";
import lock from "./locales/en/lock.json";
import home from "./locales/en/home.json";
import activity from "./locales/en/activity.json";
import security from "./locales/en/security.json";
import settings from "./locales/en/settings.json";
import status from "./locales/en/status.json";
import send from "./locales/en/send.json";
import token from "./locales/en/token.json";
import tx from "./locales/en/tx.json";
import receive from "./locales/en/receive.json";
import sheets from "./locales/en/sheets.json";
import liveness from "./locales/en/liveness.json";
import scan from "./locales/en/scan.json";

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

type Vars = Record<string, string | number>;

// Values every string may use without the caller passing them (the device's
// biometry name, set once at boot).
let defaultVars: Vars = {};

export function setDefaultVars(vars: Vars): void {
  defaultVars = { ...defaultVars, ...vars };
}

export function t(key: string, callerVars?: Vars): string {
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
