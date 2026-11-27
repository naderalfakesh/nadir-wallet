import React, { useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  IconButton,
  Screen,
  ScreenHeader,
  ScrubbableChart,
  SectionLabel,
  Segmented,
} from "@/components";
import { CHAINS } from "@/features/wallet/chains";
import { RANGES, type Range } from "@/features/wallet/chart";
import { BackendNotice } from "@/features/wallet/components/BackendNotice";
import { tokenById } from "@/features/wallet/demoData";
import { useChartScrub } from "@/features/wallet/useChartScrub";
import { useTranslation } from "@/i18n/useTranslation";
import { useSheets } from "@/providers/SheetProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { fmtUSD } from "@/utils/format";
import { MarketCard } from "./components/MarketCard";
import { RecentTransactions } from "./components/RecentTransactions";
import { TokenHero } from "./components/TokenHero";

export function TokenDetailScreen({ id }: { id: string }) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { t } = useTranslation();
  const { tokens, transactions, backend, price, refresh, loading } = useWallet();
  const sheets = useSheets();
  const [range, setRange] = useState<Range>("1W");

  const token = tokens.find((item) => item.id === id) ?? tokenById(id);
  const chain = CHAINS[token.chain];
  const priceUnavailable = price === "unavailable";
  const dimChart = backend === "rpc_unavailable" || priceUnavailable;
  const { chart, scrubbed, onScrub } = useChartScrub({
    seriesId: token.id,
    range,
    change24h: token.change,
    totalValue: token.value,
    unitPrice: token.price,
    disabled: priceUnavailable,
  });

  const historyLabel = scrubbed
    ? `${scrubbed.timeLabel} · ${fmtUSD(scrubbed.price ?? token.price)}`
    : t("home.demoHistory", { range });

  const recentTransactions = useMemo(
    () => transactions.filter((item) => item.token === token.symbol).slice(0, 3),
    [transactions, token.symbol],
  );

  return (
    <Screen>
      <ScreenHeader
        title={token.name}
        subtitle={chain.name}
        onBack={() => router.back()}
        trailing={
          <IconButton
            name="more"
            size={20}
            accessibilityLabel={t("common.a11y.moreOptions")}
            onPress={() => sheets.open("soon", { title: token.symbol })}
          />
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        {backend !== "online" && (
          <View style={styles.notice}>
            <BackendNotice status={backend} onRetry={refresh} />
          </View>
        )}

        <View style={styles.body}>
          <TokenHero
            token={token}
            value={scrubbed?.value ?? token.value}
            change={scrubbed?.change ?? chart.change}
            historyLabel={historyLabel}
            priceUnavailable={priceUnavailable}
            priceStatus={price}
            unavailableLabel={t("token.valueUnavailable")}
            onRetry={refresh}
          />

          <View style={[styles.chartWrap, { opacity: dimChart ? 0.4 : 1 }]}>
            <ScrubbableChart
              data={chart.data}
              up={chart.change >= 0}
              height={104}
              onScrub={onScrub}
            />
          </View>
          <Segmented options={RANGES} value={range} onChange={setRange} small />

          <View style={styles.actions}>
            <Button
              label={t("common.actions.receive")}
              icon="receive"
              variant="soft"
              style={styles.actionButton}
              onPress={() => sheets.open("receive", { chain: token.chain, token: token.symbol })}
            />
            <Button
              label={t("common.actions.send")}
              icon="send"
              height={52}
              style={styles.actionButton}
              onPress={() => router.push(`/send?token=${token.id}`)}
            />
          </View>

          <View style={styles.spacer} />
          <SectionLabel>{t("token.market")}</SectionLabel>
          <MarketCard token={token} chainName={chain.name} priceUnavailable={priceUnavailable} />

          {recentTransactions.length > 0 && (
            <>
              <View style={styles.spacer} />
              <RecentTransactions
                transactions={recentTransactions}
                onTransactionPress={(txId) => sheets.open("txDetail", { id: txId })}
              />
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      paddingBottom: 24,
    },
    notice: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: 4,
    },
    body: {
      paddingHorizontal: theme.spacing.pad,
    },
    chartWrap: {
      marginTop: 20,
      marginBottom: 12,
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
    },
    actionButton: {
      flex: 1,
    },
    spacer: {
      height: 22,
    },
  });
