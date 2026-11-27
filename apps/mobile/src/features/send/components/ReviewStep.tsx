import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText, Card, RiskResult, Row, TokenGlyph, TrustNote } from "@/components";
import { CHAINS, chainBadgeColor } from "@/features/wallet/chains";
import type { AddressRisk } from "@/features/wallet/risk";
import type { Chain, ChainId, PortfolioToken } from "@/features/wallet/types";
import { useTranslation } from "@/i18n/useTranslation";
import { useThemedStyles, type Theme } from "@/theme";
import type { SimulationStatus } from "@/types/status";
import { fmtToken, fmtUSD, shortAddr } from "@/utils/format";
import { getRiskCopy } from "../send.utils";
import { NetworkMismatchBanner } from "./NetworkMismatchBanner";
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

      <Card padding={0} style={styles.summaryCard}>
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
        <View style={styles.sectionGap}>
          <RiskResult level={risk.level} {...getRiskCopy(risk, t)} compact />
        </View>
      )}
      {riskUnavailable && <OfflineRiskNote text={t("send.review.riskUnavailable")} />}

      {netMismatch && recipientNet && (
        <NetworkMismatchBanner fromChainName={chain.name} toChainName={CHAINS[recipientNet].name} />
      )}

      <SimulationCard
        status={simStatus}
        loading={simulationLoading}
        token={token}
        balanceAfter={balanceAfter}
        fee={fee}
        warnings={warnings}
      />

      <View style={styles.sectionGap}>
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
    summaryCard: {
      paddingHorizontal: 16,
    },
    sectionGap: {
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
  });
