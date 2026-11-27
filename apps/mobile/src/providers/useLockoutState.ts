import { useCallback, useRef, useState } from "react";
import { EMPTY_LOCKOUT, recordFailure, type LockoutState } from "@/services/auth/lockout";
import { storage } from "@/services/storage";

/** Passcode lockout state, persisted on every change. */
export function useLockoutState(initial: LockoutState) {
  const [lockout, setLockout] = useState<LockoutState>(initial);
  // Mirror of the lockout state for synchronous reads inside callbacks.
  const lockoutRef = useRef(initial);

  const commitLockout = useCallback((next: LockoutState) => {
    lockoutRef.current = next;
    setLockout(next);
    void storage.saveLockout(next).catch(() => undefined);
  }, []);

  /** Records a failed passcode entry and returns the new lockout state. */
  const recordUnlockFailure = useCallback(() => {
    const next = recordFailure(lockoutRef.current, Date.now());
    commitLockout(next);
    return next;
  }, [commitLockout]);

  const clearLockout = useCallback(() => {
    if (lockoutRef.current.failures === 0 && lockoutRef.current.lockedUntil === 0) return;
    commitLockout(EMPTY_LOCKOUT);
  }, [commitLockout]);

  /** Drops the state in memory only; a wallet reset has already cleared storage. */
  const resetLockout = useCallback(() => {
    lockoutRef.current = EMPTY_LOCKOUT;
    setLockout(EMPTY_LOCKOUT);
  }, []);

  return { lockout, recordUnlockFailure, clearLockout, resetLockout };
}
