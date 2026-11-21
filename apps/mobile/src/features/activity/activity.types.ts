import type { TxType } from "@/features/wallet/types";

export type ActivityFilter = "all" | TxType;

export interface ActivityFilterOption {
  value: ActivityFilter;
  label: string;
}
