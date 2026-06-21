import type { DemoTransaction } from "@/features/wallet/data";
import { getTransactionTime } from "@/features/wallet/transactions";
import type { ActivityFilter } from "./activity.types";

type Translate = (key: string, values?: Record<string, string | number>) => string;

export function filterTransactions(transactions: DemoTransaction[], filter: ActivityFilter): DemoTransaction[] {
  return filter === "all" ? transactions : transactions.filter((tx) => tx.type === filter);
}

export function getActivityDays(transactions: DemoTransaction[]): string[] {
  return [...new Set(transactions.map((tx) => tx.day))];
}

export function getActivitySubtitle(tx: DemoTransaction, t: Translate): string {
  const party =
    tx.type === "swap" ? tx.party : `${tx.type === "receive" ? t("activity.from") : t("activity.to")}${tx.party}`;
  return `${party}  ·  ${getTransactionTime(tx)}`;
}
