import { getNetwork, isEvmAddress } from "@nadir-wallet/crypto-core";
import { chainToNetworkId, type DemoToken } from "@/features/wallet/data";
import { fmtToken } from "@/utils/format";
import type { AddressRisk } from "@/features/wallet/risk";
import type { ScanRejectReason, ScanTarget } from "@/features/scan/scanBridge";
import type { SimulationStatus, RecipientValidation, RiskCopy, RiskTranslator } from "./send.types";

const ENS_PATTERN = /\.(eth|sol)$/i;

export function getRecipientValidation(to: string): RecipientValidation {
  const trimmedTo = to.trim();
  const looksAddr = isEvmAddress(trimmedTo);
  const looksEns = ENS_PATTERN.test(trimmedTo);
  const toValid = looksAddr || looksEns;
  const toError = trimmedTo.length > 3 && !toValid;

  return { trimmedTo, looksAddr, looksEns, toValid, toError };
}

/**
 * Whether a scanned target can be sent with the selected token. A chain-less
 * address keeps the current network (EIP-681). A chain-qualified code must
 * name the selected token's network, and that token must be its native asset.
 * ERC-20 requests are refused: demo tokens carry no contract to match against.
 */
export function checkScanForToken(
  target: Pick<ScanTarget, "chainId" | "tokenContract">,
  token: DemoToken,
): ScanRejectReason | null {
  if (target.tokenContract !== null) return "token-request";
  if (target.chainId === null) return null;
  const networkId = chainToNetworkId(token.chain);
  const network = networkId ? getNetwork(networkId) : undefined;
  if (network?.chainId !== target.chainId || network.nativeCurrency.symbol !== token.symbol) {
    return "asset-mismatch";
  }
  return null;
}

export type ScanTokenPick = { ok: true; token: DemoToken } | { ok: false; reason: ScanRejectReason };

/**
 * For a scan started outside Send, where no token is selected yet: the wallet
 * token a scanned target pays with. A chain-less address keeps the default
 * token; a chain-qualified code picks that network's native token.
 */
export function pickTokenForScan(
  target: Pick<ScanTarget, "chainId" | "tokenContract">,
  tokens: DemoToken[],
  fallback: DemoToken,
): ScanTokenPick {
  if (target.tokenContract !== null) return { ok: false, reason: "token-request" };
  if (target.chainId === null) return { ok: true, token: getInitialToken(tokens, undefined, fallback) };
  const match = tokens.find((token) => checkScanForToken(target, token) === null);
  return match ? { ok: true, token: match } : { ok: false, reason: "unsupported-chain" };
}

export function getRiskCopy(risk: AddressRisk, t: RiskTranslator): RiskCopy {
  const message = {
    reported: { title: t("send.risk.reportedTitle"), detail: t("send.risk.reportedDetail") },
    known: { title: t("send.risk.knownTitle"), detail: t("send.risk.knownDetail") },
    firstTime: { title: t("send.risk.firstTimeTitle"), detail: t("send.risk.firstTimeDetail") },
  }[risk.reason];

  const levelLabel = t(
    risk.level === "low"
      ? "send.risk.levelLow"
      : risk.level === "medium"
        ? "send.risk.levelMedium"
        : "send.risk.levelHigh",
  );

  return { ...message, levelLabel };
}

export function getLocalSimulationStatus({
  checksAvailable,
  sendSim,
}: {
  checksAvailable: boolean;
  sendSim: "pass" | "fail";
}): SimulationStatus {
  if (!checksAvailable) return "unavailable";
  return sendSim === "fail" ? "failed" : "passed";
}

export function getLiveSimulationStatus(status: "idle" | "passed" | "failed" | "unavailable"): SimulationStatus {
  return status === "passed" || status === "failed" ? status : "unavailable";
}

export function getInitialToken(tokens: DemoToken[], tokenId: string | undefined, fallback: DemoToken): DemoToken {
  const selected = tokens.find((token) => token.id === tokenId);
  if (selected) return selected;
  return tokens[0] ?? fallback;
}

export interface SendFee {
  amount: number;
  symbol: string;
}

/** Amount plus fee as one figure when both are the same token, otherwise the two side by side. */
export function getSendTotal(amount: number, symbol: string, fee: SendFee | null): string {
  if (!fee) return fmtToken(amount, symbol);
  if (fee.symbol === symbol) return fmtToken(amount + fee.amount, symbol);
  return `${fmtToken(amount, symbol)} + ${fmtToken(fee.amount, fee.symbol)}`;
}

/** What is left of the sent token; the fee only comes out of it when it is paid in that token. */
export function getBalanceAfter(balance: number, amount: number, symbol: string, fee: SendFee | null): number {
  const spent = amount + (fee && fee.symbol === symbol ? fee.amount : 0);
  return Math.max(0, balance - spent);
}
