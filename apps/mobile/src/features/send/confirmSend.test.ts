import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmSimulatedSend } from "./confirmSend";

const la = vi.hoisted(() => ({
  getEnrolledLevelAsync: vi.fn(),
  authenticateAsync: vi.fn(),
}));

vi.mock("react-native", () => ({ Platform: { OS: "ios", Version: "27.0" } }));
vi.mock("expo-local-authentication", () => ({
  ...la,
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
}));

beforeEach(() => {
  la.getEnrolledLevelAsync.mockReset().mockResolvedValue(3);
  la.authenticateAsync.mockReset().mockResolvedValue({ success: true });
});

describe("confirmSimulatedSend", () => {
  it("advances to the simulated outcome after OS auth succeeds", async () => {
    await expect(confirmSimulatedSend("Confirm", "success")).resolves.toEqual({
      ok: true,
      next: "pending",
    });
    await expect(confirmSimulatedSend("Confirm", "failed")).resolves.toEqual({
      ok: true,
      next: "failed",
    });
  });

  it("accepts the device-passcode fallback on a device without biometrics", async () => {
    la.getEnrolledLevelAsync.mockResolvedValue(1);
    await expect(confirmSimulatedSend("Confirm", "success")).resolves.toEqual({
      ok: true,
      next: "pending",
    });
  });

  it.each([
    ["user_cancel", "cancelled"],
    ["authentication_failed", "failed"],
    ["not_enrolled", "unavailable"],
  ])("does not advance when auth ends with %s", async (error, reason) => {
    la.authenticateAsync.mockResolvedValue({ success: false, error });
    await expect(confirmSimulatedSend("Confirm", "success")).resolves.toEqual({
      ok: false,
      reason,
    });
  });

  it("shows the simulated-send prompt text in the OS prompt", async () => {
    await confirmSimulatedSend("Confirm simulated send", "success");
    expect(la.authenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: "Confirm simulated send" }),
    );
  });

  it("does not advance on a biometric lockout", async () => {
    la.authenticateAsync.mockResolvedValue({ success: false, error: "lockout" });
    await expect(confirmSimulatedSend("Confirm", "success")).resolves.toEqual({
      ok: false,
      reason: "lockout",
    });
  });

  it("does not advance when the OS prompt throws", async () => {
    la.authenticateAsync.mockRejectedValue(new Error("native failure"));
    await expect(confirmSimulatedSend("Confirm", "failed")).resolves.toEqual({
      ok: false,
      reason: "failed",
    });
  });

  it("does not advance when no credential is enrolled", async () => {
    la.getEnrolledLevelAsync.mockResolvedValue(0);
    await expect(confirmSimulatedSend("Confirm", "success")).resolves.toEqual({
      ok: false,
      reason: "unavailable",
    });
    expect(la.authenticateAsync).not.toHaveBeenCalled();
  });
});
