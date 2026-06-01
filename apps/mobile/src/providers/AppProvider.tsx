import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { mnemonicToEvmAddress } from "@nadir-wallet/crypto-core";
import type { SecurityEvent, SecurityEventType } from "@/types/status";
import { storage, DEFAULT_PREFS, type Prefs, type PersistedState } from "@/services/storage";
import { SECURITY_EVENTS } from "@/features/security/data";
import { makeSecurityEvent } from "@/features/security/events";

const MAX_EVENTS = 40;
const DEFAULT_PASSCODE = "123456";

interface AppValue {
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  passcode: string;
  setPasscode: (pin: string) => void;
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
  const [passcode, setPasscodeState] = useState(initial.passcode);
  // Seed the log with demo history on first launch so the screen isn't empty.
  const [events, setEvents] = useState<SecurityEvent[]>(
    initial.events.length ? initial.events : SECURITY_EVENTS,
  );
  const counter = useRef(0);

  const setPref = useCallback(<K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      void storage.savePrefs(next);
      return next;
    });
  }, []);

  const setPasscode = useCallback((pin: string) => {
    setPasscodeState(pin);
    void storage.savePasscode(pin);
  }, []);

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
    setPasscodeState(DEFAULT_PASSCODE);
    setEvents([]);
  }, []);

  const value = useMemo<AppValue>(
    () => ({ prefs, setPref, passcode, setPasscode, events, logEvent, createWallet, getMnemonic, resetWallet }),
    [prefs, setPref, passcode, setPasscode, events, logEvent, createWallet, getMnemonic, resetWallet],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
