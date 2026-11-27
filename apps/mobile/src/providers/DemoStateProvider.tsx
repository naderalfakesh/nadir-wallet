import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { storage, type DemoPrefs } from "@/services/storage";
import type { BackendStatus, PriceStatus, SendOutcome, SendSim } from "@/types/status";

interface DemoStateValue extends DemoPrefs {
  setLiveApi: (v: boolean) => void;
  useDemoData: () => void;
  setBackend: (v: BackendStatus) => void;
  setPrice: (v: PriceStatus) => void;
  setSendSim: (v: SendSim) => void;
  setSendOutcome: (v: SendOutcome) => void;
  retry: () => void;
}

const DemoStateContext = createContext<DemoStateValue | null>(null);

export function DemoStateProvider({
  initial,
  children,
}: {
  initial: DemoPrefs;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<DemoPrefs>(initial);

  const update = useCallback((partial: Partial<DemoPrefs>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      void storage.saveDemo(next).catch(() => undefined);
      return next;
    });
  }, []);

  const setLiveApi = useCallback((liveApi: boolean) => update({ liveApi }), [update]);
  const setBackend = useCallback((backend: BackendStatus) => update({ backend }), [update]);
  const setPrice = useCallback((price: PriceStatus) => update({ price }), [update]);
  const setSendSim = useCallback((sendSim: SendSim) => update({ sendSim }), [update]);
  const setSendOutcome = useCallback(
    (sendOutcome: SendOutcome) => update({ sendOutcome }),
    [update],
  );
  const retry = useCallback(() => update({ backend: "online", price: "fresh" }), [update]);

  const useDemoData = useCallback(
    () => update({ liveApi: false, backend: "online", price: "fresh" }),
    [update],
  );

  const value = useMemo<DemoStateValue>(
    () => ({
      ...state,
      setLiveApi,
      setBackend,
      setPrice,
      setSendSim,
      setSendOutcome,
      retry,
      useDemoData,
    }),
    [state, setLiveApi, setBackend, setPrice, setSendSim, setSendOutcome, retry, useDemoData],
  );

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
}

export function useDemoState(): DemoStateValue {
  const ctx = useContext(DemoStateContext);
  if (!ctx) throw new Error("useDemoState must be used within DemoStateProvider");
  return ctx;
}
