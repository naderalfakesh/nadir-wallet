import type { Network, NetworkId } from "@secure-wallet/types";

export const SUPPORTED_NETWORKS: readonly Network[] = [
  {
    id: "ethereum-sepolia",
    name: "Ethereum Sepolia",
    shortName: "Sepolia",
    chainId: 11155111,
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    testnet: true,
    explorerUrl: "https://sepolia.etherscan.io",
    rpcEnvVar: "RPC_URL_ETHEREUM_SEPOLIA",
  },
  {
    id: "polygon-amoy",
    name: "Polygon Amoy",
    shortName: "Amoy",
    chainId: 80002,
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    testnet: true,
    explorerUrl: "https://amoy.polygonscan.com",
    rpcEnvVar: "RPC_URL_POLYGON_AMOY",
  },
];

const NETWORK_IDS = SUPPORTED_NETWORKS.map((network) => network.id);

export function isSupportedNetworkId(value: unknown): value is NetworkId {
  return typeof value === "string" && NETWORK_IDS.includes(value as NetworkId);
}

export function getNetwork(networkId: NetworkId): Network | undefined {
  return SUPPORTED_NETWORKS.find((network) => network.id === networkId);
}
