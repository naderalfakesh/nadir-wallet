import { beforeEach, describe, expect, it, vi } from "vitest";
import { persistNewWallet, persistPasscode } from "./walletPersistence";

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

const { DEFAULT_PREFS, storage } = await import("@/services/storage");

// Not a real wallet: the standard all-"test" development phrase.
const PHRASE = "test test test test test test test test test test test junk";
const ADDRESS = "0x0000000000000000000000000000000000000001";

beforeEach(() => {
  secure.setItemAsync.mockReset().mockResolvedValue(undefined);
  asyncStorage.setItem.mockReset().mockResolvedValue(undefined);
});

describe("storage.savePasscodeHash", () => {
  it("rejects when the keychain write fails instead of reporting success", async () => {
    secure.setItemAsync.mockRejectedValue(new Error("keychain unavailable"));
    await expect(storage.savePasscodeHash("record")).rejects.toThrow("keychain unavailable");
  });
});

describe("persistPasscode", () => {
  it("returns the record only after it is stored", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await expect(persistPasscode("123456", async () => "rec", save)).resolves.toBe("rec");
    expect(save).toHaveBeenCalledWith("rec");
  });

  it("rejects when storing fails, so the caller keeps the old PIN", async () => {
    const save = vi.fn().mockRejectedValue(new Error("write failed"));
    await expect(persistPasscode("123456", async () => "rec", save)).rejects.toThrow("write failed");
  });

  it("rejects end to end through the real storage when the keychain throws", async () => {
    secure.setItemAsync.mockRejectedValue(new Error("errSecInteractionNotAllowed"));
    await expect(persistPasscode("123456", async () => "rec", storage.savePasscodeHash)).rejects.toThrow();
  });
});

describe("persistNewWallet", () => {
  const opts = { imported: false, now: 1234 };

  it("stores the phrase, then the onboarded prefs, and returns them", async () => {
    const order: string[] = [];
    const writes = {
      saveMnemonic: vi.fn(async () => void order.push("mnemonic")),
      savePrefs: vi.fn(async () => void order.push("prefs")),
    };
    const next = await persistNewWallet(PHRASE, ADDRESS, DEFAULT_PREFS, opts, writes);
    expect(order).toEqual(["mnemonic", "prefs"]);
    expect(next).toMatchObject({
      onboardingCompleted: true,
      backupConfirmed: true,
      walletAddress: ADDRESS,
      walletCreatedAt: 1234,
    });
    expect(writes.savePrefs).toHaveBeenCalledWith(next);
  });

  it("an import is not marked as backed up", async () => {
    const writes = { saveMnemonic: vi.fn(async () => undefined), savePrefs: vi.fn(async () => undefined) };
    const next = await persistNewWallet(PHRASE, ADDRESS, DEFAULT_PREFS, { imported: true, now: 1 }, writes);
    expect(next.backupConfirmed).toBe(false);
  });

  it("never marks onboarding complete when the keychain write fails", async () => {
    const writes = {
      saveMnemonic: vi.fn().mockRejectedValue(new Error("keychain")),
      savePrefs: vi.fn(async () => undefined),
    };
    await expect(persistNewWallet(PHRASE, ADDRESS, DEFAULT_PREFS, opts, writes)).rejects.toThrow("keychain");
    expect(writes.savePrefs).not.toHaveBeenCalled();
  });

  it("rejects when the prefs write fails, so the UI can't claim the wallet is set up", async () => {
    asyncStorage.setItem.mockRejectedValue(new Error("disk full"));
    await expect(persistNewWallet(PHRASE, ADDRESS, DEFAULT_PREFS, opts, storage)).rejects.toThrow("disk full");
    expect(secure.setItemAsync).toHaveBeenCalledTimes(1);
  });
});
