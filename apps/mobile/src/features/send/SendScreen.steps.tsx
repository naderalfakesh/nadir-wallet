import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import {
  AppText,
  Button,
  Card,
  Row,
  Icon,
  TokenGlyph,
  SectionLabel,
  NumberPad,
  RiskResult,
  TrustNote,
} from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { fmtUSD, fmtToken, shortAddr } from "@/utils/format";
import { CHAINS, RECIPIENTS, chainBadgeColor, type Chain, type ChainId, type DemoToken } from "@/features/wallet/data";
import type { AddressRisk } from "@/features/wallet/risk";
import { readClipboardText } from "@/services/device";
import { createStaleGuard } from "@/features/auth/staleGuard";
import { createSendStyles } from "./SendScreen.styles";
import { OfflineRiskNote, RecipientIcon, SimulationCard } from "./SendScreen.parts";
import { getRecipientValidation, getRiskCopy } from "./send.utils";
import type { SimulationStatus } from "./send.types";

interface ToStepProps {
  to: string;
  toError: boolean;
  toValid: boolean;
  risk: AddressRisk | null;
  riskUnavailable: boolean;
  onChangeTo: (value: string) => void;
  onScan: () => void;
}

export function ToStep({
  to,
  toError,
  toValid,
  risk,
  riskUnavailable,
  onChangeTo,
  onScan,
}: ToStepProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);
  const { t } = useTranslation();
  const [pasteFeedback, setPasteFeedback] = useState<"empty" | "invalid" | null>(null);
  const [pasteGuard] = useState(createStaleGuard);
  useEffect(() => () => pasteGuard.invalidate(), [pasteGuard]);

  const editRecipient = (value: string) => {
    pasteGuard.invalidate();
    setPasteFeedback(null);
    onChangeTo(value);
  };
  const paste = async () => {
    pasteGuard.invalidate();
    const { current, value } = await pasteGuard.run(readClipboardText);
    if (!current) return;
    if (getRecipientValidation(value).toValid) editRecipient(value);
    else setPasteFeedback(value ? "invalid" : "empty");
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.stepScroll}
    >
      <View style={[styles.toInput, { borderColor: toError ? theme.colors.neg : theme.colors.hairline }]}>
        <TextInput
          testID="send-recipient"
          value={to}
          onChangeText={editRecipient}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          placeholder={t("send.to.placeholder")}
          placeholderTextColor={theme.colors.textFaint}
          style={styles.toTextInput}
        />
        <Pressable onPress={() => void paste()} accessibilityRole="button" accessibilityLabel={t("send.to.paste")} style={styles.iconInputButton}>
          <Icon name="paste" size={19} />
        </Pressable>
        <Pressable onPress={() => { pasteGuard.invalidate(); onScan(); }} accessibilityRole="button" accessibilityLabel="Scan QR code" style={styles.iconInputButton}>
          <Icon name="scan" size={19} />
        </Pressable>
      </View>

      {pasteFeedback && (
        <AppText size={12.5} muted accessibilityLiveRegion="polite" style={styles.errorRow}>
          {t(pasteFeedback === "empty" ? "common.actions.clipboardEmpty" : "send.to.clipboardInvalid")}
        </AppText>
      )}

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
      {toValid && riskUnavailable && <OfflineRiskNote text={t("send.to.riskUnavailable")} />}

      <View style={styles.spacer} />
      <SectionLabel>{t("send.to.samples")}</SectionLabel>
      <Card padding={0} style={styles.recipientsCard}>
        {RECIPIENTS.map((recipient, index) => (
          <Row
            key={recipient.addr}
            last={index === RECIPIENTS.length - 1}
            onPress={() => editRecipient(recipient.addr)}
            left={<RecipientIcon flagged={recipient.flagged} />}
            title={
              recipient.label ?? (
                <AppText mono weight="semibold" size={15} numberOfLines={1}>
                  {shortAddr(recipient.addr, 8, 6)}
                </AppText>
              )
            }
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
  );
}

interface AmountStepProps {
  token: DemoToken;
  amt: string;
  amtNum: number;
  fiat: number;
  onKey: (key: string) => void;
  onMax: () => void;
  onPickToken: () => void;
  onReview: () => void;
}

export function AmountStep({ token, amt, amtNum, fiat, onKey, onMax, onPickToken, onReview }: AmountStepProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.amountStep}>
      <Pressable onPress={onPickToken} style={styles.tokenPicker}>
        <TokenGlyph symbol={token.symbol} color={token.color} size={32} />
        <AppText weight="bold" size={15}>
          {token.symbol}
        </AppText>
        <Icon name="chevronD" size={16} color={theme.colors.textMuted} />
      </Pressable>

      <View style={styles.amountDisplay}>
        <View style={styles.amountRow}>
          <AppText
            weight="bold"
            size={52}
            tnum
            color={amtNum > 0 ? theme.colors.text : theme.colors.textFaint}
            style={styles.amountText}
          >
            {amt}
          </AppText>
          <AppText size={26} muted>
            {token.symbol}
          </AppText>
        </View>
        <AppText size={16} muted tnum style={styles.fiatText}>
          {t("send.amount.demoApprox", { value: fmtUSD(fiat) })}
        </AppText>
        <Pressable onPress={onMax} style={styles.maxButton}>
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
          onPress={onReview}
        />
      </View>
    </ScrollView>
  );
}

interface ReviewStepProps {
  token: DemoToken;
  amtNum: number;
  fiat: number;
  trimmedTo: string;
  chain: Chain;
  fee: string | null;
  total: string;
  simulationLoading: boolean;
  warnings?: string[];
  risk: AddressRisk | null;
  riskUnavailable: boolean;
  netMismatch: boolean;
  recipientNet: ChainId | null;
  simStatus: SimulationStatus;
  balanceAfter: number;
}

export function ReviewStep({
  token,
  amtNum,
  fiat,
  trimmedTo,
  chain,
  fee,
  total,
  simulationLoading,
  warnings,
  risk,
  riskUnavailable,
  netMismatch,
  recipientNet,
  simStatus,
  balanceAfter,
}: ReviewStepProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.stepScroll}>
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
        <Row title={t("send.review.fee")} right={fee ?? t(simulationLoading ? "send.sim.loading" : "send.sim.unavailable")} />
        <Row
          title={t("send.review.total")}
          right={
            <AppText weight="bold" size={15.5} tnum>
              {total}
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
      {riskUnavailable && <OfflineRiskNote text={t("send.review.riskUnavailable")} />}

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

      <SimulationCard
        status={simStatus}
        loading={simulationLoading}
        token={token}
        balanceAfter={balanceAfter}
        fee={fee}
        warnings={warnings}
      />

      <View style={styles.trustNote}>
        <TrustNote icon="lock">{t("send.review.trustNote")}</TrustNote>
      </View>
    </ScrollView>
  );
}
