import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  ScreenHeader,
  Button,
  IconButton,
  SectionLabel,
  Segmented,
  Sparkline,
} from "@/components";
import { getDemoChart } from "@/features/wallet/chart";
import { BackendNotice } from "@/features/wallet/components/BackendNotice";
import { CHAINS, tokenById, RANGES, type Range } from "@/features/wallet/data";
import { useTranslation } from "@/i18n/useTranslation";
import { useSheets } from "@/providers/SheetProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
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

  const token = tokens.find((x) => x.id === id) ?? tokenById(id);
  const chain = CHAINS[token.chain];
  const chart = getDemoChart(token.id, range, token.change);
  const priceUnavailable = price === "unavailable";
  const dimChart = backend === "rpc_unavailable" || priceUnavailable;
  const txs = transactions.filter((x) => x.token === token.symbol).slice(0, 3);

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
            change={chart.change}
            historyLabel={t("home.demoHistory", { range })}
            priceUnavailable={priceUnavailable}
            priceStatus={price}
            unavailableLabel={t("token.valueUnavailable")}
            onRetry={refresh}
          />

          <View style={[styles.chartWrap, { opacity: dimChart ? 0.4 : 1 }]}>
            <Sparkline data={chart.data} up={chart.change >= 0} height={104} />
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

          {txs.length > 0 && (
            <>
              <View style={styles.spacer} />
              <RecentTransactions
                transactions={txs}
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
