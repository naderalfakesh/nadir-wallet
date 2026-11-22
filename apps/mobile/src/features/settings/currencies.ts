import type { TranslationKey } from "@/i18n";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "AED" | "TRY" | "JPY";

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  nameKey: TranslationKey;
}

export const CURRENCIES: readonly CurrencyOption[] = [
  { code: "USD", symbol: "$", nameKey: "settings.currencies.USD" },
  { code: "EUR", symbol: "€", nameKey: "settings.currencies.EUR" },
  { code: "GBP", symbol: "£", nameKey: "settings.currencies.GBP" },
  { code: "AED", symbol: "د.إ", nameKey: "settings.currencies.AED" },
  { code: "TRY", symbol: "₺", nameKey: "settings.currencies.TRY" },
  { code: "JPY", symbol: "¥", nameKey: "settings.currencies.JPY" },
];

/** The stored code, or USD when it isn't a supported one. */
export function currencyCode(stored: string): CurrencyCode {
  return CURRENCIES.find((c) => c.code === stored)?.code ?? "USD";
}
