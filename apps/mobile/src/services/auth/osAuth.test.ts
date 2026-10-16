import { beforeEach, describe, expect, it, vi } from "vitest";
import { isOsAuthInProgress, mapAuthError, planOsAuth, requireOsAuth } from "./osAuth";

const platform = vi.hoisted(() => ({ OS: "ios", Version: "27.0" as number | string }));
const la = vi.hoisted(() => ({
  getEnrolledLevelAsync: vi.fn(),
  authenticateAsync: vi.fn(),
}));

vi.mock("react-native", () => ({ Platform: platform }));
vi.mock("expo-local-authentication", () => ({
  ...la,
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
}));

const NONE = 0;
const SECRET = 1;
const WEAK = 2;
const STRONG = 3;

beforeEach(() => {
  platform.OS = "ios";
  platform.Version = "27.0";
  la.getEnrolledLevelAsync.mockReset().mockResolvedValue(3);
  la.authenticateAsync.mockReset().mockResolvedValue({ success: true });
});

describe("requireOsAuth", () => {
  it("succeeds when the OS prompt succeeds", async () => {
    await expect(requireOsAuth("Reveal")).resolves.toEqual({ ok: true });
  });

  it("asks for strong biometrics with the OS device-credential fallback", async () => {
    await requireOsAuth("Reveal");
    expect(la.authenticateAsync).toHaveBeenCalledWith({
      promptMessage: "Reveal",
      disableDeviceFallback: false,
      biometricsSecurityLevel: "strong",
    });
  });

  it("prompts on a passcode-only device (no biometrics enrolled)", async () => {
    la.getEnrolledLevelAsync.mockResolvedValue(1);
    await expect(requireOsAuth("Reveal")).resolves.toEqual({ ok: true });
    expect(la.authenticateAsync).toHaveBeenCalledTimes(1);
  });

  it("fails closed without prompting when nothing is enrolled", async () => {
    la.getEnrolledLevelAsync.mockResolvedValue(0);
    await expect(requireOsAuth("Reveal")).resolves.toEqual({ ok: false, reason: "unavailable" });
    expect(la.authenticateAsync).not.toHaveBeenCalled();
  });

  it("reports cancellation", async () => {
    la.authenticateAsync.mockResolvedValue({ success: false, error: "user_cancel" });
    await expect(requireOsAuth("Reveal")).resolves.toEqual({ ok: false, reason: "cancelled" });
  });

  it("reports a failed match", async () => {
    la.authenticateAsync.mockResolvedValue({ success: false, error: "authentication_failed" });
    await expect(requireOsAuth("Reveal")).resolves.toEqual({ ok: false, reason: "failed" });
  });

  it("reports biometric lockout", async () => {
    la.authenticateAsync.mockResolvedValue({ success: false, error: "lockout" });
    await expect(requireOsAuth("Reveal")).resolves.toEqual({ ok: false, reason: "lockout" });
  });

  it("fails closed when the native module throws", async () => {
    la.authenticateAsync.mockRejectedValue(new Error("boom"));
    await expect(requireOsAuth("Reveal")).resolves.toEqual({ ok: false, reason: "failed" });
    expect(isOsAuthInProgress()).toBe(false);
  });

  it("refuses a second prompt while one is in flight", async () => {
    let finish: (v: { success: boolean }) => void = () => undefined;
    la.authenticateAsync.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const first = requireOsAuth("Reveal");
    await vi.waitFor(() => expect(isOsAuthInProgress()).toBe(true));
    await expect(requireOsAuth("Reveal")).resolves.toEqual({ ok: false, reason: "cancelled" });
    finish({ success: true });
    await expect(first).resolves.toEqual({ ok: true });
    expect(isOsAuthInProgress()).toBe(false);
    expect(la.authenticateAsync).toHaveBeenCalledTimes(1);
  });
});

