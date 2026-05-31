import type { NetworkId } from "./network";

export type TransactionStatus = "pending" | "confirmed" | "failed";

export type TransactionType = "send" | "receive" | "contract_interaction";

export interface WalletTransaction {
  hash: string;
  networkId: NetworkId;
  type: TransactionType;
  status: TransactionStatus;
  from: string;
  to: string;
  valueRaw: string;
  valueFormatted: string;
  symbol: string;
  feeFormatted: string;
  timestamp: number;
  blockNumber?: number;
}
