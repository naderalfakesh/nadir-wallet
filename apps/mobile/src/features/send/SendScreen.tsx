import React, { useState } from "react";
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
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useDemoState } from "@/providers/DemoStateProvider";
import { useSheets } from "@/providers/SheetProvider";
import { fmtUSD, fmtToken, shortAddr } from "@/utils/format";
import { CHAINS, tokenById, RECIPIENTS, chainBadgeColor, type DemoToken, type ChainId } from "@/features/wallet/data";
import { assessRecipient, recipientNetwork, type AddressRisk } from "@/features/wallet/risk";
import { SendConfirmOverlay, type SendPhase } from "./SendConfirmOverlay";

const GAS_SYMBOL: Record<ChainId, string> = {
  ethereum: "SepoliaETH",
  base: "BaseETH",
  arbitrum: "ArbETH",
  optimism: "OPETH",
  polygon: "POL",
};
const FEE_NATIVE = 0.00042;
const DEMO_PASTE_ADDRESS = "0x6b2fA0e1c4D9b8721a3F5e0c91A4";

type Step = "to" | "amount" | "review";

function riskCopy(risk: AddressRisk, t: (k: string, v?: Record<string, string | number>) => string) {
  const map = {
    reported: { title: t("send.risk.reportedTitle"), detail: t("send.risk.reportedDetail") },
    known: { title: t("send.risk.knownTitle"), detail: t("send.risk.knownDetail") },
    firstTime: { title: t("send.risk.firstTimeTitle"), detail: t("send.risk.firstTimeDetail") },
  }[risk.reason];
  const levelLabel = t(
    risk.level === "low" ? "send.risk.levelLow" : risk.level === "medium" ? "send.risk.levelMedium" : "send.risk.levelHigh",
  );
  return { ...map, levelLabel };
}

