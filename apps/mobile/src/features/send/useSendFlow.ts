import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { beginScan } from "@/features/scan/scanBridge";
import { CHAINS, chainToNetworkId } from "@/features/wallet/chains";
import { RECIPIENTS, tokenById } from "@/features/wallet/demoData";
import { assessRecipient, recipientNetwork, type AddressRisk } from "@/features/wallet/risk";
import type { PortfolioToken } from "@/features/wallet/types";
import { useApp } from "@/providers/AppProvider";
import { useDemoState } from "@/providers/DemoStateProvider";
import { useSheets } from "@/providers/SheetProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { haptics } from "@/services/device/haptics";
import type { SimulationStatus } from "@/types/status";
import { shortAddr } from "@/utils/format";
import { FEE_NATIVE, GAS_SYMBOL, HIGH_VALUE_USD, SEND_STEPS } from "./send.constants";
import type { SendPhase, SendStep } from "./send.types";
import {
  checkScanForToken,
  getBalanceAfter,
  getInitialToken,
  getLiveSimulationStatus,
  getLocalSimulationStatus,
  getRecipientValidation,
  getSendTotal,
  pickTokenForScan,
  type SendFee,
} from "./send.utils";
import { takeScanHandoff } from "./sendHandoff";
import { useRiskCheck, useSimulation } from "./useSendChecks";

/**
 * State and derived values for the three-step send flow (recipient, amount,
 * review) and its confirmation overlay. The screen only renders what this
 * returns; every risk, simulation and fee rule lives here.
 */
export function useSendFlow(tokenId?: string) {
  const router = useRouter();
  const { liveApi, backend, sendSim, sendOutcome } = useDemoState();
  const sheets = useSheets();
  const { logEvent, prefs } = useApp();
  const { tokens } = useWallet();
  const logged = useRef<Set<string>>(new Set());

  // A code scanned from Home arrives here with its recipient and network.
  const [handoff] = useState(takeScanHandoff);
  const [step, setStep] = useState<SendStep>("to");
  const [token, setToken] = useState<PortfolioToken>(() => {
    const fallback = tokenById("eth");
    const picked = handoff ? pickTokenForScan(handoff, tokens, fallback) : null;
    return picked?.ok ? picked.token : getInitialToken(tokens, tokenId, fallback);
  });
  const [to, setTo] = useState(handoff?.recipient ?? "");
  // Network the recipient was scanned for; the token can still change on the amount step.
  const [scanChainId, setScanChainId] = useState<number | null>(handoff?.chainId ?? null);
  const [amt, setAmt] = useState("0");
  const [phase, setPhase] = useState<SendPhase | null>(null);

  const amtNum = parseFloat(amt) || 0;
  const fiat = amtNum * token.price;
  const chain = CHAINS[token.chain];
  const { trimmedTo, looksAddr, looksEns, toValid, toError } = getRecipientValidation(to);
  const networkId = chainToNetworkId(token.chain);
  const resolvedTo = looksEns
    ? RECIPIENTS.find((recipient) => recipient.label?.toLowerCase() === trimmedTo.toLowerCase())
        ?.addr
    : looksAddr
      ? trimmedTo
      : null;
  const liveMode = liveApi && networkId != null;
  const canCheckLive = liveMode && resolvedTo != null;
  const knownContact = RECIPIENTS.some(
    (recipient) => recipient.addr.toLowerCase() === resolvedTo?.toLowerCase() && recipient.known,
  );

  const liveRisk = useRiskCheck({
    enabled: prefs.txProtection && canCheckLive,
    address: resolvedTo ?? "",
    networkId,
    amount: amtNum,
    knownContact,
  });
  const liveSim = useSimulation({
    enabled: canCheckLive && step === "review" && amtNum > 0,
    networkId,
    from: prefs.walletAddress,
    to: resolvedTo ?? "",
    value: amt,
  });

  const localRisk =
    prefs.txProtection && toValid && backend === "online" ? assessRecipient(trimmedTo) : null;
  const risk: AddressRisk | null = liveMode
    ? liveRisk.status === "ok"
      ? liveRisk.risk
      : null
    : localRisk;
  const checksAvailable = liveMode ? liveRisk.status !== "unavailable" : backend === "online";
  const showRiskUnavailable =
    prefs.txProtection && (!checksAvailable || (liveMode && !canCheckLive));
  const riskLoading = prefs.txProtection && canCheckLive && liveRisk.status === "idle";
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
  const estimate = liveSim.data?.estimatedFee;
  const sendFee: SendFee | null = estimate
    ? { amount: Number(estimate.feeNative) || 0, symbol: estimate.symbol }
    : liveMode
      ? null
      : { amount: FEE_NATIVE, symbol: GAS_SYMBOL[token.chain] };
  const fee = estimate
    ? `${estimate.feeNative} ${estimate.symbol}`
    : sendFee
      ? `${sendFee.amount} ${sendFee.symbol}`
      : null;
  const total = getSendTotal(amtNum, token.symbol, sendFee);
  const balanceAfter = getBalanceAfter(token.amount, amtNum, token.symbol, sendFee);
  const stepIndex = SEND_STEPS.indexOf(step);

  useEffect(() => {
    if (blocked && !logged.current.has("block")) {
      logged.current.add("block");
      logEvent("risk_block");
      haptics.error();
    }
  }, [blocked, logEvent]);

  useEffect(() => {
    if (step === "review" && simStatus === "failed" && !logged.current.has("sim")) {
      logged.current.add("sim");
      logEvent("sim_fail");
    }
  }, [step, simStatus, logEvent]);

  const onKey = (key: string) => {
    setAmt((prev) => {
      if (key === "del") return prev.length <= 1 ? "0" : prev.slice(0, -1);
      if (key === ".") return prev.includes(".") ? prev : `${prev}.`;
      if (prev === "0") return key;
      return prev + key;
    });
  };

  const back = () => (step === "to" ? router.back() : setStep(step === "review" ? "amount" : "to"));
  const backToReview = () => {
    setPhase(null);
    setStep("review");
  };
  const editTo = (value: string) => {
    setScanChainId(null);
    setTo(value);
  };
  const openScanner = () => {
    beginScan(
      (target) => {
        if (!target) return;
        setTo(target.recipient);
        setScanChainId(target.chainId);
      },
      (target) => checkScanForToken(target, token),
    );
    router.push("/scan");
  };
  const continueFromTo = () => {
    if (risk && !logged.current.has("check")) {
      logged.current.add("check");
      logEvent("risk_check", { detail: shortAddr(trimmedTo, 8, 6) });
    }
    setStep("amount");
  };

  const pickToken = () =>
    sheets.open("pickToken", {
      current: token.id,
      onPick: (picked: PortfolioToken) => setToken(picked),
    });
  // High-value sends pass a liveness check first when the user asked for one.
  const startConfirm = () =>
    setPhase(prefs.requireLivenessSend && fiat >= HIGH_VALUE_USD ? "liveness" : "auth");

  return {
    step,
    stepIndex,
    phase,
    setPhase,
    sendOutcome,
    token,
    chain,
    to,
    toValid,
    toError,
    recipient: resolvedTo ?? trimmedTo,
    amt,
    amtNum,
    fiat,
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
    onKey,
    setMax: () => setAmt(String(token.amount)),
    pickToken,
    back,
    backToReview,
    editTo,
    openScanner,
    continueFromTo,
    goToReview: () => setStep("review"),
    startConfirm,
  };
}
