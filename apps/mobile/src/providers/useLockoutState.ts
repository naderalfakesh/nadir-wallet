import { useCallback, useRef, useState } from "react";
import { EMPTY_LOCKOUT, recordFailure, type LockoutState } from "@/services/auth/lockout";
import { storage } from "@/services/storage";

export function useLockoutState(initial: LockoutState) {
  const [lockout, setLockout] = useState<LockoutState>(initial);
  const lockoutRef = useRef(initial);

  const commitLockout = useCallback((next: LockoutState) => {
    lockoutRef.current = next;
    setLockout(next);
    void storage.saveLockout(next).catch(() => undefined);
  }, []);

  const recordUnlockFailure = useCallback(() => {
    const next = recordFailure(lockoutRef.current, Date.now());
    commitLockout(next);
    return next;
  }, [commitLockout]);

  const clearLockout = useCallback(() => {
    if (lockoutRef.current.failures === 0 && lockoutRef.current.lockedUntil === 0) return;
    commitLockout(EMPTY_LOCKOUT);
  }, [commitLockout]);

  const resetLockout = useCallback(() => {
    lockoutRef.current = EMPTY_LOCKOUT;
    setLockout(EMPTY_LOCKOUT);
  }, []);

  return { lockout, recordUnlockFailure, clearLockout, resetLockout };
}
