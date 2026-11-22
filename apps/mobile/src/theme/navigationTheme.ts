import type { ColorScheme, ThemeColors } from "./colors";

/**
 * The colours React Navigation paints behind and between screens. Its built-in
 * theme is light, so without these the gap shown while one route group closes
 * and another slides in (locking the wallet, for example) flashes pale grey on
 * the dark theme.
 */
export function navigationColors(colors: ThemeColors, scheme: ColorScheme) {
  return {
    dark: scheme === "dark",
    colors: {
      primary: colors.accent,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.hairline,
      notification: colors.neg,
    },
  };
}
