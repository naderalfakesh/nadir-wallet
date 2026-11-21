import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, ChangeBadge, PriceFreshness, TokenGlyph } from "@/components";
import type { PortfolioToken } from "@/features/wallet/types";
import type { PriceStatus } from "@/types/status";
import { fmtToken, fmtUSD } from "@/utils/format";

interface TokenHeroProps {
  token: PortfolioToken;
  change: number;
  historyLabel: string;
  priceUnavailable: boolean;
  priceStatus: PriceStatus;
  unavailableLabel: string;
  onRetry: () => void;
}

export function TokenHero({
  token,
  change,
  historyLabel,
  priceUnavailable,
  priceStatus,
  unavailableLabel,
  onRetry,
}: TokenHeroProps) {
  return (
    <View style={styles.hero}>
      <TokenGlyph symbol={token.symbol} color={token.color} size={64} />
      <AppText weight="bold" size={34} tnum style={styles.heroAmount}>
        {fmtToken(token.amount, token.symbol)}
      </AppText>
      <AppText size={16} muted tnum style={styles.heroValue}>
        {priceUnavailable ? unavailableLabel : fmtUSD(token.value)}
      </AppText>
      {!priceUnavailable && (
        <View style={styles.heroChange}>
          <ChangeBadge pct={change} />
          <AppText size={12.5} muted>
            {historyLabel}
          </AppText>
        </View>
      )}
      <PriceFreshness status={priceStatus} onRetry={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingTop: 4,
  },
  heroAmount: {
    marginTop: 14,
    letterSpacing: -1,
  },
  heroValue: {
    marginTop: 4,
  },
  heroChange: {
    marginTop: 10,
  },
});
