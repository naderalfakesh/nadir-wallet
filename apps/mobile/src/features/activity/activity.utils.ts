import type { PortfolioTransaction } from "@/features/wallet/data";
import { getTransactionTime } from "@/features/wallet/transactions";
import type { TFunction } from "@/i18n";
import type { ActivityFilter } from "./activity.types";

export function filterTransactions(
  transactions: PortfolioTransaction[],
  filter: ActivityFilter,
): PortfolioTransaction[] {
  return filter === "all" ? transactions : transactions.filter((tx) => tx.type === filter);
}

export function getActivityDays(transactions: PortfolioTransaction[]): string[] {
  return [...new Set(transactions.map((tx) => tx.day))];
}

export function getActivitySubtitle(tx: PortfolioTransaction, t: TFunction): string {
  const party =
    tx.type === "swap"
      ? tx.party
      : `${tx.type === "receive" ? t("activity.from") : t("activity.to")}${tx.party}`;
  return `${party}  ·  ${getTransactionTime(tx)}`;
}
