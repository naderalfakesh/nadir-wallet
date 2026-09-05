import { describe, expect, it } from "vitest";
import {
  EMPTY_LOCKOUT,
  LOCKOUT_BASE_MS,
  LOCKOUT_MAX_MS,
  attemptsLeft,
  isLocked,
  lockRemainingMs,
  recordFailure,
  sanitizeLockout,
  type LockoutState,
} from "./lockout";

const NOW = 1_700_000_000_000;

function fail(times: number, from: LockoutState = EMPTY_LOCKOUT, now = NOW): LockoutState {
  let state = from;
  for (let i = 0; i < times; i += 1) state = recordFailure(state, now);
  return state;
}

describe("recordFailure", () => {
  it("counts failures without locking below the threshold", () => {
    const state = fail(4);
    expect(state.failures).toBe(4);
    expect(isLocked(state, NOW)).toBe(false);
    expect(attemptsLeft(state)).toBe(1);
  });

  it("locks for the base duration on the fifth failure", () => {
    const state = fail(5);
    expect(isLocked(state, NOW)).toBe(true);
    expect(lockRemainingMs(state, NOW)).toBe(LOCKOUT_BASE_MS);
    expect(attemptsLeft(state)).toBe(5);
  });

  it("ignores entries while locked", () => {
    const locked = fail(5);
    expect(recordFailure(locked, NOW + 1000)).toEqual(locked);
  });

  it("doubles the lock each time the threshold is hit again", () => {
    const first = fail(5);
    const afterFirst = NOW + LOCKOUT_BASE_MS;
    const second = fail(5, first, afterFirst);
    expect(second.failures).toBe(10);
    expect(lockRemainingMs(second, afterFirst)).toBe(LOCKOUT_BASE_MS * 2);
    const afterSecond = afterFirst + LOCKOUT_BASE_MS * 2;
    const third = fail(5, second, afterSecond);
    expect(lockRemainingMs(third, afterSecond)).toBe(LOCKOUT_BASE_MS * 4);
  });

  it("caps the lock at the maximum", () => {
    let state = EMPTY_LOCKOUT;
    let now = NOW;
    for (let round = 0; round < 12; round += 1) {
      state = fail(5, state, now);
      now = state.lockedUntil;
    }
    expect(lockRemainingMs(state, now - LOCKOUT_MAX_MS)).toBe(LOCKOUT_MAX_MS);
  });

  it("expires so the keypad reopens", () => {
    const state = fail(5);
    expect(isLocked(state, NOW + LOCKOUT_BASE_MS)).toBe(false);
    expect(lockRemainingMs(state, NOW + LOCKOUT_BASE_MS + 1)).toBe(0);
  });
});

describe("sanitizeLockout", () => {
  it("accepts a well-formed persisted state", () => {
    expect(sanitizeLockout({ failures: 3, lockedUntil: 42 })).toEqual({ failures: 3, lockedUntil: 42 });
  });

  it("falls back to empty for garbage", () => {
    expect(sanitizeLockout(null)).toEqual(EMPTY_LOCKOUT);
    expect(sanitizeLockout("nope")).toEqual(EMPTY_LOCKOUT);
    expect(sanitizeLockout({ failures: -1, lockedUntil: "soon" })).toEqual(EMPTY_LOCKOUT);
    expect(sanitizeLockout({ failures: 2.5 })).toEqual(EMPTY_LOCKOUT);
  });
});
