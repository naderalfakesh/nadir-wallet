import { beforeEach, describe, expect, it, vi } from "vitest";
import { revealMnemonic, saveMnemonic } from "./mnemonic";

const la = vi.hoisted(() => ({
  getEnrolledLevelAsync: vi.fn(),
  authenticateAsync: vi.fn(),
}));
const secure = vi.hoisted(() => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock("react-native", () => ({ Platform: { OS: "ios", Version: "27.0" } }));
vi.mock("expo-local-authentication", () => ({
  ...la,
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
}));
vi.mock("expo-secure-store", () => secure);

const PHRASE = "test test test test test test test test test test test junk";

beforeEach(() => {
  la.getEnrolledLevelAsync.mockReset().mockResolvedValue(3);
  la.authenticateAsync.mockReset().mockResolvedValue({ success: true });
  secure.getItemAsync.mockReset().mockResolvedValue(PHRASE);
  secure.setItemAsync.mockReset().mockResolvedValue(undefined);
});

describe("revealMnemonic", () => {
  it("reads the phrase only after the OS prompt succeeds", async () => {
    await expect(revealMnemonic("Reveal")).resolves.toEqual({ ok: true, mnemonic: PHRASE });
    expect(secure.getItemAsync).toHaveBeenCalledWith("nadir.mnemonic");
    expect(la.authenticateAsync.mock.invocationCallOrder[0]).toBeLessThan(
      secure.getItemAsync.mock.invocationCallOrder[0],
    );
  });

  it("reads after the device-passcode fallback succeeds on a passcode-only device", async () => {
    la.getEnrolledLevelAsync.mockResolvedValue(1);
    await expect(revealMnemonic("Reveal")).resolves.toEqual({ ok: true, mnemonic: PHRASE });
  });

  it.each([
    ["user_cancel", "cancelled"],
    ["authentication_failed", "failed"],
    ["lockout", "lockout"],
    ["passcode_not_set", "unavailable"],
  ])("never touches the keychain when auth ends with %s", async (error, reason) => {
    la.authenticateAsync.mockResolvedValue({ success: false, error });
    await expect(revealMnemonic("Reveal")).resolves.toEqual({ ok: false, reason });
    expect(secure.getItemAsync).not.toHaveBeenCalled();
  });

  it("never touches the keychain when no credential is enrolled", async () => {
    la.getEnrolledLevelAsync.mockResolvedValue(0);
    await expect(revealMnemonic("Reveal")).resolves.toEqual({ ok: false, reason: "unavailable" });
    expect(la.authenticateAsync).not.toHaveBeenCalled();
    expect(secure.getItemAsync).not.toHaveBeenCalled();
  });

  it("reports a missing phrase", async () => {
    secure.getItemAsync.mockResolvedValue(null);
    await expect(revealMnemonic("Reveal")).resolves.toEqual({ ok: false, reason: "missing" });
  });

  it("reports a keychain read error as a failure", async () => {
    secure.getItemAsync.mockRejectedValue(new Error("keychain"));
    await expect(revealMnemonic("Reveal")).resolves.toEqual({ ok: false, reason: "failed" });
  });
});

describe("saveMnemonic", () => {
  it("keeps the existing key and default keychain options", async () => {
    await saveMnemonic(PHRASE);
    expect(secure.setItemAsync).toHaveBeenCalledWith("nadir.mnemonic", PHRASE);
  });
});
