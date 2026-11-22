import { getTransactionTime } from "@/features/wallet/transactions";
import type { PortfolioToken, PortfolioTransaction, TxType } from "@/features/wallet/types";
import type { TFunction } from "@/i18n";
import { fmtToken } from "@/utils/format";
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

export interface SearchContext {
  typeLabels: Record<TxType, string>;
  tokens: Pick<PortfolioToken, "symbol" | "name">[];
}

/** Case-insensitive match over party, token symbol and name, type label, amount, hash and chain. */
export function matchesSearch(
  tx: PortfolioTransaction,
  query: string,
  context: SearchContext,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const tokenName = context.tokens.find((token) => token.symbol === tx.token)?.name ?? "";
  const haystack = [
    tx.party,
    tx.token,
    tokenName,
    tx.type,
    context.typeLabels[tx.type],
    fmtToken(tx.amount, tx.token),
    String(tx.amount),
    tx.hash,
    tx.chain,
  ];
  return haystack.some((value) => value.toLowerCase().includes(needle));
}

export function searchTransactions(
  transactions: PortfolioTransaction[],
  query: string,
  context: SearchContext,
): PortfolioTransaction[] {
  return query.trim()
    ? transactions.filter((tx) => matchesSearch(tx, query, context))
    : transactions;
}
