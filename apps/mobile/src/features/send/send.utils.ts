import { isEvmAddress } from "@nadir-wallet/crypto-core";
import type { TransactionSimulationResponse } from "@nadir-wallet/types";
import type { AddressRisk } from "@/features/wallet/risk";
import type { ChainId, PortfolioToken, SavedRecipient } from "@/features/wallet/types";
import type { TFunction } from "@/i18n";
import type { SimulationStatus } from "@/types/status";
import { fmtToken } from "@/utils/format";
import { FEE_NATIVE, GAS_SYMBOL } from "./send.constants";
import type { RecipientValidation, ReviewCtaState, RiskCopy, SendFee } from "./send.types";

export { checkScanForToken, pickTokenForScan } from "./sendScan";
export type { ScanTokenPick, SendFee } from "./send.types";

const ENS_PATTERN = /\.(eth|sol)$/i;

export function getRecipientValidation(to: string): RecipientValidation {
  const trimmedTo = to.trim();
  const looksAddr = isEvmAddress(trimmedTo);
  const looksEns = ENS_PATTERN.test(trimmedTo);
  const toValid = looksAddr || looksEns;
  const toError = trimmedTo.length > 3 && !toValid;

  return { trimmedTo, looksAddr, looksEns, toValid, toError };
}

export function resolveRecipientAddress(
  validation: RecipientValidation,
  recipients: readonly SavedRecipient[],
): string | null {
  if (validation.looksEns) {
    const needle = validation.trimmedTo.toLowerCase();
    return recipients.find((r) => r.label?.toLowerCase() === needle)?.addr ?? null;
  }
  return validation.looksAddr ? validation.trimmedTo : null;
}

export function isKnownRecipient(
  address: string | null,
  recipients: readonly SavedRecipient[],
): boolean {
  if (!address) return false;
  const needle = address.toLowerCase();
  return recipients.some((r) => r.addr.toLowerCase() === needle && r.known);
}

export function applyAmountKey(prev: string, key: string): string {
  if (key === "del") return prev.length <= 1 ? "0" : prev.slice(0, -1);
  if (key === ".") return prev.includes(".") ? prev : `${prev}.`;
  if (prev === "0") return key;
  return prev + key;
}

export function getRiskCopy(risk: AddressRisk, t: TFunction): RiskCopy {
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

export function getLiveSimulationStatus(
  status: "idle" | "passed" | "failed" | "unavailable",
): SimulationStatus {
  return status === "passed" || status === "failed" ? status : "unavailable";
}

export function getInitialToken(
  tokens: PortfolioToken[],
  tokenId: string | undefined,
  fallback: PortfolioToken,
): PortfolioToken {
  const selected = tokens.find((token) => token.id === tokenId);
  if (selected) return selected;
  return tokens[0] ?? fallback;
}

type FeeEstimate = Pick<
  NonNullable<TransactionSimulationResponse["estimatedFee"]>,
  "feeNative" | "symbol"
>;

export function resolveSendFee(
  estimate: FeeEstimate | undefined,
  chain: ChainId,
  liveMode: boolean,
): { sendFee: SendFee | null; feeLabel: string | null } {
  if (estimate) {
    return {
      sendFee: { amount: Number(estimate.feeNative) || 0, symbol: estimate.symbol },
      feeLabel: `${estimate.feeNative} ${estimate.symbol}`,
    };
  }
  if (liveMode) return { sendFee: null, feeLabel: null };
  const sendFee: SendFee = { amount: FEE_NATIVE, symbol: GAS_SYMBOL[chain] };
  return { sendFee, feeLabel: `${sendFee.amount} ${sendFee.symbol}` };
}

export function getSendTotal(amount: number, symbol: string, fee: SendFee | null): string {
  if (!fee) return fmtToken(amount, symbol);
  if (fee.symbol === symbol) return fmtToken(amount + fee.amount, symbol);
  return `${fmtToken(amount, symbol)} + ${fmtToken(fee.amount, fee.symbol)}`;
}

export function getBalanceAfter(
  balance: number,
  amount: number,
  symbol: string,
  fee: SendFee | null,
): number {
  const spent = amount + (fee && fee.symbol === symbol ? fee.amount : 0);
  return Math.max(0, balance - spent);
}

export function getReviewCtaState({
  blocked,
  riskLoading,
  scanMismatch,
  simulationLoading,
  simStatus,
}: {
  blocked: boolean;
  riskLoading: boolean;
  scanMismatch: boolean;
  simulationLoading: boolean;
  simStatus: SimulationStatus;
}): ReviewCtaState {
  const labelKey = blocked
    ? "send.confirm.blocked"
    : scanMismatch
      ? "send.confirm.scanMismatch"
      : simStatus === "failed"
        ? "send.confirm.simFailed"
        : "send.confirm.cta";
  const disabled =
    blocked || riskLoading || scanMismatch || simulationLoading || simStatus === "failed";
  return { labelKey, disabled };
}
