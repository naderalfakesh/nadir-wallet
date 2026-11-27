import type { NetworkId } from "./network";

export interface Token {
  networkId: NetworkId;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  logoUri?: string;
}

export interface TokenBalance {
  token: Token;
  raw: string;
  formatted: string;
}
