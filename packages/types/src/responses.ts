import type { Network, NetworkId } from "./network";
import type { Token, TokenBalance } from "./token";
import type { WalletTransaction } from "./transaction";

export interface HealthResponse {
  status: "ok";
  uptimeSeconds: number;
  timestamp: string;
  version: string;
}

export interface NetworksResponse {
  networks: readonly Network[];
}

export interface TokensResponse {
  networkId: NetworkId;
  tokens: Token[];
}

export interface PriceQuote {
  symbol: string;
  priceUsd: number;
  source: string;
  updatedAt: number;
}

export interface PricesResponse {
  prices: PriceQuote[];
}

export interface WalletBalancesResponse {
  address: string;
  networkId: NetworkId;
  balances: TokenBalance[];
}

export interface WalletTransactionsResponse {
  address: string;
  networkId: NetworkId;
  transactions: WalletTransaction[];
}

export interface ReportAddressResponse {
  ok: true;
  id: number;
}
