import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText, Card, Row, Icon, TokenGlyph, RiskResult, TrustNote } from "@/components";
import {
  CHAINS,
  chainBadgeColor,
  type Chain,
  type ChainId,
  type PortfolioToken,
} from "@/features/wallet/data";
import type { AddressRisk } from "@/features/wallet/risk";
import { useTranslation } from "@/i18n/useTranslation";
import { alpha, useTheme, useThemedStyles, type Theme } from "@/theme";
import type { SimulationStatus } from "@/types/status";
import { fmtUSD, fmtToken, shortAddr } from "@/utils/format";
import { getRiskCopy } from "../send.utils";
import { OfflineRiskNote } from "./OfflineRiskNote";
import { SimulationCard } from "./SimulationCard";

interface ReviewStepProps {
  token: PortfolioToken;
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
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.stepScroll}>
      <View style={styles.reviewHero}>
        <TokenGlyph
          symbol={token.symbol}
          color={token.color}
          size={56}
          chainColor={chainBadgeColor(token.chain)}
        />
        <AppText weight="bold" size={34} tnum style={styles.reviewAmount}>
          {fmtToken(amtNum, token.symbol)}
        </AppText>
        <AppText size={15} muted tnum style={styles.reviewFiat}>
          {t("send.amount.demoApprox", { value: fmtUSD(fiat) })}
        </AppText>
      </View>

      <Card padding={0} style={styles.recipientsCard}>
        <Row
          title={t("send.review.to")}
          right={
            <AppText mono size={14}>
              {shortAddr(trimmedTo, 8, 6)}
            </AppText>
          }
        />
        <Row title={t("send.review.network")} right={chain.name} />
        <Row
          title={t("send.review.fee")}
          right={fee ?? t(simulationLoading ? "send.sim.loading" : "send.sim.unavailable")}
        />
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    stepScroll: {
      padding: theme.spacing.pad,
    },
    recipientsCard: {
      paddingHorizontal: 16,
    },
    riskResult: {
      marginTop: 12,
    },
    reviewHero: {
      alignItems: "center",
      paddingTop: 0,
      paddingBottom: 12,
    },
    reviewAmount: {
      marginTop: 12,
    },
    reviewFiat: {
      marginTop: 3,
    },
    mismatch: {
      flexDirection: "row",
      gap: 11,
      marginTop: 12,
      padding: 13,
      borderRadius: 14,
      backgroundColor: alpha(theme.colors.warn, 0.12),
      borderWidth: 1,
      borderColor: alpha(theme.colors.warn, 0.3),
    },
    mismatchBody: {
      flex: 1,
    },
    mismatchText: {
      lineHeight: 18,
      marginTop: 2,
    },
    trustNote: {
      marginTop: 12,
    },
  });
