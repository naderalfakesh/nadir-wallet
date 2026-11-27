import type { LockoutState } from "@/services/auth/lockout";
import type { Prefs } from "@/services/storage";
import type { LogSecurityEvent } from "./useSecurityEventLog";

export interface AppValue {
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  hasPasscode: boolean;
  setPasscode: (pin: string) => Promise<void>;
  verifyPasscode: (pin: string) => Promise<boolean>;
  lockout: LockoutState;
  recordUnlockFailure: () => LockoutState;
  clearLockout: () => void;
  logEvent: LogSecurityEvent;
  sessionUnlocked: boolean;
  unlockSession: () => void;
  lockSession: () => void;
  createWallet: (mnemonic: string, opts: { imported: boolean }) => Promise<string>;
  resetWallet: () => Promise<void>;
  introSeen: boolean;
  markIntroSeen: () => void;
}
