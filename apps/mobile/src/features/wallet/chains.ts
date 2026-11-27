import type { NetworkId } from "@nadir-wallet/types";
import type { Chain, ChainId } from "./types";

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

export const CHAINS: Record<ChainId, Chain> = {
  ethereum: {
    id: "ethereum",
    name: "Ethereum Sepolia",
    short: "Sepolia",
    color: "#7C93F0",
    explorerName: "Sepolia Etherscan",
    explorerHost: "sepolia.etherscan.io",
  },
  base: {
    id: "base",
    name: "Base Sepolia",
    short: "BaseSep",
    color: "#3B7BFF",
    explorerName: "Base Sepolia Scan",
    explorerHost: "sepolia.basescan.org",
  },
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum Sepolia",
    short: "ArbSep",
    color: "#3AA0F0",
    explorerName: "Arbiscan Sepolia",
    explorerHost: "sepolia.arbiscan.io",
  },
  optimism: {
    id: "optimism",
    name: "OP Sepolia",
    short: "OPSep",
    color: "#FF5A6E",
    explorerName: "OP Sepolia Scan",
    explorerHost: "sepolia-optimism.etherscan.io",
  },
  polygon: {
    id: "polygon",
    name: "Polygon Amoy",
    short: "Amoy",
    color: "#A573FF",
    explorerName: "Amoy Polygonscan",
    explorerHost: "amoy.polygonscan.com",
  },
};

export function chainBadgeColor(chain: ChainId): string | undefined {
  return chain === "ethereum" ? undefined : CHAINS[chain].color;
}
