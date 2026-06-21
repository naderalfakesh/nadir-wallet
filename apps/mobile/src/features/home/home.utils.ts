import { fmtToken, fmtUSD } from "@/utils/format";
import type { DemoToken } from "@/features/wallet/data";

export function isPriceUnavailable(price: string): boolean {
  return price === "unavailable";
}

export function getBalanceValue(total: number, hidden: boolean, priceUnavailable: boolean, unavailableLabel: string): string {
  if (priceUnavailable) return unavailableLabel;
  return hidden ? "••••••" : fmtUSD(total);
}

export function getBalanceChange(total: number, change: number, hidden: boolean): string {
  if (hidden) return "••••";
  return fmtUSD(total * (change / 100), { sign: true });
}

export function getTokenValue(token: DemoToken, hidden: boolean, priceUnavailable: boolean): string {
  if (hidden) return "••••";
  if (priceUnavailable) return "—";
  return fmtUSD(token.value);
}

export function getTokenAmount(token: DemoToken): string {
  return fmtToken(token.amount, token.symbol);
}
