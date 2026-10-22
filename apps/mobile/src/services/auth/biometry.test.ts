import { beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "@/i18n";

const platform = vi.hoisted(() => ({ OS: "android" }));
const la = vi.hoisted(() => ({ supportedAuthenticationTypesAsync: vi.fn() }));

vi.mock("react-native", () => ({ Platform: platform }));
vi.mock("expo-local-authentication", () => ({
  ...la,
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
}));

const { biometryKindFor, biometryVars, loadBiometryKind } = await import("./biometry");

const FINGERPRINT = 1;
const FACE = 2;
const IRIS = 3;

beforeEach(() => {
  platform.OS = "android";
  la.supportedAuthenticationTypesAsync.mockReset();
});

describe("biometryKindFor", () => {
  it("keeps Face ID on iOS unless the device only has Touch ID", () => {
    expect(biometryKindFor("ios", null)).toBe("faceId");
    expect(biometryKindFor("ios", [FACE])).toBe("faceId");
    expect(biometryKindFor("ios", [FINGERPRINT])).toBe("touchId");
  });

  it("names the single Android sensor", () => {
    expect(biometryKindFor("android", [FINGERPRINT])).toBe("fingerprint");
    expect(biometryKindFor("android", [FACE])).toBe("face");
    expect(biometryKindFor("android", [IRIS])).toBe("iris");
  });

  it("uses neutral wording on Android with several sensors or none known", () => {
    expect(biometryKindFor("android", [FINGERPRINT, FACE])).toBe("generic");
    expect(biometryKindFor("android", [])).toBe("generic");
    expect(biometryKindFor("android", null)).toBe("generic");
  });
});

describe("biometric strings", () => {
  it("say Face ID on iOS", async () => {
    platform.OS = "ios";
    la.supportedAuthenticationTypesAsync.mockResolvedValue([FACE]);
    await loadBiometryKind();
    expect(t("lock.unlockBiometric")).toBe("Unlock with Face ID");
    expect(t("lock.useBiometricInstead")).toBe("Use Face ID instead");
    expect(t("security.protection.biometricSub")).toBe("Face ID");
    expect(t("security.log.biometricOnDetail")).toBe("Face ID turned on");
  });

  it("never say Face ID on an Android device with fingerprint and face", async () => {
    la.supportedAuthenticationTypesAsync.mockResolvedValue([FINGERPRINT, FACE]);
    await expect(loadBiometryKind()).resolves.toBe("generic");
    expect(t("lock.unlockBiometric")).toBe("Unlock with fingerprint or face");
    expect(t("lock.useBiometricInstead")).toBe("Use fingerprint or face instead");
    expect(t("lock.biometricFailed")).toMatch(/^Fingerprint or face didn't match/);
    expect(t("security.protection.biometricSub")).toBe("Fingerprint or face");
    expect(t("security.log.unlockBiometric")).toBe("Fingerprint or face");
    expect(t("security.log.biometricOnDetail")).toBe("Fingerprint or face turned on");
    for (const key of [
      "lock.unlockBiometric",
      "lock.useBiometric",
      "lock.biometricUnavailable",
      "lock.biometricCancelled",
      "lock.osAuth.authenticate",
      "lock.osAuth.unavailable",
      "onboarding.biometric.title",
      "onboarding.biometric.body",
      "onboarding.intro.keys.body",
      "onboarding.backup.revealGate",
      "security.advanced.revealSub",
      "security.log.biometricOffDetail",
    ]) {
      expect(t(key)).not.toMatch(/Face ID|\{\{/);
    }
  });

  it("names a fingerprint-only Android device", async () => {
    la.supportedAuthenticationTypesAsync.mockResolvedValue([FINGERPRINT]);
    await loadBiometryKind();
    expect(t("lock.unlockBiometric")).toBe("Unlock with fingerprint");
  });

  it("falls back to the platform default when the device can't be asked", async () => {
    la.supportedAuthenticationTypesAsync.mockRejectedValue(new Error("no module"));
    await expect(loadBiometryKind()).resolves.toBe("generic");
  });

  it("capitalises the name for the start of a sentence", () => {
    expect(biometryVars("generic")).toEqual({
      biometry: "fingerprint or face",
      Biometry: "Fingerprint or face",
    });
    expect(biometryVars("faceId")).toEqual({ biometry: "Face ID", Biometry: "Face ID" });
  });
});