describe("mapAuthError", () => {
  it.each([
    ["user_cancel", "cancelled"],
    ["system_cancel", "cancelled"],
    ["app_cancel", "cancelled"],
    ["user_fallback", "cancelled"],
    ["not_enrolled", "unavailable"],
    ["not_available", "unavailable"],
    ["passcode_not_set", "unavailable"],
    ["missing_usage_description", "unavailable"],
    ["lockout", "lockout"],
    ["timeout", "failed"],
    [undefined, "failed"],
  ])("%s -> %s", (error, reason) => {
    expect(mapAuthError(error)).toBe(reason);
  });
});

describe("planOsAuth", () => {
  const strongWithCredential = {
    prompt: { disableDeviceFallback: false, biometricsSecurityLevel: "strong" },
  };

  it("refuses without a prompt when nothing is enrolled, on every platform", () => {
    expect(planOsAuth(NONE, "ios", "27.0", "Cancel")).toEqual({ refuse: "unavailable" });
    expect(planOsAuth(NONE, "android", 29, "Cancel")).toEqual({ refuse: "unavailable" });
    expect(planOsAuth(NONE, "android", 35, "Cancel")).toEqual({ refuse: "unavailable" });
  });

  it.each([
    ["ios", "27.0"],
    ["android", 27],
    ["android", 30],
    ["android", 35],
  ])("uses strong biometrics plus the device credential on %s %s", (os, version) => {
    for (const level of [SECRET, WEAK, STRONG]) {
      expect(planOsAuth(level, os, version, "Cancel")).toEqual(strongWithCredential);
    }
  });

  it.each([28, 29])("never combines strong biometrics with the credential on API %i", (api) => {
    for (const level of [SECRET, WEAK, STRONG]) {
      const plan = planOsAuth(level, "android", api, "Cancel");
      if ("prompt" in plan && plan.prompt.biometricsSecurityLevel === "strong") {
        expect(plan.prompt.disableDeviceFallback).toBe(true);
      }
    }
  });

  it("uses strong biometrics alone, with a cancel button, on API 28-29", () => {
    expect(planOsAuth(STRONG, "android", 29, "Cancel")).toEqual({
      prompt: {
        disableDeviceFallback: true,
        biometricsSecurityLevel: "strong",
        cancelLabel: "Cancel",
      },
    });
  });

  it("uses the device credential when no biometric is enrolled on API 28-29", () => {
    expect(planOsAuth(SECRET, "android", 28, "Cancel")).toEqual({
      prompt: { disableDeviceFallback: false, biometricsSecurityLevel: "weak" },
    });
  });

  it("refuses rather than accept a Class 2 biometric on API 28-29", () => {
    expect(planOsAuth(WEAK, "android", 28, "Cancel")).toEqual({ refuse: "needsStrongBiometric" });
    expect(planOsAuth(WEAK, "android", 29, "Cancel")).toEqual({ refuse: "needsStrongBiometric" });
  });
});

describe("requireOsAuth on Android 10 (API 29)", () => {
  beforeEach(() => {
    platform.OS = "android";
    platform.Version = 29;
  });

  it("prompts strong-only with the localized cancel label when a strong biometric is enrolled", async () => {
    await expect(requireOsAuth("Reveal")).resolves.toEqual({ ok: true });
    expect(la.authenticateAsync).toHaveBeenCalledWith({
      promptMessage: "Reveal",
      disableDeviceFallback: true,
      biometricsSecurityLevel: "strong",
      cancelLabel: "Cancel",
    });
  });

  it("fails closed without prompting when only a weak biometric is enrolled", async () => {
    la.getEnrolledLevelAsync.mockResolvedValue(WEAK);
    await expect(requireOsAuth("Reveal")).resolves.toEqual({
      ok: false,
      reason: "needsStrongBiometric",
    });
    expect(la.authenticateAsync).not.toHaveBeenCalled();
  });

  it("maps the negative button (user_cancel) to cancelled", async () => {
    la.authenticateAsync.mockResolvedValue({ success: false, error: "user_cancel" });
    await expect(requireOsAuth("Reveal")).resolves.toEqual({ ok: false, reason: "cancelled" });
  });
});
