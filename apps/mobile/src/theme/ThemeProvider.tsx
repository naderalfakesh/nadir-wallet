import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { palettes, type ColorScheme, type ThemeColors } from "./colors";
import { radius } from "./radius";
import { makeShadows, type Shadows } from "./shadows";
import { spacing } from "./spacing";
import { fontFamily } from "./typography";

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  font: typeof fontFamily;
  shadows: Shadows;
}

interface ThemeContextValue {
  theme: Theme;
  scheme: ColorScheme;
  setScheme: (scheme: ColorScheme) => void;
  toggleScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function buildTheme(scheme: ColorScheme): Theme {
  const colors = palettes[scheme];
  return {
    scheme,
    colors,
    spacing,
    radius,
    font: fontFamily,
    shadows: makeShadows(colors, scheme),
  };
}

export function ThemeProvider({
  children,
  initialScheme = "dark",
  onSchemeChange,
}: {
  children: React.ReactNode;
  initialScheme?: ColorScheme;
  /** Called with every scheme the user picks, so the app shell can persist it. */
  onSchemeChange?: (scheme: ColorScheme) => void;
}) {
  const [scheme, setSchemeState] = useState<ColorScheme>(initialScheme);

  const setScheme = useCallback(
    (next: ColorScheme) => {
      setSchemeState(next);
      onSchemeChange?.(next);
    },
    [onSchemeChange],
  );

  const toggleScheme = useCallback(
    () => setScheme(scheme === "dark" ? "light" : "dark"),
    [scheme, setScheme],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: buildTheme(scheme), scheme, setScheme, toggleScheme }),
    [scheme, setScheme, toggleScheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx.theme;
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeControls must be used within ThemeProvider");
  return ctx;
}
