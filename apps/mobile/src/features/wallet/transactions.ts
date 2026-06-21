import type { TextStyle } from "react-native";
import type { Theme } from "@/theme";
import { fmtToken } from "@/utils/format";
import type { DemoTransaction, TxType } from "./types";

type Translate = (key: string, values?: Record<string, string | number>) => string;

export function getTransactionVerbs(t: Translate): Record<TxType, string> {
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

export function getTransactionAmount(tx: DemoTransaction, theme: Theme): TransactionAmount {
  const incoming = tx.type === "receive";
  const color = tx.status === "failed" ? theme.colors.textFaint : incoming ? theme.colors.pos : theme.colors.text;
  const prefix = incoming ? "+" : tx.type === "send" ? "−" : "";
  const style = tx.status === "failed" ? { textDecorationLine: "line-through" as const } : undefined;
  return { color, prefix, text: fmtToken(tx.amount, tx.token), style };
}

/** The time portion of a "Today · 2:14 PM" timestamp, falling back to the whole label. */
export function getTransactionTime(tx: DemoTransaction): string {
  return tx.when.split(" · ")[1] ?? tx.when;
}

export type { TxType };
