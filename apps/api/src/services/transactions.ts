import type {
  NetworkId,
  TransactionStatus,
  TransactionType,
  WalletTransaction,
} from "@repo/types";
import { getNetwork, normalizeAddress, parseTokenAmount } from "@repo/crypto-core";
import { hashString, pseudoHex } from "../lib/mock";

const HISTORY_LENGTH = 8;
const DAY_MS = 86_400_000;
const NATIVE_DECIMALS = 18;

// Realistic mock history derived deterministically from the address. Replace with
// an indexer/RPC log query when real testnet history is wired up.
export function getTransactions(address: string, networkId: NetworkId): WalletTransaction[] {
  const network = getNetwork(networkId);
  const symbol = network?.nativeCurrency.symbol ?? "ETH";
  const owner = normalizeAddress(address);
  const now = Date.now();

  return Array.from({ length: HISTORY_LENGTH }, (_, index) => {
    const seed = hashString(`${owner.toLowerCase()}:${networkId}:${index}`);
    const isReceive = seed % 2 === 0;
    const type: TransactionType = isReceive ? "receive" : "send";
    const status: TransactionStatus = index === 0 && seed % 5 === 0 ? "pending" : "confirmed";
    const counterparty = pseudoHex(`${owner}:${index}:peer`, 20);
    const value = ((seed % 5000) / 1000 + 0.001).toFixed(4);
    const fee = ((seed % 500) / 1_000_000 + 0.00002).toFixed(8);

    return {
      hash: pseudoHex(`${owner}:${networkId}:${index}`, 32),
      networkId,
      type,
      status,
      from: isReceive ? counterparty : owner,
      to: isReceive ? owner : counterparty,
      valueRaw: parseTokenAmount(value, NATIVE_DECIMALS).toString(),
      valueFormatted: value,
      symbol,
      feeFormatted: fee,
      timestamp: now - index * DAY_MS - (seed % DAY_MS),
      blockNumber: 5_000_000 + (seed % 500_000),
    };
  });
}
