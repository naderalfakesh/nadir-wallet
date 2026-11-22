import { describe, expect, it } from "vitest";
import { normalizePrefs } from "./prefs";
import { DEFAULT_PREFS } from "./storage.constants";

describe("normalizePrefs", () => {
  it("gives a wallet saved before these fields existed their defaults", () => {
    const old = { onboardingCompleted: true, hideBalances: true, walletAddress: "0xabc" };
    const prefs = normalizePrefs(old);
    expect(prefs.onboardingCompleted).toBe(true);
    expect(prefs.hideBalances).toBe(true);
    expect(prefs.currency).toBe("USD");
    expect(prefs.enabledNetworks).toEqual(DEFAULT_PREFS.enabledNetworks);
    expect(prefs.privacy).toEqual({ shareUsageData: false, hideInSwitcher: true });
    expect(prefs.notifications).toEqual({
      incoming: true,
      sent: true,
      security: true,
      price: false,
    });
  });

  it("keeps stored values and fills missing nested flags", () => {
    const prefs = normalizePrefs({
      currency: "EUR",
      enabledNetworks: ["polygon"],
      privacy: { shareUsageData: true },
      notifications: { price: true, incoming: false },
    } as never);
    expect(prefs.currency).toBe("EUR");
    expect(prefs.enabledNetworks).toEqual(["polygon"]);
    expect(prefs.privacy).toEqual({ shareUsageData: true, hideInSwitcher: true });
    expect(prefs.notifications).toEqual({
      incoming: false,
      sent: true,
      security: true,
      price: true,
    });
  });

  it("rejects malformed values and never leaves zero networks enabled", () => {
    const prefs = normalizePrefs({
      currency: 5,
      enabledNetworks: [],
      privacy: { shareUsageData: "yes" },
      notifications: null,
    } as never);
    expect(prefs.currency).toBe("USD");
    expect(prefs.enabledNetworks).toEqual(DEFAULT_PREFS.enabledNetworks);
    expect(prefs.privacy).toEqual(DEFAULT_PREFS.privacy);
    expect(prefs.notifications).toEqual(DEFAULT_PREFS.notifications);
  });
});
