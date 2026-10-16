import { describe, expect, it } from "vitest";
import { createAutoLockTracker } from "./autoLockTracker";

const MIN = 60_000;

describe("createAutoLockTracker", () => {
  it("locks when away for at least the threshold", () => {
    const t = createAutoLockTracker();
    expect(t.onAppState("background", 0, MIN)).toBe(false);
    expect(t.onAppState("active", MIN, MIN)).toBe(true);
  });

  it("does not lock after a short absence", () => {
    const t = createAutoLockTracker();
    t.onAppState("inactive", 0, MIN);
    expect(t.onAppState("active", MIN - 1, MIN)).toBe(false);
  });

  it("measures from the first inactive, not the later background event", () => {
    const t = createAutoLockTracker();
    t.onAppState("inactive", 0, MIN);
    t.onAppState("background", 30_000, MIN);
    expect(t.onAppState("active", MIN, MIN)).toBe(true);
  });

  it("locks when the clock moved backwards while away", () => {
    const t = createAutoLockTracker();
    t.onAppState("background", 10 * MIN, MIN);
    expect(t.onAppState("active", 5 * MIN, MIN)).toBe(true);
  });

  it("ignores an active event with no prior absence (cold start, repeated events)", () => {
    const t = createAutoLockTracker();
    expect(t.onAppState("active", 10 * MIN, MIN)).toBe(false);
    t.onAppState("background", 0, MIN);
    expect(t.onAppState("active", 2 * MIN, MIN)).toBe(true);
    expect(t.onAppState("active", 9 * MIN, MIN)).toBe(false);
  });

  it("ignores unknown/extension states", () => {
    const t = createAutoLockTracker();
    expect(t.onAppState("unknown", 0, MIN)).toBe(false);
    expect(t.onAppState("extension", MIN, MIN)).toBe(false);
  });
});

describe("reset", () => {
  it("drops an absence recorded during the unlock prompt, so unlocking doesn't relock", () => {
    const t = createAutoLockTracker();
    // Face ID / passcode prompt on the lock screen: inactive for longer than the threshold.
    t.onAppState("inactive", 0, MIN);
    // The session unlocks before the "active" event arrives.
    t.reset();
    expect(t.onAppState("active", 2 * MIN, MIN)).toBe(false);
  });

  it("still locks for an absence that starts after the reset", () => {
    const t = createAutoLockTracker();
    t.onAppState("inactive", 0, MIN);
    t.reset();
    t.onAppState("background", 3 * MIN, MIN);
    expect(t.onAppState("active", 5 * MIN, MIN)).toBe(true);
  });
});
