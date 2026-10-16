import type { AppStateLike } from "@/features/auth/sensitiveState";

export interface AutoLockTracker {
  /** Returns true when the session must lock on this transition. */
  onAppState: (next: AppStateLike, now: number, thresholdMs: number) => boolean;
  /** Forgets any recorded absence, e.g. one caused by the unlock prompt itself. */
  reset: () => void;
}

export function createAutoLockTracker(): AutoLockTracker {
  let leftAt: number | null = null;
  return {
    onAppState: (next, now, thresholdMs) => {
      if (next === "inactive" || next === "background") {
        // Keep the first timestamp: inactive is followed by background, and
        // restarting the clock there would shorten the measured absence.
        leftAt ??= now;
        return false;
      }
      if (next !== "active" || leftAt === null) return false;
      const elapsed = now - leftAt;
      leftAt = null;
      // A clock moved backwards can't prove the wallet was away briefly.
      return elapsed < 0 || elapsed >= thresholdMs;
    },
    reset: () => {
      leftAt = null;
    },
  };
}
