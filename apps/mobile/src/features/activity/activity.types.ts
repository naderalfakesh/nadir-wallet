import type { TxType } from "@/features/wallet/data";

export type ActivityFilter = "all" | TxType;

export interface ActivityFilterOption {
  value: ActivityFilter;
  label: string;
}
