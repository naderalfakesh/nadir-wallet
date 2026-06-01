import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import type { BackendStatus, PriceStatus } from "@/types/status";
import {
  TOKENS,
  TRANSACTIONS,
  PORTFOLIO_TOTAL,
  PORTFOLIO_CHANGE_PCT,
  type DemoToken,
  type DemoTransaction,
} from "@/features/wallet/data";
import { fetchLivePortfolio, type LivePortfolio } from "@/features/wallet/portfolio";
import { useDemoState } from "./DemoStateProvider";
import { useApp } from "./AppProvider";

interface WalletData {
  tokens: DemoToken[];
  transactions: DemoTransaction[];
  total: number;
  change: number;
  backend: BackendStatus;
  price: PriceStatus;
  source: "live" | "demo";
  loading: boolean;
  refresh: () => void;
}

const DEMO_VIEW = {
  tokens: TOKENS,
  transactions: TRANSACTIONS,
  total: PORTFOLIO_TOTAL,
  change: PORTFOLIO_CHANGE_PCT,
};

const WalletDataContext = createContext<WalletData | null>(null);

export function WalletDataProvider({ children }: { children: React.ReactNode }) {
  const { liveApi, backend: demoBackend, price: demoPrice, retry } = useDemoState();
  const { prefs } = useApp();
  const address = prefs.walletAddress;
  const [live, setLive] = useState<LivePortfolio | null>(null);
  const [backendLive, setBackendLive] = useState<BackendStatus>("online");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!address) return; // No wallet yet — fall back to demo data.
    setLoading(true);
    const health = await api.health();
    if (!health.ok) {
      setBackendLive("api_unavailable");
      setLive(null);
      setLoading(false);
      return;
    }
    setBackendLive("online");
    const portfolio = await fetchLivePortfolio(address);
    if (portfolio) {
      setLive(portfolio);
    } else {
      setBackendLive("api_unavailable");
      setLive(null);
    }
    setLoading(false);
  }, [address]);

  const refresh = useCallback(() => {
    if (liveApi) void load();
    else retry();
  }, [liveApi, load, retry]);

  // Fetch off the synchronous effect path so loading state isn't set during render.
  useEffect(() => {
    if (!liveApi) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void load();
    });
    return () => {
      active = false;
    };
  }, [liveApi, load]);

  const value = useMemo<WalletData>(() => {
    if (!liveApi) {
      return { ...DEMO_VIEW, backend: demoBackend, price: demoPrice, source: "demo", loading: false, refresh };
    }
    if (live) {
      return {
        tokens: live.tokens,
        transactions: live.transactions,
        total: live.total,
        change: live.change,
        backend: backendLive,
        price: live.priceStatus,
        source: "live",
        loading,
        refresh,
      };
    }
    // Live mode but no data yet: keep demo data visible and surface API status.
    return {
      ...DEMO_VIEW,
      backend: loading ? "online" : backendLive,
      price: loading ? demoPrice : "unavailable",
      source: "demo",
      loading,
      refresh,
    };
  }, [liveApi, live, backendLive, demoBackend, demoPrice, loading, refresh]);

  return <WalletDataContext.Provider value={value}>{children}</WalletDataContext.Provider>;
}

export function useWallet(): WalletData {
  const ctx = useContext(WalletDataContext);
  if (!ctx) throw new Error("useWallet must be used within WalletDataProvider");
  return ctx;
}
