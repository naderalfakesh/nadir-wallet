import React, { useMemo } from "react";
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
import { FEE_NATIVE } from "./send.constants";
import { createSendStyles } from "./SendScreen.styles";
import { OfflineRiskNote, RecipientIcon, SimulationCard } from "./SendScreen.parts";
import { getRiskCopy } from "./send.utils";
import type { SimulationStatus } from "./send.types";

interface ToStepProps {
  to: string;
  toError: boolean;
  toValid: boolean;
  risk: AddressRisk | null;
  checksAvailable: boolean;
  bottomInset: number;
  onChangeTo: (value: string) => void;
  onPaste: () => void;
  onScan: () => void;
  onPickRecipient: (address: string) => void;
}

export function ToStep({
  to,
  toError,
  toValid,
  risk,
  checksAvailable,
  bottomInset,
  onChangeTo,
  onPaste,
  onScan,
  onPickRecipient,
}: ToStepProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);
  const { t } = useTranslation();

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.stepScroll, { paddingBottom: bottomInset + 80 }]}
    >
      <View style={[styles.toInput, { borderColor: toError ? theme.colors.neg : theme.colors.hairline }]}>
        <TextInput
          value={to}
          onChangeText={onChangeTo}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t("send.to.placeholder")}
          placeholderTextColor={theme.colors.textFaint}
          style={styles.toTextInput}
        />
        <Pressable onPress={onPaste} accessibilityRole="button" accessibilityLabel="Paste address" style={styles.iconInputButton}>
          <Icon name="paste" size={19} />
        </Pressable>
        <Pressable onPress={onScan} accessibilityRole="button" accessibilityLabel="Scan QR code" style={styles.iconInputButton}>
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
            onPress={() => onPickRecipient(recipient.addr)}
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
    <View style={styles.amountStep}>
      <Pressable onPress={onPickToken} style={styles.tokenPicker}>
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
    </View>
  );
}

interface ReviewStepProps {
  token: DemoToken;
  amtNum: number;
  fiat: number;
  trimmedTo: string;
  chain: Chain;
  gasSym: string;
  risk: AddressRisk | null;
  checksAvailable: boolean;
  netMismatch: boolean;
  recipientNet: ChainId | null;
  simStatus: SimulationStatus;
  balanceAfter: number;
  bottomInset: number;
}

export function ReviewStep({
  token,
  amtNum,
  fiat,
  trimmedTo,
  chain,
  gasSym,
  risk,
  checksAvailable,
  netMismatch,
  recipientNet,
  simStatus,
  balanceAfter,
  bottomInset,
}: ReviewStepProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSendStyles(theme), [theme]);
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={[styles.stepScroll, { paddingBottom: bottomInset + 90 }]}>
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
  );
}
