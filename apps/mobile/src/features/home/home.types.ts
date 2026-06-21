import type { BackendStatus, PriceStatus } from "@/types/status";
import type { DemoToken, DemoTransaction, Range } from "@/features/wallet/data";

export type HomeQuickActionIcon = "receive" | "send" | "swap" | "trend";

export interface HomeQuickAction {
  icon: HomeQuickActionIcon;
  label: string;
  onPress: () => void;
  primary?: boolean;
}

export interface BalanceSummaryState {
  hidden: boolean;
  priceStatus: PriceStatus;
  backendStatus: BackendStatus;
  total: number;
  change: number;
  range: Range;
}

export interface TokenListState {
  tokens: DemoToken[];
  hidden: boolean;
  priceUnavailable: boolean;
}

export interface RecentActivityState {
  transactions: DemoTransaction[];
}
