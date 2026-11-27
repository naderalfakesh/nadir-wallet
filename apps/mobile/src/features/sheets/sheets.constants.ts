import type { TranslationKey } from "@/i18n";
import type { ThemePreference } from "@/theme";

export const SHEET_DISMISS_DELAY_MS = 220;

export interface ThemeOption {
  value: ThemePreference;
  labelKey: TranslationKey;
  subKey: TranslationKey;
  swatch: readonly [string, string];
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    value: "system",
    labelKey: "sheets.theme.system",
    subKey: "sheets.theme.systemSub",
    swatch: ["#14171d", "#ffffff"],
  },
  {
    value: "dark",
    labelKey: "sheets.theme.dark",
    subKey: "sheets.theme.darkSub",
    swatch: ["#14171d", "#23272f"],
  },
  {
    value: "light",
    labelKey: "sheets.theme.light",
    subKey: "sheets.theme.lightSub",
    swatch: ["#ffffff", "#eef0f4"],
  },
];
