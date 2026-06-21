import React, { useMemo } from "react";
import { View } from "react-native";
import { AppText, Card, ChangeBadge, PriceFreshness, Row, SectionLabel, TokenGlyph } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { fmtToken, fmtUSD } from "@/utils/format";
import type { PriceStatus } from "@/types/status";
import type { DemoToken, DemoTransaction } from "@/features/wallet/data";
import { TransactionRow } from "@/features/wallet/TransactionRow";
import { createTokenDetailStyles } from "./TokenDetailScreen.styles";

interface TokenHeroProps {
  token: DemoToken;
  priceUnavailable: boolean;
  priceStatus: PriceStatus;
  unavailableLabel: string;
  onRetry: () => void;
}

export function TokenHero({ token, priceUnavailable, priceStatus, unavailableLabel, onRetry }: TokenHeroProps) {
  const theme = useTheme();
  const styles = useMemo(() => createTokenDetailStyles(theme), [theme]);

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
          <ChangeBadge pct={token.change} />
        </View>
      )}
      <PriceFreshness status={priceStatus} onRetry={onRetry} />
    </View>
  );
}

interface MarketCardProps {
  token: DemoToken;
  chainName: string;
  priceUnavailable: boolean;
}

export function MarketCard({ token, chainName, priceUnavailable }: MarketCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createTokenDetailStyles(theme), [theme]);
  const { t } = useTranslation();

  return (
    <Card padding={0} style={styles.cardInset}>
      <Row title={t("token.price")} right={priceUnavailable ? "—" : fmtUSD(token.price, { cents: token.price < 10 })} />
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

interface RecentTransactionsProps {
  transactions: DemoTransaction[];
  onTransactionPress: (id: string) => void;
}

export function RecentTransactions({ transactions, onTransactionPress }: RecentTransactionsProps) {
  const theme = useTheme();
  const styles = useMemo(() => createTokenDetailStyles(theme), [theme]);
  const { t } = useTranslation();

  return (
    <>
      <SectionLabel>{t("token.recent")}</SectionLabel>
      <Card padding={0} style={styles.cardInset}>
        {transactions.map((tx, index) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            subtitle={tx.when}
            iconSize={40}
            showValue={false}
            last={index === transactions.length - 1}
            onPress={() => onTransactionPress(tx.id)}
          />
        ))}
      </Card>
    </>
  );
}
