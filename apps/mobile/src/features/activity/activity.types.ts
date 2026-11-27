import type { PortfolioTransaction } from "@/features/wallet/types";

export type ActivityFilter = "all" | "receive" | "send" | "swap";

export interface ActivityFilterOption {
  value: ActivityFilter;
  label: string;
}

export interface ActivityDayGroup {
  day: string;
  transactions: PortfolioTransaction[];
}
