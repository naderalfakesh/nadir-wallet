import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Screen,
  ScreenHeader,
  AppText,
  Button,
  Card,
  Row,
  Icon,
  TokenGlyph,
  TestnetBadge,
  SectionLabel,
  NumberPad,
  RiskResult,
  TrustNote,
} from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useDemoState } from "@/providers/DemoStateProvider";
import { useSheets } from "@/providers/SheetProvider";
import { useApp } from "@/providers/AppProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { fmtUSD, fmtToken, shortAddr } from "@/utils/format";
import { CHAINS, tokenById, RECIPIENTS, chainBadgeColor, chainToNetworkId, type DemoToken } from "@/features/wallet/data";
import { assessRecipient, recipientNetwork, type AddressRisk } from "@/features/wallet/risk";
import { beginScan } from "@/features/scan/scanBridge";
import { useRiskCheck, useSimulation } from "./useSendChecks";
import { SendConfirmOverlay, type SendPhase } from "./SendConfirmOverlay";
import { DEMO_PASTE_ADDRESS, GAS_SYMBOL, HIGH_VALUE_USD, SEND_STEPS, FEE_NATIVE } from "./send.constants";
import { createSendStyles } from "./SendScreen.styles";
import { FooterButton, OfflineRiskNote, RecipientIcon, SimulationCard } from "./SendScreen.parts";
import {
  getInitialToken,
  getLiveSimulationStatus,
  getLocalSimulationStatus,
  getRecipientValidation,
  getRiskCopy,
} from "./send.utils";
import type { SendStep, SimulationStatus } from "./send.types";

