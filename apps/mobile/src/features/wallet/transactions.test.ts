import { describe, expect, it } from "vitest";
import type { Theme } from "@/theme";
import type { DemoTransaction, TxType } from "./types";
import { getTransactionAmount, getTransactionTime, getTransactionVerbs } from "./transactions";

const theme = { colors: { text: "text", textFaint: "faint", pos: "pos" } } as unknown as Theme;
const t = (key: string) => key;

function tx(overrides: Partial<DemoTransaction> = {}): DemoTransaction {
  return {
    id: "t1",
    type: "receive",
    token: "ETH",
    amount: 0.25,
    fiat: 760,
    party: "Faucet",
    chain: "ethereum",
    status: "confirmed",
    when: "Today · 2:14 PM",
    day: "Today",
    fee: 0.4,
    confirmations: 12,
    hash: "0xabc",
    ...overrides,
  };
}

describe("getTransactionVerbs", () => {
  it("maps every transaction type to its label key", () => {
    const verbs = getTransactionVerbs(t);
    const types: TxType[] = ["receive", "send", "swap"];
    for (const type of types) {
      expect(verbs[type]).toBe(`activity.verb.${type}`);
    }
  });
});

describe("getTransactionAmount", () => {
  it("shows incoming amounts as positive", () => {
    const amount = getTransactionAmount(tx(), theme);
    expect(amount.prefix).toBe("+");
    expect(amount.color).toBe("pos");
    expect(amount.style).toBeUndefined();
    expect(amount.text).toContain("ETH");
  });

  it("shows sends as negative and swaps as neutral", () => {
    expect(getTransactionAmount(tx({ type: "send" }), theme).prefix).toBe("−");
    expect(getTransactionAmount(tx({ type: "send" }), theme).color).toBe("text");
    expect(getTransactionAmount(tx({ type: "swap" }), theme).prefix).toBe("");
  });

  it("fades and strikes through failed transactions", () => {
    const amount = getTransactionAmount(tx({ type: "send", status: "failed" }), theme);
    expect(amount.color).toBe("faint");
    expect(amount.style).toEqual({ textDecorationLine: "line-through" });
  });
});

describe("getTransactionTime", () => {
  it("returns the time portion of a day-time label", () => {
    expect(getTransactionTime(tx())).toBe("2:14 PM");
  });

  it("falls back to the whole label without a separator", () => {
    expect(getTransactionTime(tx({ when: "May 28" }))).toBe("May 28");
  });
});
