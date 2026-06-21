import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  ScreenHeader,
  Button,
  IconButton,
  SectionLabel,
  Segmented,
  Sparkline,
  BackendNotice,
} from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useWallet } from "@/providers/WalletDataProvider";
import { useSheets } from "@/providers/SheetProvider";
import { CHAINS, tokenById, SPARKLINE, RANGES, type Range } from "@/features/wallet/data";
import { createTokenDetailStyles } from "./TokenDetailScreen.styles";
import { MarketCard, RecentTransactions, TokenHero } from "./TokenDetailScreen.parts";

export function TokenDetailScreen({ id }: { id: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createTokenDetailStyles(theme), [theme]);
  const router = useRouter();
  const { t } = useTranslation();
  const { tokens, transactions, backend, price, refresh } = useWallet();
  const sheets = useSheets();
  const [range, setRange] = useState<Range>("1W");

  const token = tokens.find((x) => x.id === id) ?? tokenById(id);
  const chain = CHAINS[token.chain];
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
            accessibilityLabel="More options"
            onPress={() => sheets.open("soon", { title: token.symbol })}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {backend !== "online" && (
          <View style={styles.notice}>
            <BackendNotice status={backend} onRetry={refresh} />
          </View>
        )}

        <View style={styles.body}>
          <TokenHero
            token={token}
            priceUnavailable={priceUnavailable}
            priceStatus={price}
            unavailableLabel={t("token.valueUnavailable")}
            onRetry={refresh}
          />

          <View style={[styles.chartWrap, { opacity: dimChart ? 0.4 : 1 }]}>
            <Sparkline data={SPARKLINE} up={token.change >= 0} height={104} />
          </View>
          <Segmented options={RANGES} value={range} onChange={setRange} small />

          <View style={styles.actions}>
            <Button
              label={t("common.actions.receive")}
              icon="receive"
              variant="soft"
              style={styles.actionButton}
              onPress={() => sheets.open("receive", { token: token.symbol })}
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
              <RecentTransactions transactions={txs} onTransactionPress={(txId) => sheets.open("txDetail", { id: txId })} />
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
