import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { SecurityEvent, SecurityEventType } from "@/types/status";
import { storage, type Prefs, type PersistedState } from "@/services/storage";
import { SECURITY_EVENTS } from "@/features/security/data";
import { makeSecurityEvent } from "@/features/security/events";

const MAX_EVENTS = 40;

interface AppValue {
  prefs: Prefs;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  passcode: string;
  setPasscode: (pin: string) => void;
  events: SecurityEvent[];
  logEvent: (type: SecurityEventType, opts?: { detail?: string; detailVars?: Record<string, string | number> }) => void;
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

  const value = useMemo<AppValue>(
    () => ({ prefs, setPref, passcode, setPasscode, events, logEvent }),
    [prefs, setPref, passcode, setPasscode, events, logEvent],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
