import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { beginScan } from "@/features/scan/scanBridge";
import { CHAINS } from "@/features/wallet/chains";
import { tokenById } from "@/features/wallet/demoData";
import type { PortfolioToken } from "@/features/wallet/types";
import { useApp } from "@/providers/AppProvider";
import { useDemoState } from "@/providers/DemoStateProvider";
import { useSheets } from "@/providers/SheetProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { haptics } from "@/services/device/haptics";
import { shortAddr } from "@/utils/format";
import { HIGH_VALUE_USD, SEND_STEPS } from "./send.constants";
import type { SendPhase, SendStep } from "./send.types";
import {
  applyAmountKey,
  checkScanForToken,
  getInitialToken,
  getRecipientValidation,
  pickTokenForScan,
} from "./send.utils";
import { takeScanHandoff } from "./sendHandoff";
import { useSendQuote } from "./useSendQuote";

export function useSendFlow(tokenId?: string) {
  const router = useRouter();
  const { liveApi, backend, sendSim, sendOutcome } = useDemoState();
  const sheets = useSheets();
  const { logEvent, prefs } = useApp();
  const { tokens } = useWallet();
  const loggedKeys = useRef<Set<string>>(new Set());

  const [handoff] = useState(takeScanHandoff);
  const [step, setStep] = useState<SendStep>("to");
  const [token, setToken] = useState<PortfolioToken>(() => {
    const fallback = tokenById("eth");
    const picked = handoff ? pickTokenForScan(handoff, tokens, fallback) : null;
    return picked?.ok ? picked.token : getInitialToken(tokens, tokenId, fallback);
  });
  const [to, setTo] = useState(handoff?.recipient ?? "");
  const [scanChainId, setScanChainId] = useState<number | null>(handoff?.chainId ?? null);
  const [amt, setAmt] = useState("0");
  const [phase, setPhase] = useState<SendPhase | null>(null);

  const amtNum = parseFloat(amt) || 0;
  const fiat = amtNum * token.price;
  const chain = CHAINS[token.chain];
  const validation = getRecipientValidation(to);
  const quote = useSendQuote({
    step,
    token,
    validation,
    amt,
    amtNum,
    scanChainId,
    walletAddress: prefs.walletAddress,
    txProtection: prefs.txProtection,
    liveApi,
    backend,
    sendSim,
  });

  useEffect(() => {
    const key = `block:${quote.recipient}`;
    if (quote.blocked && !loggedKeys.current.has(key)) {
      loggedKeys.current.add(key);
      logEvent("risk_block");
      haptics.error();
    }
  }, [quote.blocked, quote.recipient, logEvent]);

  useEffect(() => {
    const key = `sim:${quote.recipient}:${token.id}:${amt}`;
    if (step === "review" && quote.simStatus === "failed" && !loggedKeys.current.has(key)) {
      loggedKeys.current.add(key);
      logEvent("sim_fail");
    }
  }, [step, quote.simStatus, quote.recipient, token.id, amt, logEvent]);

  const onKey = useCallback((key: string) => setAmt((prev) => applyAmountKey(prev, key)), []);
  const setMax = useCallback(() => setAmt(String(token.amount)), [token.amount]);
  const goToReview = useCallback(() => setStep("review"), []);

  const back = useCallback(() => {
    if (step === "to") router.back();
    else setStep(step === "review" ? "amount" : "to");
  }, [step, router]);

  const backToReview = useCallback(() => {
    setPhase(null);
    setStep("review");
  }, []);

  const editTo = useCallback((value: string) => {
    setScanChainId(null);
    setTo(value);
  }, []);

  const openScanner = useCallback(() => {
    beginScan(
      (target) => {
        if (!target) return;
        setTo(target.recipient);
        setScanChainId(target.chainId);
      },
      (target) => checkScanForToken(target, token),
    );
    router.push("/scan");
  }, [router, token]);

  const continueFromTo = useCallback(() => {
    const key = `check:${validation.trimmedTo}`;
    if (quote.risk && !loggedKeys.current.has(key)) {
      loggedKeys.current.add(key);
      logEvent("risk_check", { detail: shortAddr(validation.trimmedTo, 8, 6) });
    }
    setStep("amount");
  }, [quote.risk, validation.trimmedTo, logEvent]);

  const pickToken = useCallback(() => {
    sheets.open("pickToken", {
      current: token.id,
      onPick: (picked: PortfolioToken) => setToken(picked),
    });
  }, [sheets, token.id]);

  const startConfirm = useCallback(() => {
    setPhase(prefs.requireLivenessSend && fiat >= HIGH_VALUE_USD ? "liveness" : "auth");
  }, [prefs.requireLivenessSend, fiat]);

  return {
    step,
    stepIndex: SEND_STEPS.indexOf(step),
    phase,
    setPhase,
    sendOutcome,
    token,
    chain,
    to,
    toValid: validation.toValid,
    toError: validation.toError,
    amt,
    amtNum,
    fiat,
    ...quote,
    onKey,
    setMax,
    pickToken,
    back,
    backToReview,
    editTo,
    openScanner,
    continueFromTo,
    goToReview,
    startConfirm,
  };
}
