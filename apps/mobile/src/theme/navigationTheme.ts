import type { ColorScheme, ThemeColors } from "./colors";

// Prevents pale-grey flash between route group transitions in dark mode.
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
