import type { NetworkId } from "@nadir-wallet/types";
import { formatWhenDay } from "./when";
import type { Chain, ChainId, DemoToken, DemoTransaction, SavedRecipient } from "./types";

export type { Chain, ChainId, DemoToken, DemoTransaction, SavedRecipient, TxType } from "./types";

// Maps the mobile's chain ids to the two API-supported testnet networks.
export const CHAIN_TO_NETWORK: Partial<Record<ChainId, NetworkId>> = {
  ethereum: "ethereum-sepolia",
  polygon: "polygon-amoy",
};
export const NETWORK_TO_CHAIN: Record<NetworkId, ChainId> = {
  "ethereum-sepolia": "ethereum",
  "polygon-amoy": "polygon",
};
export function chainToNetworkId(chain: ChainId): NetworkId | null {
  return CHAIN_TO_NETWORK[chain] ?? null;
}

// Testnet-only demo data. Balances, prices and values are estimated and hold
// no real-world worth — they exist to validate the UI, not to track funds.

export const CHAINS: Record<ChainId, Chain> = {
  ethereum: { id: "ethereum", name: "Ethereum Sepolia", short: "Sepolia", color: "#7C93F0", explorerName: "Sepolia Etherscan", explorerHost: "sepolia.etherscan.io" },
  base: { id: "base", name: "Base Sepolia", short: "BaseSep", color: "#3B7BFF", explorerName: "Base Sepolia Scan", explorerHost: "sepolia.basescan.org" },
  arbitrum: { id: "arbitrum", name: "Arbitrum Sepolia", short: "ArbSep", color: "#3AA0F0", explorerName: "Arbiscan Sepolia", explorerHost: "sepolia.arbiscan.io" },
  optimism: { id: "optimism", name: "OP Sepolia", short: "OPSep", color: "#FF5A6E", explorerName: "OP Sepolia Scan", explorerHost: "sepolia-optimism.etherscan.io" },
  polygon: { id: "polygon", name: "Polygon Amoy", short: "Amoy", color: "#A573FF", explorerName: "Amoy Polygonscan", explorerHost: "amoy.polygonscan.com" },
};

const rawTokens: Omit<DemoToken, "value">[] = [
  { id: "eth", symbol: "ETH", name: "Sepolia Ether", chain: "ethereum", amount: 0.842, price: 3043.5, change: 1.84, color: "#7C93F0" },
  { id: "usdc", symbol: "USDC", name: "Test USDC", chain: "base", amount: 612.4, price: 1.0, change: 0.01, color: "#3B7BFF" },
  { id: "arb", symbol: "ARB", name: "Arbitrum (test)", chain: "arbitrum", amount: 410, price: 0.984, change: -2.4, color: "#3AA0F0" },
  { id: "op", symbol: "OP", name: "Optimism (test)", chain: "optimism", amount: 78, price: 1.842, change: 3.62, color: "#FF5A6E" },
  { id: "pol", symbol: "POL", name: "Polygon (Amoy)", chain: "polygon", amount: 120, price: 0.52, change: 5.18, color: "#A573FF" },
];

export const TOKENS: DemoToken[] = rawTokens.map((t) => ({ ...t, value: t.amount * t.price }));

export const PORTFOLIO_TOTAL = TOKENS.reduce((s, t) => s + t.value, 0);
export const PORTFOLIO_CHANGE_PCT =
  TOKENS.reduce((s, t) => s + t.change * t.value, 0) / PORTFOLIO_TOTAL;
export const PORTFOLIO_CHANGE_ABS = PORTFOLIO_TOTAL * (PORTFOLIO_CHANGE_PCT / 100);

