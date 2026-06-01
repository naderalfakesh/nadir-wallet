import type { NetworkId, TokenBalance, WalletTransaction } from "@nadir-wallet/types";
import { api } from "@/services/api";
import type { PriceStatus } from "@/types/status";
import { shortAddr } from "@/utils/format";
import { NETWORK_TO_CHAIN, type DemoToken, type DemoTransaction, type TxType } from "./data";

const NETWORKS: NetworkId[] = ["ethereum-sepolia", "polygon-amoy"];

// Display metadata the API doesn't carry (brand colour, a demo 24h change).
const SYMBOL_COLOR: Record<string, string> = {
  ETH: "#7C93F0",
  USDC: "#3B7BFF",
  POL: "#A573FF",
  LINK: "#3a6df0",
};
const SYMBOL_CHANGE: Record<string, number> = {
  ETH: 1.84,
  USDC: 0.01,
  POL: 5.18,
  LINK: -1.4,
};
const colorFor = (s: string) => SYMBOL_COLOR[s] ?? "#8A93A6";
const changeFor = (s: string) => SYMBOL_CHANGE[s] ?? 0;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatWhenDay(ts: number, now: Date): { day: string; when: string } {
  const d = new Date(ts);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const day = sameDay(d, now) ? "Today" : sameDay(d, yesterday) ? "Yesterday" : `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return { day, when: `${day} · ${h}:${String(m).padStart(2, "0")} ${ampm}` };
}

function toDemoToken(balance: TokenBalance): DemoToken {
  const chain = NETWORK_TO_CHAIN[balance.token.networkId];
  const amount = Number(balance.formatted) || 0;
  return {
    id: `${balance.token.symbol.toLowerCase()}-${chain}`,
    symbol: balance.token.symbol,
    name: balance.token.name,
    chain,
    amount,
    price: 0,
    change: changeFor(balance.token.symbol),
    color: colorFor(balance.token.symbol),
    value: 0,
  };
}

function toDemoTransaction(tx: WalletTransaction, priceMap: Record<string, number>, now: Date): DemoTransaction {
  const type: TxType = tx.type === "receive" ? "receive" : tx.type === "contract_interaction" ? "swap" : "send";
  const incoming = type === "receive";
  const amount = Number(tx.valueFormatted) || 0;
  const { day, when } = formatWhenDay(tx.timestamp, now);
  return {
    id: tx.hash,
    type,
    token: tx.symbol,
    amount,
    fiat: amount * (priceMap[tx.symbol] ?? 0),
    party: type === "swap" ? "Contract" : shortAddr(incoming ? tx.from : tx.to, 6, 4),
    chain: NETWORK_TO_CHAIN[tx.networkId],
    status: tx.status,
    when,
    day,
    fee: Number(tx.feeFormatted) || 0,
    confirmations: tx.status === "confirmed" ? 32 : 0,
    hash: tx.hash,
  };
}

export interface LivePortfolio {
  tokens: DemoToken[];
  transactions: DemoTransaction[];
  total: number;
  change: number;
  priceStatus: PriceStatus;
}

// Fetches public balances/transactions/prices for a demo address across the two
// supported testnets. Returns null only when every network request fails, so
// callers can fall back to demo data. Sends a public address only.
export async function fetchLivePortfolio(address: string): Promise<LivePortfolio | null> {
  const perNetwork = await Promise.all(
    NETWORKS.map(async (net) => {
      const [balances, transactions] = await Promise.all([
        api.walletBalances(address, net),
        api.walletTransactions(address, net),
      ]);
      return {
        balances: balances.ok ? balances.data.balances : null,
        transactions: transactions.ok ? transactions.data.transactions : null,
      };
    }),
  );

  if (perNetwork.every((n) => n.balances === null && n.transactions === null)) return null;

  const balances = perNetwork.flatMap((n) => n.balances ?? []);
  const symbols = [...new Set(balances.map((b) => b.token.symbol))];

  let priceMap: Record<string, number> = {};
  let priceStatus: PriceStatus = "unavailable";
  if (symbols.length > 0) {
    const prices = await api.prices(symbols);
    if (prices.ok) {
      priceMap = Object.fromEntries(prices.data.prices.map((p) => [p.symbol, p.priceUsd]));
      priceStatus = "fresh";
    }
  }

  const tokens = balances.map((b) => {
    const token = toDemoToken(b);
    token.price = priceMap[token.symbol] ?? 0;
    token.value = token.amount * token.price;
    return token;
  });

  const now = new Date();
  const rawTx = perNetwork
    .flatMap((n) => n.transactions ?? [])
    .sort((a, b) => b.timestamp - a.timestamp);
  const transactions = rawTx.map((tx) => toDemoTransaction(tx, priceMap, now));

  const total = tokens.reduce((s, t) => s + t.value, 0);
  const change = total > 0 ? tokens.reduce((s, t) => s + t.change * t.value, 0) / total : 0;

  return { tokens, transactions, total, change, priceStatus };
}
