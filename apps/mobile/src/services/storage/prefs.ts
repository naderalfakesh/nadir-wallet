import { DEFAULT_PREFS } from "./storage.constants";
import type { Prefs } from "./storage.types";

function mergeFlags<T extends object>(defaults: T, stored: unknown): T {
  if (!stored || typeof stored !== "object") return defaults;
  const out = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const value = (stored as Partial<T>)[key];
    if (typeof value === typeof defaults[key]) out[key] = value as T[keyof T];
  }
  return out;
}

export function normalizePrefs(stored: Partial<Prefs>): Prefs {
  const base = { ...DEFAULT_PREFS, ...stored };
  const networks = Array.isArray(stored.enabledNetworks)
    ? stored.enabledNetworks.filter((id): id is string => typeof id === "string")
    : [];
  return {
    ...base,
    currency:
      typeof stored.currency === "string" && stored.currency
        ? stored.currency
        : DEFAULT_PREFS.currency,
    enabledNetworks: networks.length > 0 ? networks : DEFAULT_PREFS.enabledNetworks,
    privacy: mergeFlags(DEFAULT_PREFS.privacy, stored.privacy),
    notifications: mergeFlags(DEFAULT_PREFS.notifications, stored.notifications),
  };
}
