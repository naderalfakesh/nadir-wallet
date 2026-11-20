import { haptics } from "@/services/device/haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Screen, ScreenHeader, Button, TestnetBadge } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useDemoState } from "@/providers/DemoStateProvider";
import { useSheets } from "@/providers/SheetProvider";
import { useApp } from "@/providers/AppProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { shortAddr } from "@/utils/format";
import { CHAINS, tokenById, RECIPIENTS, chainToNetworkId, type DemoToken } from "@/features/wallet/data";
import { assessRecipient, recipientNetwork, type AddressRisk } from "@/features/wallet/risk";
import { beginScan } from "@/features/scan/scanBridge";
import { useRiskCheck, useSimulation } from "./useSendChecks";
import { SendConfirmOverlay, type SendPhase } from "./SendConfirmOverlay";
import { FEE_NATIVE, GAS_SYMBOL, HIGH_VALUE_USD, SEND_STEPS } from "./send.constants";
import { createSendStyles } from "./SendScreen.styles";
import { FooterButton } from "./SendScreen.parts";
import { AmountStep, ReviewStep, ToStep } from "./SendScreen.steps";
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
import type { SendStep, SimulationStatus } from "./send.types";
import { biometryIcon } from "@/services/auth/biometry";

export function SendScreen({ tokenId }: { tokenId?: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);
  const router = useRouter();
  const { t } = useTranslation();
  const { liveApi, backend, sendSim, sendOutcome } = useDemoState();
  const sheets = useSheets();
  const { logEvent, prefs } = useApp();
  const { tokens } = useWallet();
  const logged = useRef<Set<string>>(new Set());

  // A code scanned from Home arrives here with its recipient and network.
  const [handoff] = useState(takeScanHandoff);
  const [step, setStep] = useState<SendStep>("to");
  const [token, setToken] = useState<DemoToken>(() => {
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
    ? RECIPIENTS.find((recipient) => recipient.label?.toLowerCase() === trimmedTo.toLowerCase())?.addr
    : looksAddr ? trimmedTo : null;
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

  const localRisk = prefs.txProtection && toValid && backend === "online" ? assessRecipient(trimmedTo) : null;
  const risk: AddressRisk | null = liveMode ? (liveRisk.status === "ok" ? liveRisk.risk : null) : localRisk;
  const checksAvailable = liveMode ? liveRisk.status !== "unavailable" : backend === "online";
  const showRiskUnavailable = prefs.txProtection && (!checksAvailable || (liveMode && !canCheckLive));
  const riskLoading = prefs.txProtection && canCheckLive && liveRisk.status === "idle";
  const blocked = Boolean(risk?.blocked);
  const recipientNet = recipientNetwork(trimmedTo);
  const netMismatch = Boolean(recipientNet && recipientNet !== token.chain);
  const scanMismatch =
    scanChainId !== null && checkScanForToken({ chainId: scanChainId, tokenContract: null }, token) !== null;
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
  const fee = estimate ? `${estimate.feeNative} ${estimate.symbol}` : sendFee ? `${sendFee.amount} ${sendFee.symbol}` : null;
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

  if (phase) {
    return (
      <SendConfirmOverlay
        phase={phase}
        setPhase={setPhase}
        outcome={sendOutcome}
        token={token}
        amount={amtNum}
        fiat={fiat}
        to={resolvedTo ?? trimmedTo}
        onRetry={backToReview}
        onCancel={backToReview}
      />
    );
  }

  return (
    <Screen avoidKeyboard>
      <ScreenHeader
        title={t(`send.steps.${step}`)}
        subtitle={t("send.steps.step", { n: stepIndex + 1 })}
        onBack={back}
        trailing={<TestnetBadge label={chain.short} />}
      />
      <View style={styles.progress}>
        {SEND_STEPS.map((item, index) => (
          <View
            key={item}
            style={[
              styles.progressTrack,
              { backgroundColor: stepIndex >= index ? theme.colors.accent : theme.colors.surface3 },
            ]}
          />
        ))}
      </View>

      <Animated.View key={step} entering={FadeInRight.duration(180)} style={{ flex: 1 }}>
        {step === "to" && (
          <>
            <ToStep
              to={to}
              toError={toError}
              toValid={toValid}
              risk={risk}
              riskUnavailable={showRiskUnavailable}
              onChangeTo={editTo}
              onScan={openScanner}
            />
            <FooterButton>
              <Button
                label={blocked ? t("send.to.blocked") : t("send.to.continue")}
                disabled={!toValid || blocked || riskLoading}
                onPress={continueFromTo}
              />
            </FooterButton>
          </>
        )}

        {step === "amount" && (
          <AmountStep
            token={token}
            amt={amt}
            amtNum={amtNum}
            fiat={fiat}
            onKey={onKey}
            onMax={() => setAmt(String(token.amount))}
            onPickToken={() =>
              sheets.open("pickToken", { current: token.id, onPick: (picked: DemoToken) => setToken(picked) })
            }
            onReview={() => setStep("review")}
          />
        )}

        {step === "review" && (
          <>
            <ReviewStep
              token={token}
              amtNum={amtNum}
              fiat={fiat}
              trimmedTo={resolvedTo ?? trimmedTo}
              chain={chain}
              fee={fee}
              total={total}
              simulationLoading={simulationLoading}
              warnings={liveSim.data?.warnings}
              risk={risk}
              riskUnavailable={showRiskUnavailable}
              netMismatch={netMismatch}
              recipientNet={recipientNet}
              simStatus={simStatus}
              balanceAfter={balanceAfter}
            />
            <FooterButton>
              <Button
                label={
                  blocked
                    ? t("send.confirm.blocked")
                    : scanMismatch
                      ? t("send.confirm.scanMismatch")
                      : simStatus === "failed"
                        ? t("send.confirm.simFailed")
                        : t("send.confirm.cta")
                }
                icon={biometryIcon()}
                disabled={blocked || riskLoading || scanMismatch || simulationLoading || simStatus === "failed"}
                onPress={() => setPhase(prefs.requireLivenessSend && fiat >= HIGH_VALUE_USD ? "liveness" : "auth")}
              />
            </FooterButton>
          </>
        )}
      </Animated.View>
    </Screen>
  );
}
