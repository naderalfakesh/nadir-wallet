import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { DemoToken } from "@/features/wallet/types";

export interface SheetParams {
  receive: { token?: string } | undefined;
  txDetail: { id: string };
  accounts: undefined;
  pickToken: { current?: string; onPick?: (token: DemoToken) => void } | undefined;
  howItWorks: undefined;
  theme: undefined;
  soon: { title?: string } | undefined;
}

export type SheetName = keyof SheetParams;

export type SheetRequest = {
  [K in SheetName]: { name: K; params: SheetParams[K] };
}[SheetName];

type OpenArgs<K extends SheetName> = undefined extends SheetParams[K]
  ? [params?: SheetParams[K]]
  : [params: SheetParams[K]];

interface SheetValue {
  active: SheetRequest | null;
  open: <K extends SheetName>(name: K, ...args: OpenArgs<K>) => void;
  close: () => void;
}

const SheetContext = createContext<SheetValue | null>(null);

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<SheetRequest | null>(null);

  const open = useCallback(<K extends SheetName>(name: K, ...args: OpenArgs<K>) => {
    setActive({ name, params: args[0] } as SheetRequest);
  }, []);
  const close = useCallback(() => setActive(null), []);

  const value = useMemo<SheetValue>(() => ({ active, open, close }), [active, open, close]);

  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

export function useSheets(): SheetValue {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("useSheets must be used within SheetProvider");
  return ctx;
}
