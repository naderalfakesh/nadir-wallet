import type { LockoutState } from "@/services/auth/lockout";
import type { Prefs } from "@/services/storage";
import type { LogSecurityEvent } from "./useSecurityEventLog";

export interface AppValue {
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  /** True once the user has set an app-lock PIN. */
  hasPasscode: boolean;
  /** Hashes and stores a new PIN. Rejects, leaving the old PIN in place, if the keychain write fails. */
  setPasscode: (pin: string) => Promise<void>;
  /** Checks a PIN against the stored hash. Always false when none is set. */
  verifyPasscode: (pin: string) => Promise<boolean>;
  lockout: LockoutState;
  /** Records a failed passcode entry and returns the new lockout state. */
  recordUnlockFailure: () => LockoutState;
  clearLockout: () => void;
  logEvent: LogSecurityEvent;
  /** In memory only: false on every cold start until the lock screen (or onboarding) succeeds. */
  sessionUnlocked: boolean;
  unlockSession: () => void;
  lockSession: () => void;
  // Derives the address, stores the mnemonic in the keychain and marks the
  // wallet as created/imported, then unlocks the session. Rejects without
  // marking onboarding complete if either write fails. Returns the address.
  createWallet: (mnemonic: string, opts: { imported: boolean }) => Promise<string>;
  resetWallet: () => Promise<void>;
  /** The first-run intro was finished or skipped on this device. */
  introSeen: boolean;
  markIntroSeen: () => void;
}
