import type { PortfolioToken } from "@/features/wallet/data";
import type { PriceStatus } from "@/types/status";
import { fmtToken, fmtUSD } from "@/utils/format";

export function isPriceUnavailable(price: PriceStatus): boolean {
  return price === "unavailable";
}

export function getBalanceValue(
  total: number,
  hidden: boolean,
  priceUnavailable: boolean,
  unavailableLabel: string,
): string {
  if (priceUnavailable) return unavailableLabel;
  return hidden ? "••••••" : fmtUSD(total);
}

export function getBalanceChange(total: number, change: number, hidden: boolean): string {
  if (hidden) return "••••";
  const previous = total / (1 + change / 100);
  return fmtUSD(total - previous, { sign: true });
}

export function getTokenValue(
  token: PortfolioToken,
  hidden: boolean,
  priceUnavailable: boolean,
): string {
  if (hidden) return "••••";
  if (priceUnavailable) return "—";
  return fmtUSD(token.value);
}

export function getTokenAmount(token: PortfolioToken, hidden: boolean): string {
  if (hidden) return `•••• ${token.symbol}`;
  return fmtToken(token.amount, token.symbol);
}
