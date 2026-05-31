export type NetworkId = "ethereum-sepolia" | "polygon-amoy";

export interface Network {
  id: NetworkId;
  name: string;
  shortName: string;
  chainId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet: true;
  explorerUrl: string;
  rpcEnvVar: string;
}
