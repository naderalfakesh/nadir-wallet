import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { hashPasscodeAsync, mnemonicToEvmAddress, verifyPasscodeAsync } from "@nadir-wallet/crypto-core";
import type { SecurityEvent, SecurityEventType } from "@/types/status";
import { storage, DEFAULT_PREFS, type Prefs, type PersistedState } from "@/services/storage";
import { SECURITY_EVENTS } from "@/features/security/data";
import { makeSecurityEvent } from "@/features/security/events";
import { EMPTY_LOCKOUT, recordFailure, type LockoutState } from "@/features/auth/lockout";

const MAX_EVENTS = 40;

interface AppValue {
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  /** True once the user has set an app-lock PIN. */
  hasPasscode: boolean;
  /** Hashes and stores a new PIN. Resolves once the keychain write is issued. */
  setPasscode: (pin: string) => Promise<void>;
  /** Checks a PIN against the stored hash. Always false when none is set. */
  verifyPasscode: (pin: string) => Promise<boolean>;
  lockout: LockoutState;
  /** Records a failed passcode entry and returns the new lockout state. */
  recordUnlockFailure: () => LockoutState;
  clearLockout: () => void;
  events: SecurityEvent[];
  logEvent: (type: SecurityEventType, opts?: { detail?: string; detailVars?: Record<string, string | number> }) => void;
  // Derives the address, stores the mnemonic in the keychain and marks the
  // wallet as created/imported. Returns the derived public address.
  createWallet: (mnemonic: string, opts: { imported: boolean }) => Promise<string>;
  getMnemonic: () => Promise<string | null>;
  resetWallet: () => Promise<void>;
}

const AppContext = createContext<AppValue | null>(null);

export function AppProvider({ initial, children }: { initial: PersistedState; children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(initial.prefs);
  const [passcodeHash, setPasscodeHash] = useState(initial.passcodeHash);
  const [lockout, setLockout] = useState<LockoutState>(initial.lockout);
  // Seed the log with demo history on first launch so the screen isn't empty.
  const [events, setEvents] = useState<SecurityEvent[]>(
    initial.events.length ? initial.events : SECURITY_EVENTS,
  );
  const counter = useRef(0);
  // Mirror of the lockout state for synchronous reads inside callbacks.
  const lockoutRef = useRef(initial.lockout);

  const setPref = useCallback(<K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      void storage.savePrefs(next);
      return next;
    });
  }, []);

  const setPasscode = useCallback(async (pin: string) => {
    const record = await hashPasscodeAsync(pin);
    setPasscodeHash(record);
    await storage.savePasscodeHash(record);
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
      await storage.saveMnemonic(mnemonic);
      setPrefs((prev) => {
        const next: Prefs = {
          ...prev,
          onboardingCompleted: true,
          // Create flow verifies the phrase; import assumes the user has it.
          backupConfirmed: !opts.imported,
          walletAddress: address,
          walletCreatedAt: Date.now(),
        };
        void storage.savePrefs(next);
        return next;
      });
      logEvent(opts.imported ? "imported" : "created");
      return address;
    },
    [logEvent],
  );

  const getMnemonic = useCallback(() => storage.getMnemonic(), []);

  const resetWallet = useCallback(async () => {
    await storage.clearWallet();
    setPrefs(DEFAULT_PREFS);
    setPasscodeHash(null);
    lockoutRef.current = EMPTY_LOCKOUT;
    setLockout(EMPTY_LOCKOUT);
    setEvents([]);
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
      createWallet,
      getMnemonic,
      resetWallet,
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
      createWallet,
      getMnemonic,
      resetWallet,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
