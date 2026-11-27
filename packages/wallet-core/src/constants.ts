import type { NetworkId } from "@nadir-wallet/types";

export const LARGE_AMOUNT_THRESHOLD = 5;

export const DEFAULT_TRANSFER_GAS_LIMIT = 21_000n;
export const CONTRACT_INTERACTION_GAS_LIMIT = 120_000n;

export const NETWORK_GAS_PRICE_GWEI: Record<NetworkId, number> = {
  "ethereum-sepolia": 2.5,
  "polygon-amoy": 30,
};

export const FALLBACK_GAS_PRICE_GWEI = 5;
