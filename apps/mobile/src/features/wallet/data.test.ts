import { describe, expect, it } from "vitest";
import { demoTransactions } from "./data";

describe("demo transactions", () => {
  // Just after midnight, the case where a fixed "Today · 2:14 PM" label would be in the future.
  const now = new Date(2026, 10, 20, 0, 20);

  it("are dated relative to now, newest first, with no fixed calendar dates", () => {
    const txs = demoTransactions(now);
    expect(txs[0].day).toBe("Today");
    expect(txs.some((tx) => tx.when.startsWith("May"))).toBe(false);
    expect(txs.at(-1)!.day).toBe("Nov 12");
  });

  it("keep each day's entries together", () => {
    const days = demoTransactions(new Date(2026, 10, 20, 15, 0)).map((tx) => tx.day);
    expect(days).toEqual(["Today", "Today", "Today", "Yesterday", "Yesterday", "Nov 14", "Nov 13"]);
  });
});
