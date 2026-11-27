import { chainToNetworkId } from "@/features/wallet/chains";
import { RECIPIENTS } from "@/features/wallet/demoData";
import { assessRecipient, recipientNetwork, type AddressRisk } from "@/features/wallet/risk";
import type { PortfolioToken } from "@/features/wallet/types";
import type { BackendStatus, SendSim, SimulationStatus } from "@/types/status";
import type { RecipientValidation, SendStep } from "./send.types";
import {
  checkScanForToken,
  getBalanceAfter,
  getLiveSimulationStatus,
  getLocalSimulationStatus,
  getSendTotal,
  isKnownRecipient,
  resolveRecipientAddress,
  resolveSendFee,
} from "./send.utils";
import { useRiskCheck, useSimulation } from "./useSendChecks";

interface UseSendQuoteOptions {
  step: SendStep;
  token: PortfolioToken;
  validation: RecipientValidation;
  amt: string;
  amtNum: number;
  scanChainId: number | null;
  walletAddress: string;
  txProtection: boolean;
  liveApi: boolean;
  backend: BackendStatus;
  sendSim: SendSim;
}

export function useSendQuote({
  step,
  token,
  validation,
  amt,
  amtNum,
  scanChainId,
  walletAddress,
  txProtection,
  liveApi,
  backend,
  sendSim,
}: UseSendQuoteOptions) {
  const { trimmedTo, toValid } = validation;
  const networkId = chainToNetworkId(token.chain);
  const resolvedTo = resolveRecipientAddress(validation, RECIPIENTS);
  const liveMode = liveApi && networkId != null;
  const canCheckLive = liveMode && resolvedTo != null;
  const knownContact = isKnownRecipient(resolvedTo, RECIPIENTS);

  const liveRisk = useRiskCheck({
    enabled: txProtection && canCheckLive,
    address: resolvedTo ?? "",
    networkId,
    amount: amtNum,
    knownContact,
  });
  const liveSim = useSimulation({
    enabled: canCheckLive && step === "review" && amtNum > 0,
    networkId,
    from: walletAddress,
    to: resolvedTo ?? "",
    value: amt,
  });

  const localRisk =
    txProtection && toValid && backend === "online" ? assessRecipient(trimmedTo) : null;
  const risk: AddressRisk | null = liveMode
    ? liveRisk.status === "ok"
      ? liveRisk.risk
      : null
    : localRisk;
  const checksAvailable = liveMode ? liveRisk.status !== "unavailable" : backend === "online";
  const showRiskUnavailable = txProtection && (!checksAvailable || (liveMode && !canCheckLive));
  const riskLoading = txProtection && canCheckLive && liveRisk.status === "idle";
  const blocked = Boolean(risk?.blocked);
  const recipientNet = recipientNetwork(trimmedTo);
  const netMismatch = Boolean(recipientNet && recipientNet !== token.chain);
  const scanMismatch =
    scanChainId !== null &&
    checkScanForToken({ chainId: scanChainId, tokenContract: null }, token) !== null;
  const simStatus: SimulationStatus = liveMode
    ? getLiveSimulationStatus(liveSim.status)
    : getLocalSimulationStatus({ checksAvailable, sendSim });
  const simulationLoading = canCheckLive && step === "review" && liveSim.status === "idle";
  const { sendFee, feeLabel: fee } = resolveSendFee(
    liveSim.data?.estimatedFee,
    token.chain,
    liveMode,
  );
  const total = getSendTotal(amtNum, token.symbol, sendFee);
  const balanceAfter = getBalanceAfter(token.amount, amtNum, token.symbol, sendFee);

  return {
    recipient: resolvedTo ?? trimmedTo,
    risk,
    riskLoading,
    showRiskUnavailable,
    blocked,
    netMismatch,
    recipientNet,
    scanMismatch,
    simStatus,
    simulationLoading,
    warnings: liveSim.data?.warnings,
    fee,
    total,
    balanceAfter,
  };
}
