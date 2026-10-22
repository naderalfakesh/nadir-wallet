import { beforeEach, describe, expect, it, vi } from "vitest";

const platform = vi.hoisted(() => ({ OS: "android" }));
const calls = vi.hoisted(() => [] as string[]);
const capture = vi.hoisted(() => ({
  preventScreenCaptureAsync: vi.fn(async (key: string) => void calls.push(`prevent:${key}`)),
  allowScreenCaptureAsync: vi.fn(async (key: string) => void calls.push(`allow:${key}`)),
  enableAppSwitcherProtectionAsync: vi.fn(async () => void calls.push("blur:on")),
  disableAppSwitcherProtectionAsync: vi.fn(async () => void calls.push("blur:off")),
}));

vi.mock("react-native", () => ({ Platform: platform }));
vi.mock("expo-screen-capture", () => capture);

const { holdScreenCaptureBlock, screenCaptureIdle } = await import("./screenCapture");

beforeEach(() => {
  platform.OS = "android";
  calls.length = 0;
  vi.clearAllMocks();
});

describe("holdScreenCaptureBlock", () => {
  it("blocks capture and allows it again on release", async () => {
    const release = holdScreenCaptureBlock("a");
    await screenCaptureIdle();
    expect(calls).toEqual(["prevent:a"]);
    release();
    await screenCaptureIdle();
    expect(calls).toEqual(["prevent:a", "allow:a"]);
  });

  it("does not touch the iOS app-switcher blur on Android (FLAG_SECURE covers recents)", async () => {
    holdScreenCaptureBlock("a")();
    await screenCaptureIdle();
    expect(capture.enableAppSwitcherProtectionAsync).not.toHaveBeenCalled();
    expect(capture.disableAppSwitcherProtectionAsync).not.toHaveBeenCalled();
  });

  it("blurs the iOS app-switcher snapshot while held", async () => {
    platform.OS = "ios";
    const release = holdScreenCaptureBlock("a");
    await screenCaptureIdle();
    expect(calls).toEqual(["prevent:a", "blur:on"]);
    expect(capture.enableAppSwitcherProtectionAsync).toHaveBeenCalledWith(1);
    release();
    await screenCaptureIdle();
    expect(calls).toEqual(["prevent:a", "blur:on", "allow:a", "blur:off"]);
  });

  it("keeps the iOS blur until the last holder releases", async () => {
    platform.OS = "ios";
    const releaseA = holdScreenCaptureBlock("a");
    const releaseB = holdScreenCaptureBlock("b");
    releaseA();
    await screenCaptureIdle();
    expect(calls).not.toContain("blur:off");
    releaseB();
    await screenCaptureIdle();
    expect(calls.at(-1)).toBe("blur:off");
  });

  it("runs an immediate release after the block, never before it", async () => {
    holdScreenCaptureBlock("a")();
    await screenCaptureIdle();
    expect(calls).toEqual(["prevent:a", "allow:a"]);
  });

  it("ignores a second release", async () => {
    const release = holdScreenCaptureBlock("a");
    release();
    release();
    await screenCaptureIdle();
    expect(capture.allowScreenCaptureAsync).toHaveBeenCalledTimes(1);
  });

  it("still releases after the block failed", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    capture.preventScreenCaptureAsync.mockRejectedValueOnce(new Error("no window"));
    const release = holdScreenCaptureBlock("a");
    await screenCaptureIdle();
    expect(warn).toHaveBeenCalled();
    release();
    await screenCaptureIdle();
    expect(capture.allowScreenCaptureAsync).toHaveBeenCalledWith("a");
    warn.mockRestore();
  });
});
