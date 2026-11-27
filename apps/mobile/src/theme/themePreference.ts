import type { ColorScheme } from "./colors";

export type ThemePreference = "system" | "dark" | "light";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

const FALLBACK_SCHEME: ColorScheme = "dark";

export function parseThemePreference(raw: unknown): ThemePreference {
  return raw === "dark" || raw === "light" || raw === "system" ? raw : DEFAULT_THEME_PREFERENCE;
}

export function resolveScheme(preference: ThemePreference, system: unknown): ColorScheme {
  if (preference !== "system") return preference;
  return system === "light" || system === "dark" ? system : FALLBACK_SCHEME;
}

export function nativeColorScheme(preference: ThemePreference): ColorScheme | "auto" {
  return preference === "system" ? "auto" : preference;
}
