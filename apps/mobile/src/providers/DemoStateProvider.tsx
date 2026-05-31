import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { BackendStatus, PriceStatus } from "@/types/status";

export type SendSim = "pass" | "fail";
export type SendOutcome = "success" | "pending" | "failed";

// Showcase-only switches that let a reviewer exercise every backend/price/send
// state from the running app — the equivalent of the design's tweak panel.
// None of this affects the local wallet, which is never "down".
interface DemoState {
  backend: BackendStatus;
  price: PriceStatus;
  sendSim: SendSim;
  sendOutcome: SendOutcome;
}

interface DemoStateValue extends DemoState {
  setBackend: (v: BackendStatus) => void;
  setPrice: (v: PriceStatus) => void;
  setSendSim: (v: SendSim) => void;
  setSendOutcome: (v: SendOutcome) => void;
  retry: () => void;
}

const DEFAULTS: DemoState = {
  backend: "online",
  price: "fresh",
  sendSim: "pass",
  sendOutcome: "success",
};

const DemoStateContext = createContext<DemoStateValue | null>(null);

export function DemoStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(DEFAULTS);

  const setBackend = useCallback((backend: BackendStatus) => setState((s) => ({ ...s, backend })), []);
  const setPrice = useCallback((price: PriceStatus) => setState((s) => ({ ...s, price })), []);
  const setSendSim = useCallback((sendSim: SendSim) => setState((s) => ({ ...s, sendSim })), []);
  const setSendOutcome = useCallback(
    (sendOutcome: SendOutcome) => setState((s) => ({ ...s, sendOutcome })),
    [],
  );
  // Transient backend/price errors clear on retry; keys are local, always safe.
  const retry = useCallback(() => setState((s) => ({ ...s, backend: "online", price: "fresh" })), []);

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
