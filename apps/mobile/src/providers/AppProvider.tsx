import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { hashPasscodeAsync, mnemonicToEvmAddress, verifyPasscodeAsync } from "@nadir-wallet/crypto-core";
import type { SecurityEvent, SecurityEventType } from "@/types/status";
import { storage, DEFAULT_PREFS, type Prefs, type PersistedState } from "@/services/storage";
import { initialSecurityEvents } from "@/features/security/data";
import { makeSecurityEvent } from "@/features/security/events";
import { EMPTY_LOCKOUT, recordFailure, type LockoutState } from "@/features/auth/lockout";
import { persistNewWallet, persistPasscode } from "./walletPersistence";
import { clearScanHandoff } from "@/features/send/sendHandoff";

const MAX_EVENTS = 40;

interface AppValue {
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
  events: SecurityEvent[];
  logEvent: (type: SecurityEventType, opts?: { detail?: string; detailVars?: Record<string, string | number> }) => void;
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

const AppContext = createContext<AppValue | null>(null);

export function AppProvider({ initial, children }: { initial: PersistedState; children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(initial.prefs);
  const [passcodeHash, setPasscodeHash] = useState(initial.passcodeHash);
  const [lockout, setLockout] = useState<LockoutState>(initial.lockout);
  // Seed the log with demo history on first launch so the screen isn't empty.
  const [events, setEvents] = useState<SecurityEvent[]>(() =>
    initialSecurityEvents(initial.events, new Date()),
  );
  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const [introSeen, setIntroSeen] = useState(initial.introSeen);
  const counter = useRef(0);
  // Mirror of prefs so createWallet can persist the exact object it commits.
  const prefsRef = useRef(initial.prefs);
  // Mirror of the lockout state for synchronous reads inside callbacks.
  const lockoutRef = useRef(initial.lockout);

  const setPref = useCallback(<K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      prefsRef.current = next;
      void storage.savePrefs(next);
      return next;
    });
  }, []);

  const setPasscode = useCallback(async (pin: string) => {
    // Only adopt the new hash once it is stored, so a failed write can't leave
    // the app verifying against a PIN that won't exist after a restart.
    const record = await persistPasscode(pin, hashPasscodeAsync, storage.savePasscodeHash);
    setPasscodeHash(record);
  }, []);

  const verifyPasscode = useCallback(
    (pin: string) => (passcodeHash ? verifyPasscodeAsync(pin, passcodeHash) : Promise.resolve(false)),
    [passcodeHash],
  );

  const commitLockout = useCallback((next: LockoutState) => {
    lockoutRef.current = next;
    setLockout(next);
    void storage.saveLockout(next);
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

  const logEvent = useCallback<AppValue["logEvent"]>((type, opts) => {
    counter.current += 1;
    const id = `e-${Date.now()}-${counter.current}`;
    const event = makeSecurityEvent(id, type, new Date(), opts);
    setEvents((prev) => {
      const next = [event, ...prev].slice(0, MAX_EVENTS);
      void storage.saveEvents(next);
      return next;
    });
  }, []);

  const createWallet = useCallback<AppValue["createWallet"]>(
    async (mnemonic, opts) => {
      const address = mnemonicToEvmAddress(mnemonic);
      const next = await persistNewWallet(
        mnemonic,
        address,
        prefsRef.current,
        { imported: opts.imported, now: Date.now() },
        storage,
      );
      prefsRef.current = next;
      setPrefs(next);
      setSessionUnlocked(true);
      logEvent(opts.imported ? "imported" : "created");
      return address;
    },
    [logEvent],
  );

  const resetWallet = useCallback(async () => {
    await storage.clearWallet();
    clearScanHandoff();
    setSessionUnlocked(false);
    prefsRef.current = DEFAULT_PREFS;
    setPrefs(DEFAULT_PREFS);
    setPasscodeHash(null);
    lockoutRef.current = EMPTY_LOCKOUT;
    setLockout(EMPTY_LOCKOUT);
    setEvents([]);
  }, []);

  // A failed write only means the intro shows once more next launch, so the
  // user is never held on it.
  const markIntroSeen = useCallback(() => {
    setIntroSeen(true);
    void storage.saveIntroSeen().catch(() => undefined);
  }, []);

  const unlockSession = useCallback(() => setSessionUnlocked(true), []);
  // A scan waiting for Send must not survive a lock and fill Send after unlock.
  const lockSession = useCallback(() => {
    clearScanHandoff();
    setSessionUnlocked(false);
  }, []);

  const value = useMemo<AppValue>(
    () => ({
      prefs,
      setPref,
      hasPasscode: passcodeHash !== null,
      setPasscode,
      verifyPasscode,
      lockout,
      recordUnlockFailure,
      clearLockout,
      events,
      logEvent,
      sessionUnlocked,
      unlockSession,
      lockSession,
      createWallet,
      resetWallet,
      introSeen,
      markIntroSeen,
    }),
    [
      prefs,
      setPref,
      passcodeHash,
      setPasscode,
      verifyPasscode,
      lockout,
      recordUnlockFailure,
      clearLockout,
      events,
      logEvent,
      sessionUnlocked,
      unlockSession,
      lockSession,
      createWallet,
      resetWallet,
      introSeen,
      markIntroSeen,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