export function SendScreen({ tokenId }: { tokenId?: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { liveApi, backend, sendSim, sendOutcome } = useDemoState();
  const sheets = useSheets();
  const { logEvent, prefs } = useApp();
  const { tokens } = useWallet();
  const logged = useRef<Set<string>>(new Set());

  const [step, setStep] = useState<SendStep>("to");
  const [token, setToken] = useState<DemoToken>(() => getInitialToken(tokens, tokenId, tokenById("eth")));
  const [to, setTo] = useState("");
  const [amt, setAmt] = useState("0");
  const [phase, setPhase] = useState<SendPhase | null>(null);

  const amtNum = parseFloat(amt) || 0;
  const fiat = amtNum * token.price;
  const chain = CHAINS[token.chain];
  const gasSym = GAS_SYMBOL[token.chain];
  const { trimmedTo, toValid, toError } = getRecipientValidation(to);
  const networkId = chainToNetworkId(token.chain);
  const liveMode = liveApi && networkId != null;
  const knownContact = RECIPIENTS.some(
    (recipient) => recipient.addr.toLowerCase() === trimmedTo.toLowerCase() && recipient.known,
  );

  const liveRisk = useRiskCheck({
    enabled: liveMode && toValid,
    address: trimmedTo,
    networkId,
    amount: amtNum,
    knownContact,
  });
  const liveSim = useSimulation({
    enabled: liveMode && step === "review" && amtNum > 0,
    networkId,
    from: prefs.walletAddress,
    to: trimmedTo,
    value: amt,
  });

  const localRisk = toValid && backend === "online" ? assessRecipient(trimmedTo) : null;
  const risk: AddressRisk | null = liveMode ? (liveRisk.status === "ok" ? liveRisk.risk : null) : localRisk;
  const checksAvailable = liveMode ? liveRisk.status !== "unavailable" : backend === "online";
  const riskLoading = liveMode && toValid && liveRisk.status === "idle";
  const blocked = Boolean(risk?.blocked);
  const recipientNet = recipientNetwork(trimmedTo);
  const netMismatch = Boolean(recipientNet && recipientNet !== token.chain);
  const simStatus: SimulationStatus = liveMode
    ? getLiveSimulationStatus(liveSim.status)
    : getLocalSimulationStatus({ checksAvailable, sendSim });
  const balanceAfter = Math.max(0, token.amount - amtNum);
  const stepIndex = SEND_STEPS.indexOf(step);

  useEffect(() => {
    if (blocked && !logged.current.has("block")) {
      logged.current.add("block");
      logEvent("risk_block");
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

  if (phase) {
    return (
      <SendConfirmOverlay
        phase={phase}
        setPhase={setPhase}
        outcome={sendOutcome}
        token={token}
        amount={amtNum}
        fiat={fiat}
        to={trimmedTo}
        onRetry={backToReview}
        onCancel={backToReview}
      />
    );
  }

  return (
    <Screen>
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

      {step === "to" && (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.stepScroll, { paddingBottom: insets.bottom + 80 }]}
        >
          <View style={[styles.toInput, { borderColor: toError ? theme.colors.neg : theme.colors.hairline }]}>
            <TextInput
              value={to}
              onChangeText={setTo}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t("send.to.placeholder")}
              placeholderTextColor={theme.colors.textFaint}
              style={styles.toTextInput}
            />
            <Pressable onPress={() => setTo(DEMO_PASTE_ADDRESS)} style={styles.iconInputButton}>
              <Icon name="paste" size={19} />
            </Pressable>
            <Pressable
              onPress={() => {
                beginScan((addr) => {
                  if (addr) setTo(addr);
                });
                router.push("/scan");
              }}
              style={styles.iconInputButton}
            >
              <Icon name="scan" size={19} />
            </Pressable>
          </View>

          {toError && (
            <View style={styles.errorRow}>
              <Icon name="alert" size={16} color={theme.colors.neg} />
              <AppText size={12.5} color={theme.colors.neg}>
                {t("send.to.invalid")}
              </AppText>
            </View>
          )}

          {risk && (
            <View style={styles.riskResult}>
              <RiskResult level={risk.level} {...getRiskCopy(risk, t)} />
            </View>
          )}
          {toValid && !checksAvailable && <OfflineRiskNote text={t("send.to.riskUnavailable")} />}

          <View style={styles.spacer} />
          <SectionLabel>{t("send.to.recent")}</SectionLabel>
          <Card padding={0} style={styles.recipientsCard}>
            {RECIPIENTS.map((recipient, index) => (
              <Row
                key={recipient.addr}
                last={index === RECIPIENTS.length - 1}
                onPress={() => setTo(recipient.addr)}
                left={<RecipientIcon flagged={recipient.flagged} />}
                title={recipient.label ?? shortAddr(recipient.addr, 8, 6)}
                sub={
                  recipient.label ? (
                    <AppText mono size={13} muted>
                      {shortAddr(recipient.addr, 8, 6)}
                    </AppText>
                  ) : (
                    <AppText size={13} faint>
                      {CHAINS[recipient.network].name}
                    </AppText>
                  )
                }
                chevron
              />
            ))}
          </Card>
        </ScrollView>
      )}

      {step === "to" && (
        <FooterButton bottomInset={insets.bottom}>
          <Button
            label={blocked ? t("send.to.blocked") : t("send.to.continue")}
            disabled={!toValid || blocked || riskLoading}
            onPress={() => {
              if (risk && !logged.current.has("check")) {
                logged.current.add("check");
                logEvent("risk_check", { detail: shortAddr(trimmedTo, 8, 6) });
              }
              setStep("amount");
            }}
          />
        </FooterButton>
      )}

      {step === "amount" && (
        <View style={styles.amountStep}>
          <Pressable
            onPress={() => sheets.open("pickToken", { current: token.id, onPick: (picked: DemoToken) => setToken(picked) })}
            style={styles.tokenPicker}
          >
            <TokenGlyph symbol={token.symbol} color={token.color} size={32} />
            <AppText weight="bold" size={15}>
              {token.symbol}
            </AppText>
            <Icon name="chevronD" size={16} color={theme.colors.textMuted} />
          </Pressable>

          <View style={styles.amountDisplay}>
            <AppText
              weight="bold"
              size={52}
              tnum
              color={amtNum > 0 ? theme.colors.text : theme.colors.textFaint}
              style={styles.amountText}
            >
              {amt}
              <AppText size={26} muted>
                {" "}
                {token.symbol}
              </AppText>
            </AppText>
            <AppText size={16} muted tnum style={styles.fiatText}>
              {t("send.amount.demoApprox", { value: fmtUSD(fiat) })}
            </AppText>
            <Pressable onPress={() => setAmt(String(token.amount))} style={styles.maxButton}>
              <AppText weight="semibold" size={13.5} muted>
                {t("send.amount.max")} ·
              </AppText>
              <AppText weight="semibold" size={13.5} muted tnum>
                {fmtToken(token.amount, token.symbol)}
              </AppText>
            </Pressable>
          </View>

          <NumberPad onKey={onKey} />
          <View style={styles.amountCta}>
            <Button
              label={amtNum > token.amount ? t("send.amount.insufficient") : t("send.amount.review")}
              disabled={amtNum <= 0 || amtNum > token.amount}
              onPress={() => setStep("review")}
            />
          </View>
        </View>
      )}

      {step === "review" && (
        <>
          <ScrollView contentContainerStyle={[styles.stepScroll, { paddingBottom: insets.bottom + 90 }]}>
            <View style={styles.reviewHero}>
              <TokenGlyph symbol={token.symbol} color={token.color} size={56} chainColor={chainBadgeColor(token.chain)} />
              <AppText weight="bold" size={34} tnum style={styles.reviewAmount}>
                {fmtToken(amtNum, token.symbol)}
              </AppText>
              <AppText size={15} muted tnum style={styles.reviewFiat}>
                {t("send.amount.demoApprox", { value: fmtUSD(fiat) })}
              </AppText>
            </View>

            <Card padding={0} style={styles.recipientsCard}>
              <Row title={t("send.review.to")} right={<AppText mono size={14}>{shortAddr(trimmedTo, 8, 6)}</AppText>} />
              <Row title={t("send.review.network")} right={chain.name} />
              <Row title={t("send.review.fee")} right={`${FEE_NATIVE} ${gasSym}`} />
              <Row
                title={t("send.review.total")}
                right={
                  <AppText weight="bold" size={15.5} tnum>
                    {t("send.review.totalValue", { amount: fmtToken(amtNum, token.symbol) })}
                  </AppText>
                }
                last
              />
            </Card>

            {risk && (
              <View style={styles.riskResult}>
                <RiskResult level={risk.level} {...getRiskCopy(risk, t)} compact />
              </View>
            )}
            {!checksAvailable && <OfflineRiskNote text={t("send.review.riskUnavailable")} />}

            {netMismatch && recipientNet && (
              <View style={styles.mismatch}>
                <Icon name="alert" size={20} color={theme.colors.warn} />
                <View style={styles.mismatchBody}>
                  <AppText weight="bold" size={13.5} color={theme.colors.warn}>
                    {t("send.mismatch.title")}
                  </AppText>
                  <AppText size={12.5} muted style={styles.mismatchText}>
                    {t("send.mismatch.body", { from: chain.name, to: CHAINS[recipientNet].name })}
                  </AppText>
                </View>
              </View>
            )}

            <SimulationCard status={simStatus} token={token} balanceAfter={balanceAfter} gasSym={gasSym} chainName={chain.name} />

            <View style={styles.trustNote}>
              <TrustNote icon="lock">{t("send.review.trustNote")}</TrustNote>
            </View>
          </ScrollView>

          <FooterButton bottomInset={insets.bottom}>
            <Button
              label={blocked ? t("send.confirm.blocked") : simStatus === "failed" ? t("send.confirm.simFailed") : t("send.confirm.cta")}
              icon="faceid"
              disabled={blocked || simStatus === "failed"}
              onPress={() => setPhase(prefs.requireLivenessSend && fiat >= HIGH_VALUE_USD ? "liveness" : "auth")}
            />
          </FooterButton>
        </>
      )}
    </Screen>
  );
}
