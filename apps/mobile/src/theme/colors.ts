export type ColorScheme = "dark" | "light";

export interface ThemeColors {
  bg: string;
  bgGrad1: string;
  bgGrad2: string;
  surface: string;
  surface2: string;
  surface3: string;
  hairline: string;
  hairlineStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentDim: string;
  accentInk: string;
  pos: string;
  neg: string;
  warn: string;
}

export const darkColors: ThemeColors = {
  bg: "#0b0f14",
  bgGrad1: "#12181f",
  bgGrad2: "#090c11",
  surface: "#171c23",
  surface2: "#20262e",
  surface3: "#293038",
  hairline: "rgba(255,255,255,0.075)",
  hairlineStrong: "rgba(255,255,255,0.13)",
  text: "#f5f7f9",
  textMuted: "#9ea4ab",
  textFaint: "#6b7177",
  accent: "#5ed8a9",
  accentDim: "rgba(94,216,169,0.15)",
  accentInk: "#0e1721",
  pos: "#5ed8a9",
  neg: "#e2867d",
  warn: "#e7c275",
};

export const lightColors: ThemeColors = {
  bg: "#f5f7f9",
  bgGrad1: "#e9edf2",
  bgGrad2: "#f9fafc",
  surface: "#ffffff",
  surface2: "#eef0f3",
  surface3: "#e0e3e8",
  hairline: "rgba(15,20,35,0.085)",
  hairlineStrong: "rgba(15,20,35,0.16)",
  text: "#1e232c",
  textMuted: "#60656e",
  textFaint: "#838890",
  accent: "#008258",
  accentDim: "rgba(0,130,88,0.13)",
  accentInk: "#f9fdfb",
  pos: "#2c8e66",
  neg: "#c84742",
  warn: "#b0792a",
};

export const palettes: Record<ColorScheme, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};