export const RANGES = ["1H", "1D", "1W", "1M", "1Y", "All"] as const;
export type Range = (typeof RANGES)[number];

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Newest first. `ago` is how long before `now` each entry happened, so the
// history never shows a time that hasn't happened yet or a stale calendar date.
const rawTransactions: (Omit<DemoTransaction, "when" | "day"> & { ago: number })[] = [
  { id: "t3", type: "swap", token: "OP", amount: 78, fiat: 143.68, party: "ETH → OP", chain: "optimism", status: "pending", ago: 6 * MINUTE, fee: 0.05, confirmations: 0, hash: "0x71fd0a9c3e25b4860d17fa2e91c5083b6d4097ae23f1cb59802e6d41a7b0f3c8" },
  { id: "t1", type: "receive", token: "ETH", amount: 0.25, fiat: 760.88, party: "Sepolia Faucet", chain: "ethereum", status: "confirmed", ago: 48 * MINUTE, fee: 0.41, confirmations: 142, hash: "0x9c41a7e2f80b3d6c5a91e4072bd138fae6201c9d44ab7e35f0c2189d6e7a4b30" },
  { id: "t2", type: "send", token: "USDC", amount: 120.0, fiat: 120.0, party: "0xD1c9…5E0b", chain: "base", status: "confirmed", ago: 5 * HOUR, fee: 0.02, confirmations: 880, hash: "0x3e72b105d9af46c81207e5fa9b0c3d8124e6079ab5fd3c20198e4671a0db5c9f" },
  { id: "t4", type: "receive", token: "POL", amount: 120, fiat: 62.4, party: "Amoy Faucet", chain: "polygon", status: "confirmed", ago: DAY + 3 * HOUR, fee: 0.0001, confirmations: 4096, hash: "0x5a2cf09b4e16d738a0297fb1ce5083b6d4097ae23f1cb59802e6d41a7b0f3c8e" },
  { id: "t5", type: "send", token: "ARB", amount: 90, fiat: 88.56, party: "0x44Ae…D7c1", chain: "arbitrum", status: "confirmed", ago: DAY + 9 * HOUR, fee: 0.03, confirmations: 2310, hash: "0xa1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0fedcba9876543210" },
  { id: "t6", type: "receive", token: "USDC", amount: 500.0, fiat: 500.0, party: "Circle Faucet", chain: "base", status: "confirmed", ago: 6 * DAY + 2 * HOUR, fee: 0.02, confirmations: 9012, hash: "0xb7e3f9201a4c8d65e0792fa3bc15084d6e9217cf30ab5e48f1029d6a7b3c5e0f" },
  { id: "t7", type: "send", token: "ETH", amount: 0.04, fiat: 121.74, party: "0x9fE2…0aB3", chain: "ethereum", status: "failed", ago: 7 * DAY + 5 * HOUR, fee: 0.39, confirmations: 0, hash: "0xf0e1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3021123344556677889900", failReason: "Out of gas — the transaction ran out of gas before completing." },
];

/** Demo history dated in the recent past relative to `now`. */
export function demoTransactions(now: Date): DemoTransaction[] {
  return rawTransactions.map(({ ago, ...tx }) => ({ ...tx, ...formatWhenDay(now.getTime() - ago, now) }));
}

// Full 40-char addresses so the live risk API (which validates address format)
// returns the intended low/medium/high for each recent.
export const RECIPIENTS: SavedRecipient[] = [
  { addr: "0x6b2fA0e1c4D9b8721a3F5e0c91A4D3b21f9C0e57", label: "demo.eth", network: "ethereum", known: true },
  { addr: "0x44Ae7C13b9F02d6E8a51c0937dD7c1A2b3C4D5e6", label: null, network: "polygon", known: false },
  { addr: "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef", label: "Reported address", network: "ethereum", known: false, flagged: true },
];

// The real address comes from prefs.walletAddress (derived on-device); this is
// just the display name shown alongside it.
export const ACCOUNT = {
  label: "Main Wallet",
  caption: "Testnet account",
};

export function tokenById(id: string): DemoToken {
  return TOKENS.find((t) => t.id === id) ?? TOKENS[0];
}

export function chainBadgeColor(chain: ChainId): string | undefined {
  // The primary network (Sepolia) shows no chain badge in the design.
  return chain === "ethereum" ? undefined : CHAINS[chain].color;
}