export function SendScreen({ tokenId }: { tokenId?: string }) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { backend, sendSim, sendOutcome } = useDemoState();
  const sheets = useSheets();

  const [step, setStep] = useState<Step>("to");
  const [token, setToken] = useState<DemoToken>(tokenId ? tokenById(tokenId) : tokenById("eth"));
  const [to, setTo] = useState("");
  const [amt, setAmt] = useState("0");
  const [phase, setPhase] = useState<SendPhase | null>(null);

  const amtNum = parseFloat(amt) || 0;
  const fiat = amtNum * token.price;
  const chain = CHAINS[token.chain];
  const gasSym = GAS_SYMBOL[token.chain];

  const trimmedTo = to.trim();
  const looksAddr = /^0x[0-9a-fA-F]{6,}$/.test(trimmedTo);
  const looksEns = /\.(eth|sol)$/i.test(trimmedTo);
  const toValid = looksAddr || looksEns;
  const toError = trimmedTo.length > 3 && !toValid;

  const checksAvailable = backend === "online";
  const risk = toValid && checksAvailable ? assessRecipient(trimmedTo) : null;
  const blocked = !!risk?.blocked;
  const recipientNet = recipientNetwork(trimmedTo);
  const netMismatch = !!(recipientNet && recipientNet !== token.chain);
  const simStatus = !checksAvailable ? "unavailable" : sendSim === "fail" ? "failed" : "passed";
  const balanceAfter = Math.max(0, token.amount - amtNum);

  const onKey = (k: string) => {
    setAmt((prev) => {
      if (k === "del") return prev.length <= 1 ? "0" : prev.slice(0, -1);
      if (k === ".") return prev.includes(".") ? prev : prev + ".";
      if (prev === "0") return k;
      return prev + k;
    });
  };

  const back = () => (step === "to" ? router.back() : setStep(step === "review" ? "amount" : "to"));
  const stepIndex = { to: 0, amount: 1, review: 2 }[step];

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
        onRetry={() => {
          setPhase(null);
          setStep("review");
        }}
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
      <View style={{ flexDirection: "row", gap: 5, paddingHorizontal: theme.spacing.pad, paddingBottom: 8 }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{ flex: 1, height: 3, borderRadius: 9, backgroundColor: stepIndex >= i ? theme.colors.accent : theme.colors.surface3 }}
          />
        ))}
      </View>

      {step === "to" && (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: theme.spacing.pad, paddingBottom: insets.bottom + 80 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: toError ? theme.colors.neg : theme.colors.hairline,
              borderRadius: theme.radius.field,
              paddingLeft: 16,
              paddingRight: 6,
            }}
          >
            <TextInput
              value={to}
              onChangeText={setTo}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t("send.to.placeholder")}
              placeholderTextColor={theme.colors.textFaint}
              style={{ flex: 1, color: theme.colors.text, fontFamily: theme.font.monoRegular, fontSize: 15, paddingVertical: 14 }}
            />
            <Pressable onPress={() => setTo(DEMO_PASTE_ADDRESS)} style={iconInputBtn(theme.colors.surface2)}>
              <Icon name="paste" size={19} />
            </Pressable>
            <Pressable onPress={() => sheets.open("scan")} style={iconInputBtn(theme.colors.surface2)}>
              <Icon name="scan" size={19} />
            </Pressable>
          </View>

          {toError && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
              <Icon name="alert" size={16} color={theme.colors.neg} />
              <AppText size={12.5} color={theme.colors.neg}>
                {t("send.to.invalid")}
              </AppText>
            </View>
          )}

          {risk && (
            <View style={{ marginTop: 12 }}>
              <RiskResult level={risk.level} {...riskCopy(risk, t)} />
            </View>
          )}
          {toValid && !checksAvailable && <OfflineRiskNote text={t("send.to.riskUnavailable")} />}

          <View style={{ height: 22 }} />
          <SectionLabel>{t("send.to.recent")}</SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            {RECIPIENTS.map((r, i) => (
              <Row
                key={r.addr}
                last={i === RECIPIENTS.length - 1}
                onPress={() => setTo(r.addr)}
                left={
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: r.flagged ? alpha(theme.colors.neg, 0.16) : theme.colors.surface3,
                    }}
                  >
                    <Icon name={r.flagged ? "shield" : "user"} size={20} color={r.flagged ? theme.colors.neg : theme.colors.textMuted} />
                  </View>
                }
                title={r.label ?? shortAddr(r.addr, 8, 6)}
                sub={
                  r.label ? (
                    <AppText mono size={13} muted>
                      {shortAddr(r.addr, 8, 6)}
                    </AppText>
                  ) : (
                    <AppText size={13} faint>
                      {CHAINS[r.network].name}
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
        <FooterButton insets={insets}>
          <Button
            label={blocked ? t("send.to.blocked") : t("send.to.continue")}
            disabled={!toValid || blocked}
            onPress={() => setStep("amount")}
          />
        </FooterButton>
      )}

      {step === "amount" && (
        <View style={{ flex: 1, padding: theme.spacing.pad }}>
          <Pressable
            onPress={() => sheets.open("pickToken", { current: token.id, onPick: (tk: DemoToken) => setToken(tk) })}
            style={{
              alignSelf: "center",
              flexDirection: "row",
              alignItems: "center",
              gap: 9,
              height: 44,
              paddingLeft: 6,
              paddingRight: 14,
              borderRadius: 99,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.hairline,
              marginBottom: 8,
            }}
          >
            <TokenGlyph symbol={token.symbol} color={token.color} size={32} />
            <AppText weight="bold" size={15}>
              {token.symbol}
            </AppText>
            <Icon name="chevronD" size={16} color={theme.colors.textMuted} />
          </Pressable>

          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <AppText weight="bold" size={52} tnum color={amtNum > 0 ? theme.colors.text : theme.colors.textFaint} style={{ letterSpacing: -1.6 }}>
              {amt}
              <AppText size={26} muted>
                {" "}
                {token.symbol}
              </AppText>
            </AppText>
            <AppText size={16} muted tnum style={{ marginTop: 8 }}>
              {t("send.amount.demoApprox", { value: fmtUSD(fiat) })}
            </AppText>
            <Pressable
              onPress={() => setAmt(String(token.amount))}
              style={{
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                height: 36,
                paddingHorizontal: 13,
                borderRadius: theme.radius.chip,
                backgroundColor: theme.colors.surface2,
                borderWidth: 1,
                borderColor: theme.colors.hairline,
              }}
            >
              <AppText weight="semibold" size={13.5} muted>
                {t("send.amount.max")} ·
              </AppText>
              <AppText weight="semibold" size={13.5} muted tnum>
                {fmtToken(token.amount, token.symbol)}
              </AppText>
            </Pressable>
          </View>

          <NumberPad onKey={onKey} />
          <View style={{ paddingTop: 12 }}>
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
          <ScrollView contentContainerStyle={{ padding: theme.spacing.pad, paddingBottom: insets.bottom + 90 }}>
            <View style={{ alignItems: "center", paddingTop: 4, paddingBottom: 18 }}>
              <TokenGlyph symbol={token.symbol} color={token.color} size={56} chainColor={chainBadgeColor(token.chain)} />
              <AppText weight="bold" size={34} tnum style={{ marginTop: 12 }}>
                {fmtToken(amtNum, token.symbol)}
              </AppText>
              <AppText size={15} muted tnum style={{ marginTop: 3 }}>
                {t("send.amount.demoApprox", { value: fmtUSD(fiat) })}
              </AppText>
            </View>

            <Card padding={0} style={{ paddingHorizontal: 16 }}>
              <Row title={t("send.review.to")} right={<AppText mono size={14}>{shortAddr(trimmedTo, 8, 6)}</AppText>} />
              <Row title={t("send.review.network")} right={chain.name} />
              <Row title={t("send.review.fee")} right={`${FEE_NATIVE} ${gasSym}`} />
              <Row
                title={t("send.review.total")}
                right={<AppText weight="bold" size={15.5} tnum>{t("send.review.totalValue", { amount: fmtToken(amtNum, token.symbol) })}</AppText>}
                last
              />
            </Card>

            {risk && (
              <View style={{ marginTop: 12 }}>
                <RiskResult level={risk.level} {...riskCopy(risk, t)} compact />
              </View>
            )}
            {!checksAvailable && <OfflineRiskNote text={t("send.review.riskUnavailable")} />}

            {netMismatch && recipientNet && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 11,
                  marginTop: 12,
                  padding: 13,
                  borderRadius: 14,
                  backgroundColor: alpha(theme.colors.warn, 0.12),
                  borderWidth: 1,
                  borderColor: alpha(theme.colors.warn, 0.3),
                }}
              >
                <Icon name="alert" size={20} color={theme.colors.warn} />
                <View style={{ flex: 1 }}>
                  <AppText weight="bold" size={13.5} color={theme.colors.warn}>
                    {t("send.mismatch.title")}
                  </AppText>
                  <AppText size={12.5} muted style={{ lineHeight: 18, marginTop: 2 }}>
                    {t("send.mismatch.body", { from: chain.name, to: CHAINS[recipientNet].name })}
                  </AppText>
                </View>
              </View>
            )}

            <SimulationCard status={simStatus} token={token} balanceAfter={balanceAfter} gasSym={gasSym} chainName={chain.name} />

            <View style={{ marginTop: 12 }}>
              <TrustNote icon="lock">{t("send.review.trustNote")}</TrustNote>
            </View>
          </ScrollView>

          <FooterButton insets={insets}>
            <Button
              label={blocked ? t("send.confirm.blocked") : simStatus === "failed" ? t("send.confirm.simFailed") : t("send.confirm.cta")}
              icon="faceid"
              disabled={blocked || simStatus === "failed"}
              onPress={() => setPhase("auth")}
            />
          </FooterButton>
        </>
      )}
    </Screen>
  );
}

