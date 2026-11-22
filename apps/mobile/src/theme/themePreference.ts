import type { ColorScheme } from "./colors";

/** What the user picked: a fixed scheme, or follow the device setting. */
export type ThemePreference = "system" | "dark" | "light";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

/** The scheme used when the device reports none (unspecified or unknown). */
const FALLBACK_SCHEME: ColorScheme = "dark";

/** Reads a stored value. Legacy "dark" and "light" stay valid; anything else is "system". */
export function parseThemePreference(raw: unknown): ThemePreference {
  return raw === "dark" || raw === "light" || raw === "system" ? raw : DEFAULT_THEME_PREFERENCE;
}

/** Turns a preference plus the device scheme into the scheme to render. */
export function resolveScheme(preference: ThemePreference, system: unknown): ColorScheme {
  if (preference !== "system") return preference;
  return system === "light" || system === "dark" ? system : FALLBACK_SCHEME;
}

/**
 * The override handed to the OS so system-drawn UI (keyboard, alerts, the
 * biometric prompt) matches the in-app theme. "auto" removes the override.
 */
export function nativeColorScheme(preference: ThemePreference): ColorScheme | "auto" {
  return preference === "system" ? "auto" : preference;
}
