import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { storage } from "@/services/storage";
import { palettes, type ColorScheme, type ThemeColors } from "./colors";
import { spacing } from "./spacing";
import { radius } from "./radius";
import { fontFamily } from "./typography";
import { makeShadows, type Shadows } from "./shadows";

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
}: {
  children: React.ReactNode;
  initialScheme?: ColorScheme;
}) {
  const [scheme, setSchemeState] = useState<ColorScheme>(initialScheme);

  const setScheme = useCallback((next: ColorScheme) => {
    setSchemeState(next);
    void storage.saveTheme(next);
  }, []);

  const toggleScheme = useCallback(
    () => setSchemeState((s) => {
      const next = s === "dark" ? "light" : "dark";
      void storage.saveTheme(next);
      return next;
    }),
    [],
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
