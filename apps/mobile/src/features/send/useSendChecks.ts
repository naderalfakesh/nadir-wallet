import { useEffect, useRef, useState } from "react";
import type { NetworkId, TransactionSimulationResponse } from "@nadir-wallet/types";
import type { AddressRisk, RiskReason } from "@/features/wallet/risk";
import { api } from "@/services/api";

// Live risk check. Sends a public recipient address + networkId only.
export function useRiskCheck(opts: {
  enabled: boolean;
  address: string;
  networkId: NetworkId | null;
  amount: number;
  knownContact: boolean;
}): { status: "idle" | "ok" | "unavailable"; risk: AddressRisk | null } {
  const { enabled, address, networkId, amount, knownContact } = opts;
  const key = `${address}|${networkId}|${amount}|${knownContact}`;
  const [state, setState] = useState<{
    key: string;
    status: "idle" | "ok" | "unavailable";
    risk: AddressRisk | null;
  }>({
    key: "",
    status: "idle",
    risk: null,
  });

  const reqId = useRef(0);
  useEffect(() => {
    if (!enabled || !networkId) return;

    const id = ++reqId.current;
    let cancelled = false;

    const timer = setTimeout(async () => {
      const res = await api.checkAddress({
        address,
        networkId,
        amount: amount > 0 ? String(amount) : undefined,
        knownContact,
      });
      if (cancelled || id !== reqId.current) return;
      if (!res.ok) {
        setState({ key, status: "unavailable", risk: null });
        return;
      }
      const level = res.data.riskLevel;
      const reason: RiskReason =
        level === "high" ? "reported" : level === "low" ? "known" : "firstTime";
      setState({ key, status: "ok", risk: { level, blocked: level === "high", reason } });
    }, 250);
    return () => {
      clearTimeout(timer);
      cancelled = true;
    };
  }, [enabled, address, networkId, amount, knownContact, key]);

  if (!enabled || state.key !== key) return { status: "idle", risk: null };
  return { status: state.status, risk: state.risk };
}

type SimulationResult =
  | { status: "idle" | "unavailable"; data?: undefined }
  | { status: "passed" | "failed"; data: TransactionSimulationResponse };

// Live transaction simulation. Sends a public transaction draft only.
export function useSimulation(opts: {
  enabled: boolean;
  networkId: NetworkId | null;
  from: string;
  to: string;
  value: string;
}): SimulationResult {
  const { enabled, networkId, from, to, value } = opts;
  const key = `${networkId}|${from}|${to}|${value}`;
  const [state, setState] = useState<{ key: string } & SimulationResult>({
    key: "",
    status: "idle",
  });

  const reqId = useRef(0);
  useEffect(() => {
    if (!enabled || !networkId) return;

    const id = ++reqId.current;
    let cancelled = false;

    void (async () => {
      const res = await api.simulateTransaction({ networkId, from, to, value });
      if (cancelled || id !== reqId.current) return;
      setState(
        res.ok
          ? { key, status: res.data.isValid ? "passed" : "failed", data: res.data }
          : { key, status: "unavailable" },
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, networkId, from, to, value, key]);

  if (!enabled || state.key !== key) return { status: "idle" };
  return state;
}