function iconInputBtn(bg: string) {
  return { width: 42, height: 42, borderRadius: 13, backgroundColor: bg, alignItems: "center", justifyContent: "center" } as const;
}

function FooterButton({ children, insets }: { children: React.ReactNode; insets: { bottom: number } }) {
  const theme = useTheme();
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: theme.spacing.pad,
        paddingBottom: insets.bottom + theme.spacing.pad,
        backgroundColor: theme.colors.bg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.hairline,
      }}
    >
      {children}
    </View>
  );
}

function OfflineRiskNote({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
        marginTop: 12,
        padding: 12,
        borderRadius: 13,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.hairline,
      }}
    >
      <Icon name="wifiOff" size={17} color={theme.colors.textFaint} />
      <AppText size={12.5} muted style={{ flex: 1, lineHeight: 17 }}>
        {text}
      </AppText>
    </View>
  );
}

function SimulationCard({
  status,
  token,
  balanceAfter,
  gasSym,
  chainName,
}: {
  status: "passed" | "failed" | "unavailable";
  token: DemoToken;
  balanceAfter: number;
  gasSym: string;
  chainName: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const tone = status === "failed" ? theme.colors.neg : status === "unavailable" ? theme.colors.textFaint : theme.colors.pos;
  const pill = status === "failed" ? t("send.sim.failed") : status === "unavailable" ? t("send.sim.unavailable") : t("send.sim.passed");
  const icon = status === "failed" ? "alert" : status === "unavailable" ? "wifiOff" : "checkCircle";

  const rows: [string, string][] = [
    [t("send.sim.estFee"), `${FEE_NATIVE} ${gasSym}`],
    [t("send.sim.balanceAfter"), fmtToken(balanceAfter, token.symbol)],
    [t("send.sim.network"), chainName],
    [t("send.sim.contract"), t("send.sim.contractNone")],
  ];

  return (
    <View
      style={{
        marginTop: 12,
        padding: 14,
        borderRadius: theme.radius.card,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: alpha(tone, 0.26),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 11 }}>
        <Icon name={icon} size={19} color={tone} />
        <AppText weight="bold" size={14} style={{ flex: 1 }}>
          {t("send.sim.title")}
        </AppText>
        <View style={{ backgroundColor: alpha(tone, 0.15), paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 }}>
          <AppText weight="bold" size={11.5} color={tone}>
            {pill}
          </AppText>
        </View>
      </View>
      {status === "failed" ? (
        <AppText size={12.5} muted style={{ lineHeight: 19 }}>
          {t("send.sim.failedBody")}
        </AppText>
      ) : status === "unavailable" ? (
        <AppText size={12.5} muted style={{ lineHeight: 19 }}>
          {t("send.sim.unavailableBody")}
        </AppText>
      ) : (
        <View style={{ gap: 7 }}>
          {rows.map(([k, v]) => (
            <View key={k} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <AppText size={12.5} muted>
                {k}
              </AppText>
              <AppText size={12.5} tnum>
                {v}
              </AppText>
            </View>
          ))}
        </View>
      )}
      <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.hairline, marginTop: 11, paddingTop: 10 }}>
        <AppText faint size={11} style={{ lineHeight: 16 }}>
          {t("send.sim.note")}
        </AppText>
      </View>
    </View>
  );
}
