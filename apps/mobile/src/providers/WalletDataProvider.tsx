import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  TOKENS,
  demoTransactions,
  PORTFOLIO_TOTAL,
  PORTFOLIO_CHANGE_PCT,
  type PortfolioToken,
  type PortfolioTransaction,
} from "@/features/wallet/data";
import { fetchLivePortfolio, type LivePortfolio } from "@/features/wallet/portfolio";
import { api } from "@/services/api";
import type { BackendStatus, PriceStatus } from "@/types/status";
import { useApp } from "./AppProvider";
import { useDemoState } from "./DemoStateProvider";

interface WalletData {
  tokens: PortfolioToken[];
  transactions: PortfolioTransaction[];
  total: number;
  change: number;
  backend: BackendStatus;
  price: PriceStatus;
  source: "live" | "demo";
  loading: boolean;
  initialLoading: boolean;
  refresh: () => void;
}

const DEMO_VIEW = {
  tokens: TOKENS,
  total: PORTFOLIO_TOTAL,
  change: PORTFOLIO_CHANGE_PCT,
};

const WalletDataContext = createContext<WalletData | null>(null);

export function WalletDataProvider({ children }: { children: React.ReactNode }) {
  const { liveApi, backend: demoBackend, price: demoPrice, retry } = useDemoState();
  const { prefs } = useApp();
  const address = prefs.walletAddress;
  const [result, setResult] = useState<{
    address: string;
    portfolio: LivePortfolio | null;
  } | null>(null);
  const [loadingAddress, setLoadingAddress] = useState<string | null>(null);
  const request = useRef(0);
  const live = result?.address === address ? result.portfolio : null;
  const loading = loadingAddress === address;
  const initialLoading = liveApi && !!address && result?.address !== address;

  const load = useCallback(async () => {
    if (!address) return;
    const id = ++request.current;
    setLoadingAddress(address);
    const health = await api.health();
    if (id !== request.current) return;
    const portfolio = health.ok ? await fetchLivePortfolio(address) : null;
    if (id !== request.current) return;
    setResult({ address, portfolio });
    setLoadingAddress(null);
  }, [address]);

  const refresh = useCallback(() => {
    if (liveApi) void load();
    else retry();
  }, [liveApi, load, retry]);

  // Keep portfolio results tied to the current wallet and the latest refresh.
  useEffect(() => {
    if (!liveApi) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void load();
    });
    return () => {
      active = false;
      request.current += 1;
    };
  }, [liveApi, load]);

  // Dated once per app session, relative to when the wallet data first loads.
  const demoTx = useMemo(() => demoTransactions(new Date()), []);

  const value = useMemo<WalletData>(() => {
    if (!liveApi) {
      return {
        ...DEMO_VIEW,
        transactions: demoTx,
        backend: demoBackend,
        price: demoPrice,
        source: "demo",
        loading: false,
        initialLoading: false,
        refresh,
      };
    }
    if (live) {
      return {
        tokens: live.tokens,
        transactions: live.transactions,
        total: live.total,
        change: live.change,
        backend: "online",
        price: live.priceStatus,
        source: "live",
        loading,
        initialLoading: false,
        refresh,
      };
    }
    // Live mode but no data yet: keep demo data visible and surface API status.
    return {
      ...DEMO_VIEW,
      transactions: demoTx,
      backend: initialLoading || !address ? "online" : "api_unavailable",
      price: initialLoading ? demoPrice : "unavailable",
      source: "demo",
      loading,
      initialLoading,
      refresh,
    };
  }, [liveApi, live, demoTx, demoBackend, demoPrice, loading, initialLoading, address, refresh]);

  return <WalletDataContext.Provider value={value}>{children}</WalletDataContext.Provider>;
}

export function useWallet(): WalletData {
  const ctx = useContext(WalletDataContext);
  if (!ctx) throw new Error("useWallet must be used within WalletDataProvider");
  return ctx;
}
