import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { BackendStatus, PriceStatus } from "@/types/status";
import { storage, type DemoPrefs } from "@/services/storage";

export type SendSim = "pass" | "fail";
export type SendOutcome = "success" | "pending" | "failed";

// Showcase-only switches that let a reviewer exercise every backend/price/send
// state from the running app — the equivalent of the design's tweak panel.
// None of this affects the local wallet, which is never "down".
interface DemoStateValue extends DemoPrefs {
  setBackend: (v: BackendStatus) => void;
  setPrice: (v: PriceStatus) => void;
  setSendSim: (v: SendSim) => void;
  setSendOutcome: (v: SendOutcome) => void;
  retry: () => void;
}

const DemoStateContext = createContext<DemoStateValue | null>(null);

export function DemoStateProvider({ initial, children }: { initial: DemoPrefs; children: React.ReactNode }) {
  const [state, setState] = useState<DemoPrefs>(initial);

  const update = useCallback((partial: Partial<DemoPrefs>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      void storage.saveDemo(next);
      return next;
    });
  }, []);

  const setBackend = useCallback((backend: BackendStatus) => update({ backend }), [update]);
  const setPrice = useCallback((price: PriceStatus) => update({ price }), [update]);
  const setSendSim = useCallback((sendSim: SendSim) => update({ sendSim }), [update]);
  const setSendOutcome = useCallback((sendOutcome: SendOutcome) => update({ sendOutcome }), [update]);
  // Transient backend/price errors clear on retry; keys are local, always safe.
  const retry = useCallback(() => update({ backend: "online", price: "fresh" }), [update]);

  const value = useMemo<DemoStateValue>(
    () => ({ ...state, setBackend, setPrice, setSendSim, setSendOutcome, retry }),
    [state, setBackend, setPrice, setSendSim, setSendOutcome, retry],
  );

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}

export function useDemoState(): DemoStateValue {
  const ctx = useContext(DemoStateContext);
  if (!ctx) throw new Error("useDemoState must be used within DemoStateProvider");
  return ctx;
}
