import type { TransactionType, WalletTransaction } from "@nadir-wallet/types";
import { shortenAddress } from "@nadir-wallet/crypto-core";

const TYPE_LABELS: Record<TransactionType, string> = {
  send: "Sent",
  receive: "Received",
  contract_interaction: "Contract interaction",
};

export function formatTransactionType(type: TransactionType): string {
  return TYPE_LABELS[type] ?? type;
}

export function describeTransaction(transaction: WalletTransaction): string {
  const label = formatTransactionType(transaction.type);
  if (transaction.type === "receive") {
    return `${label} ${transaction.valueFormatted} ${transaction.symbol} from ${shortenAddress(transaction.from)}`;
  }
  return `${label} ${transaction.valueFormatted} ${transaction.symbol} to ${shortenAddress(transaction.to)}`;
}
