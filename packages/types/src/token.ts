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
  /** Amount in the token's smallest unit. */
  raw: string;
  /** Human-readable amount. */
  formatted: string;
}
