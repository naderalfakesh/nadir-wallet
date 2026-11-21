import { useMemo } from "react";
import { useTheme, type Theme } from "./ThemeProvider";

/**
 * Builds a theme-dependent StyleSheet once per theme. Pass a module-level
 * factory (`createHomeStyles`) so the styles are only rebuilt when the theme
 * changes, not on every render.
 */
export function useThemedStyles<T>(createStyles: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => createStyles(theme), [createStyles, theme]);
}
