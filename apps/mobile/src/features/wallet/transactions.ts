import type { TextStyle } from "react-native";
import type { TFunction } from "@/i18n";
import type { Theme } from "@/theme";
import { fmtToken } from "@/utils/format";
import type { PortfolioTransaction, TxType } from "./types";

export function getTransactionVerbs(t: TFunction): Record<TxType, string> {
  return {
    receive: t("activity.verb.receive"),
    send: t("activity.verb.send"),
    swap: t("activity.verb.swap"),
  };
}

export interface TransactionAmount {
  color: string;
  prefix: string;
  text: string;
  style?: TextStyle;
}

export function getTransactionAmount(tx: PortfolioTransaction, theme: Theme): TransactionAmount {
  const incoming = tx.type === "receive";
  const color =
    tx.status === "failed"
      ? theme.colors.textFaint
      : incoming
        ? theme.colors.pos
        : theme.colors.text;
  const prefix = incoming ? "+" : tx.type === "send" ? "−" : "";
  const style =
    tx.status === "failed" ? { textDecorationLine: "line-through" as const } : undefined;
  return { color, prefix, text: fmtToken(tx.amount, tx.token), style };
}

export function getTransactionTime(tx: PortfolioTransaction): string {
  return tx.when.split(" · ")[1] ?? tx.when;
}

export type { TxType };
