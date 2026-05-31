import type { TokenBalance } from "@repo/types";

export interface PortfolioPosition {
  symbol: string;
  amount: string;
  priceUsd: number;
  valueUsd: number;
}

export interface PortfolioSummary {
  totalUsd: number;
  positions: PortfolioPosition[];
}

export function calculatePortfolio(
  balances: TokenBalance[],
  pricesBySymbol: Record<string, number>,
): PortfolioSummary {
  const positions = balances.map((balance) => {
    const amount = Number(balance.formatted);
    const priceUsd = pricesBySymbol[balance.token.symbol] ?? 0;
    const valueUsd = Number.isFinite(amount) ? amount * priceUsd : 0;
    return {
      symbol: balance.token.symbol,
      amount: balance.formatted,
      priceUsd,
      valueUsd,
    };
  });

  const totalUsd = positions.reduce((sum, position) => sum + position.valueUsd, 0);
  return { totalUsd, positions };
}
