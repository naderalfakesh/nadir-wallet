import { useMemo } from "react";
import { useTheme, type Theme } from "./ThemeProvider";

export function useThemedStyles<T>(createStyles: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => createStyles(theme), [createStyles, theme]);
}
