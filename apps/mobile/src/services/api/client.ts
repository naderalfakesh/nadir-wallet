import type {
  AddressRiskCheckRequest,
  AddressRiskCheckResponse,
  ApiErrorResponse,
  HealthResponse,
  NetworkId,
  NetworksResponse,
  PricesResponse,
  ReportAddressResponse,
  TokensResponse,
  TransactionSimulationRequest,
  TransactionSimulationResponse,
  WalletBalancesResponse,
  WalletTransactionsResponse,
} from "@nadir-wallet/types";
import { API_BASE_URL } from "@/constants/env";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiErrorResponse["error"] };

const TIMEOUT_MS = 8000;

function buildUrl(path: string, query?: Record<string, string>): string {
  const base = `${API_BASE_URL.replace(/\/$/, "")}${path}`;
  if (!query) return base;
  const qs = Object.entries(query)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `${base}?${qs}` : base;
}

async function request<T>(
  path: string,
  init?: RequestInit & { query?: Record<string, string> },
): Promise<ApiResult<T>> {
  const url = buildUrl(path, init?.query);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const error = (body as ApiErrorResponse | null)?.error ?? {
        code: "http_error",
        message: `Request failed with status ${res.status}`,
      };
      return { ok: false, error };
    }
    return { ok: true, data: body as T };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      ok: false,
      error: {
        code: aborted ? "timeout" : "network_error",
        message: aborted
          ? "The request timed out."
          : "Could not reach wallet services. Your keys remain safe on this device.",
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

// Only public-safe data is ever sent: addresses, network ids, token symbols and
// transaction drafts for simulation. Mnemonics, private keys and signing
// material never touch this client.
export const api = {
  health: () => request<HealthResponse>("/health"),

  networks: () => request<NetworksResponse>("/networks"),

  tokens: (networkId: NetworkId) => request<TokensResponse>("/tokens", { query: { networkId } }),

  prices: (symbols: string[]) =>
    request<PricesResponse>("/prices", { query: { symbols: symbols.join(",") } }),

  walletBalances: (address: string, networkId: NetworkId) =>
    request<WalletBalancesResponse>(`/wallet/${address}/balances`, { query: { networkId } }),

  walletTransactions: (address: string, networkId: NetworkId) =>
    request<WalletTransactionsResponse>(`/wallet/${address}/transactions`, { query: { networkId } }),

  simulateTransaction: (req: TransactionSimulationRequest) =>
    request<TransactionSimulationResponse>("/transaction/simulate", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  checkAddress: (req: AddressRiskCheckRequest) =>
    request<AddressRiskCheckResponse>("/security/check-address", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  reportAddress: (address: string, reason: string) =>
    request<ReportAddressResponse>("/security/report-address", {
      method: "POST",
      body: JSON.stringify({ address, reason }),
    }),
};
