import { describe, expect, it } from "vitest";
import type { PortfolioTransaction } from "@/features/wallet/types";
import { matchesSearch, searchTransactions, type SearchContext } from "./activity.utils";

const context: SearchContext = {
  typeLabels: { send: "Sent", receive: "Received", swap: "Swapped" },
  tokens: [
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "USDC", name: "USD Coin" },
  ],
};

function tx(overrides: Partial<PortfolioTransaction>): PortfolioTransaction {
  return {
    id: "1",
    type: "send",
    token: "ETH",
    amount: 0.25,
    fiat: 500,
    party: "0xD1c9…5E0b",
    chain: "ethereum",
    status: "confirmed",
    when: "Today · 2:14 PM",
    day: "Today",
    fee: 1,
    confirmations: 12,
    hash: "0xabc123def",
    ...overrides,
  };
}

describe("matchesSearch", () => {
  it("matches everything for an empty query", () => {
    expect(matchesSearch(tx({}), "  ", context)).toBe(true);
  });

  it.each([
    ["party", "faucet", tx({ party: "Sepolia Faucet" })],
    ["token symbol", "eth", tx({})],
    ["token name", "ethereum", tx({})],
    ["type label", "sent", tx({})],
    ["amount text", "0.25 eth", tx({})],
    ["address", "d1c9", tx({})],
    ["hash", "ABC123", tx({})],
  ])("matches by %s case-insensitively", (_label, query, item) => {
    expect(matchesSearch(item, query, context)).toBe(true);
  });

  it("rejects unrelated queries", () => {
    expect(matchesSearch(tx({}), "bitcoin", context)).toBe(false);
  });
});

describe("searchTransactions", () => {
  it("filters and keeps order", () => {
    const list = [tx({ id: "a" }), tx({ id: "b", token: "USDC", type: "receive" })];
    expect(searchTransactions(list, "usd coin", context).map((t) => t.id)).toEqual(["b"]);
    expect(searchTransactions(list, "", context)).toBe(list);
  });
});
