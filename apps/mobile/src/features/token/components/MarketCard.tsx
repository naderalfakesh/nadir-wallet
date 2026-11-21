import React from "react";
import { StyleSheet } from "react-native";
import { AppText, Card, ChangeBadge, Row } from "@/components";
import type { PortfolioToken } from "@/features/wallet/types";
import { useTranslation } from "@/i18n/useTranslation";
import { fmtUSD } from "@/utils/format";

interface MarketCardProps {
  token: PortfolioToken;
  chainName: string;
  priceUnavailable: boolean;
}

export function MarketCard({ token, chainName, priceUnavailable }: MarketCardProps) {
  const { t } = useTranslation();

  return (
    <Card padding={0} style={styles.cardInset}>
      <Row
        title={t("token.price")}
        right={priceUnavailable ? "—" : fmtUSD(token.price, { cents: token.price < 10 })}
      />
      <Row
        title={t("token.change24")}
        right={
          priceUnavailable ? (
            <AppText faint size={15.5}>
              —
            </AppText>
          ) : (
            <ChangeBadge pct={token.change} size={13} plain />
          )
        }
      />
      <Row title={t("token.network")} right={chainName} last />
    </Card>
  );
}

const styles = StyleSheet.create({
  cardInset: {
    paddingHorizontal: 16,
  },
});
