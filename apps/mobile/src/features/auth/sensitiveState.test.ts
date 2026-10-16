import { describe, expect, it, vi } from "vitest";
import { handleSensitiveAppState, shouldClearSensitive } from "./sensitiveState";

describe("shouldClearSensitive", () => {
  it("clears on background or inactive when no prompt is showing", () => {
    expect(shouldClearSensitive("background", false)).toBe(true);
    expect(shouldClearSensitive("inactive", false)).toBe(true);
  });

  it("keeps state while the OS prompt is up (iOS inactive, Android credential activity)", () => {
    expect(shouldClearSensitive("inactive", true)).toBe(false);
    expect(shouldClearSensitive("background", true)).toBe(false);
  });

  it("keeps state when active", () => {
    expect(shouldClearSensitive("active", false)).toBe(false);
  });
});

describe("handleSensitiveAppState", () => {
  it("invalidates and clears together", () => {
    const guard = { invalidate: vi.fn() };
    const clear = vi.fn();
    handleSensitiveAppState("background", false, guard, clear);
    expect(guard.invalidate).toHaveBeenCalledTimes(1);
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it("does neither mid-prompt", () => {
    const guard = { invalidate: vi.fn() };
    const clear = vi.fn();
    handleSensitiveAppState("background", true, guard, clear);
    expect(guard.invalidate).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });
});
