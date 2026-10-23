import { beforeEach, describe, expect, it, vi } from "vitest";
import { t } from "@/i18n";

const platform = vi.hoisted(() => ({ OS: "android" }));
const la = vi.hoisted(() => ({ supportedAuthenticationTypesAsync: vi.fn() }));

vi.mock("react-native", () => ({ Platform: platform }));
vi.mock("expo-local-authentication", () => ({
  ...la,
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
}));

const { biometryIcon, biometryKindFor, biometryVars, loadBiometryKind } =
  await import("./biometry");

const FINGERPRINT = 1;
const FACE = 2;
const IRIS = 3;

beforeEach(() => {
  platform.OS = "android";
  la.supportedAuthenticationTypesAsync.mockReset();
});

describe("biometryKindFor", () => {
  it("says Face ID or Touch ID on iOS, and stays neutral when iOS reports neither", () => {
    expect(biometryKindFor("ios", null)).toBe("generic");
    expect(biometryKindFor("ios", [])).toBe("generic");
    expect(biometryKindFor("ios", [FACE])).toBe("faceId");
    expect(biometryKindFor("ios", [FINGERPRINT])).toBe("touchId");
  });

  it("names the single Android sensor", () => {
    expect(biometryKindFor("android", [FINGERPRINT])).toBe("fingerprint");
    expect(biometryKindFor("android", [FACE])).toBe("face");
    expect(biometryKindFor("android", [IRIS])).toBe("iris");
  });

  it("uses neutral wording on Android with several sensors or none known", () => {
    expect(biometryKindFor("android", [FINGERPRINT, FACE])).toBe("multiple");
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
    await expect(loadBiometryKind()).resolves.toBe("multiple");
    expect(t("lock.unlockBiometric")).toBe("Unlock with fingerprint or face");
    expect(t("lock.useBiometricInstead")).toBe("Use fingerprint or face instead");
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

  it("stays neutral on an iOS device that reports no biometry", async () => {
    platform.OS = "ios";
    la.supportedAuthenticationTypesAsync.mockResolvedValue([]);
    await expect(loadBiometryKind()).resolves.toBe("generic");
    expect(t("lock.unlockBiometric")).toBe("Unlock with biometrics");
    expect(t("security.log.biometricOnDetail")).toBe("Biometrics turned on");
  });

  it('never splices a name into a sentence that already has an "or"', () => {
    for (const key of [
      "lock.biometricUnavailable",
      "lock.biometricFailed",
      "lock.biometricCancelled",
      "lock.osAuth.authenticate",
      "lock.osAuth.unavailable",
      "onboarding.intro.keys.body",
      "onboarding.backup.revealGate",
      "security.advanced.revealSub",
      "security.model.signBody",
      "sheets.howItWorks.signBody",
    ]) {
      expect(t(key)).not.toBe(key);
      expect(t(key)).toBe(t(key, { biometry: "X", Biometry: "X" }));
    }
  });

  it("uses the face icon only for face unlock", () => {
    expect(biometryIcon("faceId")).toBe("faceid");
    expect(biometryIcon("face")).toBe("faceid");
    for (const kind of ["touchId", "fingerprint", "iris", "multiple", "generic"] as const) {
      expect(biometryIcon(kind)).toBe("fingerprint");
    }
  });

  it("capitalises the name for the start of a sentence", () => {
    expect(biometryVars("multiple")).toEqual({
      biometry: "fingerprint or face",
      Biometry: "Fingerprint or face",
    });
    expect(biometryVars("faceId")).toEqual({ biometry: "Face ID", Biometry: "Face ID" });
  });
});
