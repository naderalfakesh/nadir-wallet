import type { PortfolioToken } from "../types";

// Testnet-only demo tokens. Balances, prices and values are estimated and hold
// no real-world worth — they exist to validate the UI, not to track funds.
const RAW_TOKENS: Omit<PortfolioToken, "value">[] = [
  {
    id: "eth",
    symbol: "ETH",
    name: "Sepolia Ether",
    chain: "ethereum",
    amount: 0.842,
    price: 3043.5,
    change: 1.84,
    color: "#7C93F0",
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "Test USDC",
    chain: "base",
    amount: 612.4,
    price: 1.0,
    change: 0.01,
    color: "#3B7BFF",
  },
  {
    id: "arb",
    symbol: "ARB",
    name: "Arbitrum (test)",
    chain: "arbitrum",
    amount: 410,
    price: 0.984,
    change: -2.4,
    color: "#3AA0F0",
  },
  {
    id: "op",
    symbol: "OP",
    name: "Optimism (test)",
    chain: "optimism",
    amount: 78,
    price: 1.842,
    change: 3.62,
    color: "#FF5A6E",
  },
  {
    id: "pol",
    symbol: "POL",
    name: "Polygon (Amoy)",
    chain: "polygon",
    amount: 120,
    price: 0.52,
    change: 5.18,
    color: "#A573FF",
  },
];

export const TOKENS: PortfolioToken[] = RAW_TOKENS.map((t) => ({
  ...t,
  value: t.amount * t.price,
}));

export const PORTFOLIO_TOTAL = TOKENS.reduce((sum, token) => sum + token.value, 0);
export const PORTFOLIO_CHANGE_PCT =
  TOKENS.reduce((sum, token) => sum + token.change * token.value, 0) / PORTFOLIO_TOTAL;
export const PORTFOLIO_CHANGE_ABS = PORTFOLIO_TOTAL * (PORTFOLIO_CHANGE_PCT / 100);

export function tokenById(id: string): PortfolioToken {
  return TOKENS.find((token) => token.id === id) ?? TOKENS[0];
}
