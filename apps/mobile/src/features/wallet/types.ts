import type { TransactionStatus } from "@nadir-wallet/types";

export type ChainId = "ethereum" | "base" | "arbitrum" | "optimism" | "polygon";

export interface Chain {
  id: ChainId;
  name: string;
  short: string;
  color: string;
  explorerName: string;
  explorerHost: string;
}

export interface DemoToken {
  id: string;
  symbol: string;
  name: string;
  chain: ChainId;
  amount: number;
  price: number;
  change: number;
  color: string;
  value: number;
}

export type TxType = "send" | "receive" | "swap";

export interface DemoTransaction {
  id: string;
  type: TxType;
  token: string;
  amount: number;
  fiat: number;
  party: string;
  chain: ChainId;
  status: TransactionStatus;
  when: string;
  day: string;
  fee: number;
  confirmations: number;
  hash: string;
  failReason?: string;
}

export interface SavedRecipient {
  addr: string;
  label: string | null;
  network: ChainId;
  known: boolean;
  flagged?: boolean;
}
