import { Platform } from "react-native";
import type { ThemeColors } from "./colors";

type Shadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export function makeShadows(colors: ThemeColors, scheme: "dark" | "light") {
  const card: Shadow =
    scheme === "light"
      ? {
          shadowColor: "#0f1423",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 2,
        }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        };

  const accentGlow: Shadow = {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === "ios" ? 0.4 : 0.6,
    shadowRadius: 14,
    elevation: 6,
  };

  const toggleKnob: Shadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  };

  return { card, accentGlow, toggleKnob };
}

export type Shadows = ReturnType<typeof makeShadows>;
