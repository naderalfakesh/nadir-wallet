import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type SheetName =
  | "receive"
  | "txDetail"
  | "accounts"
  | "pickToken"
  | "howItWorks"
  | "theme"
  | "scan"
  | "soon";

export interface SheetRequest {
  name: SheetName;
  params?: Record<string, unknown>;
}

interface SheetValue {
  active: SheetRequest | null;
  open: (name: SheetName, params?: Record<string, unknown>) => void;
  close: () => void;
}

const SheetContext = createContext<SheetValue | null>(null);

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<SheetRequest | null>(null);

  const open = useCallback((name: SheetName, params?: Record<string, unknown>) => {
    setActive({ name, params });
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
