import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, useColorScheme } from "react-native";
import { palettes, type ColorScheme, type ThemeColors } from "./colors";
import { radius } from "./radius";
import { makeShadows, type Shadows } from "./shadows";
import { spacing } from "./spacing";
import { nativeColorScheme, resolveScheme, type ThemePreference } from "./themePreference";
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
  /** The scheme being rendered: the preference resolved against the device. */
  scheme: ColorScheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
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
  initialPreference = "system",
  onPreferenceChange,
}: {
  children: React.ReactNode;
  initialPreference?: ThemePreference;
  /** Called with every preference the user picks, so the app shell can persist it. */
  onPreferenceChange?: (preference: ThemePreference) => void;
}) {
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPreference);
  // Re-renders when the device switches between light and dark.
  const system = useColorScheme();
  const scheme = resolveScheme(preference, system);

  // Without this the keyboard and system prompts keep the device appearance
  // when the user picks the opposite theme in the app.
  useEffect(() => {
    Appearance.setColorScheme(nativeColorScheme(preference));
  }, [preference]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      onPreferenceChange?.(next);
    },
    [onPreferenceChange],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: buildTheme(scheme), scheme, preference, setPreference }),
    [scheme, preference, setPreference],
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
