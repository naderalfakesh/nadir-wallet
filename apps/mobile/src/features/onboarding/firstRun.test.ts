/// <reference types="node" />
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import onboarding from "@/i18n/locales/en/onboarding.json";
import { ROUTE_GROUPS, groupGuards } from "@/features/lock/routeAccess";
import { INTRO_SEEN_VALUE, INTRO_STEPS, initialOnboardingStep, nextIntroIndex, parseIntroSeen } from "./firstRun";

const secure = vi.hoisted(() => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));
const asyncStorage = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  multiRemove: vi.fn(),
}));

vi.mock("expo-secure-store", () => secure);
vi.mock("@react-native-async-storage/async-storage", () => ({ default: asyncStorage }));
vi.mock("react-native", () => ({ Platform: { OS: "ios", Version: "27.0" } }));
vi.mock("expo-local-authentication", () => ({
  getEnrolledLevelAsync: vi.fn(),
  authenticateAsync: vi.fn(),
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
}));

const { loadPersistedState, storage } = await import("@/services/storage");

const APP_DIR = join(__dirname, "..", "..", "app");

beforeEach(() => {
  secure.getItemAsync.mockReset().mockResolvedValue(null);
  secure.deleteItemAsync.mockReset().mockResolvedValue(undefined);
  asyncStorage.getItem.mockReset().mockResolvedValue(null);
  asyncStorage.setItem.mockReset().mockResolvedValue(undefined);
  asyncStorage.multiRemove.mockReset().mockResolvedValue(undefined);
});

describe("first-run intro", () => {
  it("is short: two or three steps", () => {
    expect(INTRO_STEPS.length).toBeGreaterThanOrEqual(2);
    expect(INTRO_STEPS.length).toBeLessThanOrEqual(3);
  });

  it("starts onboarding at the intro only until it has been seen", () => {
    expect(initialOnboardingStep(false)).toBe("intro");
    expect(initialOnboardingStep(true)).toBe("welcome");
  });

  it("walks the steps in order and then finishes", () => {
    const visited = [0];
    let next = nextIntroIndex(0);
    while (next !== null) {
      visited.push(next);
      next = nextIntroIndex(next);
    }
    expect(visited).toEqual(INTRO_STEPS.map((_, i) => i));
  });

  it("only treats the stored marker as seen", () => {
    expect(parseIntroSeen(INTRO_SEEN_VALUE)).toBe(true);
    expect(parseIntroSeen(null)).toBe(false);
    expect(parseIntroSeen("")).toBe(false);
    expect(parseIntroSeen("true")).toBe(false);
  });
});

describe("intro persistence", () => {
  it("loads as unseen on a fresh install", async () => {
    expect((await loadPersistedState()).introSeen).toBe(false);
  });

  it("loads as seen once the marker is stored", async () => {
    asyncStorage.getItem.mockImplementation(async (key: string) =>
      key === "nadir.intro" ? INTRO_SEEN_VALUE : null,
    );
    expect((await loadPersistedState()).introSeen).toBe(true);
  });

  it("falls back to unseen if storage can't be read, rather than blocking launch", async () => {
    asyncStorage.getItem.mockImplementation(async (key: string) => {
      if (key === "nadir.intro") throw new Error("storage unavailable");
      return null;
    });
    expect((await loadPersistedState()).introSeen).toBe(false);
  });

  it("writes the marker on finish or skip", async () => {
    await storage.saveIntroSeen();
    expect(asyncStorage.setItem).toHaveBeenCalledWith("nadir.intro", INTRO_SEEN_VALUE);
  });

  it("survives a wallet reset so returning users don't see it again", async () => {
    await storage.clearWallet();
    const removed = asyncStorage.multiRemove.mock.calls.flat(2);
    expect(removed).not.toContain("nadir.intro");
  });
});

describe("intro can't open around the lock", () => {
  it("is a step inside onboarding, not a route of its own", () => {
    expect(existsSync(join(APP_DIR, "intro.tsx"))).toBe(false);
    expect(Object.values(ROUTE_GROUPS).flat()).not.toContain("intro");
    const flow = readFileSync(join(__dirname, "OnboardingFlow.tsx"), "utf8");
    expect(flow).toMatch(/<IntroScreen/);
  });

  it("is unreachable once a wallet exists, locked or unlocked (cold start, deep link or restored state)", () => {
    expect(groupGuards({ onboarded: true, unlocked: false }).onboarding).toBe(false);
    expect(groupGuards({ onboarded: true, unlocked: true }).onboarding).toBe(false);
  });
});

describe("intro copy", () => {
  const intro = onboarding.intro as Record<string, unknown>;

  it.each(INTRO_STEPS.map((s) => s.id))("has a title and body for %s", (id) => {
    const step = intro[id] as { title?: string; body?: string };
    expect(step?.title).toBeTruthy();
    expect(step?.body).toBeTruthy();
  });

  it("says plainly that it is testnet-only and sends are simulated", () => {
    const text = INTRO_STEPS.map((s) => JSON.stringify(intro[s.id])).join(" ");
    expect(text).toMatch(/testnet/i);
    expect(text).toMatch(/simulated/i);
    expect(text).toMatch(/nothing is signed or broadcast/i);
  });

  it("asks for no consent and makes no real-funds claims", () => {
    const text = JSON.stringify(intro);
    expect(text).not.toMatch(/\b(agree|accept|consent|terms)\b/i);
    expect(text).not.toMatch(/your funds|approve transactions|secure your crypto/i);
  });

  it("doesn't tell users the generated phrase isn't real", () => {
    expect(onboarding.reveal.demoNote).not.toMatch(/no real keys/i);
  });

  // History is sample data and prices are estimates, so "only testnet data" overstates it.
  it("doesn't claim everything shown is testnet data", () => {
    expect(JSON.stringify(onboarding)).not.toMatch(/only shows testnet data/i);
  });
});
