import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  ScreenHeader,
  AppText,
  Button,
  Card,
  Row,
  IconButton,
  TokenGlyph,
  TxIcon,
  ChangeBadge,
  SectionLabel,
  Segmented,
  Sparkline,
  BackendNotice,
  PriceFreshness,
} from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useDemoState } from "@/providers/DemoStateProvider";
import { useSheets } from "@/providers/SheetProvider";
import { fmtUSD, fmtToken } from "@/utils/format";
import { CHAINS, tokenById, TRANSACTIONS, SPARKLINE, RANGES, type Range, type TxType } from "@/features/wallet/data";

export function TokenDetailScreen({ id }: { id: string }) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { backend, price, retry } = useDemoState();
  const sheets = useSheets();
  const [range, setRange] = useState<Range>("1W");

  const token = tokenById(id);
  const chain = CHAINS[token.chain];
  const priceUnavail = price === "unavailable";
  const dimChart = backend === "rpc_unavailable" || priceUnavail;
  const txs = TRANSACTIONS.filter((x) => x.token === token.symbol).slice(0, 3);

  const verb: Record<TxType, string> = {
    receive: t("activity.verb.receive"),
    send: t("activity.verb.send"),
    swap: t("activity.verb.swap"),
  };

  return (
    <Screen>
      <ScreenHeader
        title={token.name}
        subtitle={chain.name}
        onBack={() => router.back()}
        trailing={<IconButton name="more" size={20} accessibilityLabel="More options" onPress={() => sheets.open("soon", { title: token.symbol })} />}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {backend !== "online" && (
          <View style={{ paddingHorizontal: theme.spacing.pad, paddingBottom: 4 }}>
            <BackendNotice status={backend} onRetry={retry} />
          </View>
        )}

        <View style={{ paddingHorizontal: theme.spacing.pad }}>
          <View style={{ alignItems: "center", paddingTop: 4 }}>
            <TokenGlyph symbol={token.symbol} color={token.color} size={64} />
            <AppText weight="bold" size={34} tnum style={{ marginTop: 14, letterSpacing: -1 }}>
              {fmtToken(token.amount, token.symbol)}
            </AppText>
            <AppText size={16} muted tnum style={{ marginTop: 4 }}>
              {priceUnavail ? t("token.valueUnavailable") : fmtUSD(token.value)}
            </AppText>
            {!priceUnavail && (
              <View style={{ marginTop: 10 }}>
                <ChangeBadge pct={token.change} />
              </View>
            )}
            <PriceFreshness status={price} onRetry={retry} />
          </View>

          <View style={{ marginTop: 20, marginBottom: 12, opacity: dimChart ? 0.4 : 1 }}>
            <Sparkline data={SPARKLINE} up={token.change >= 0} height={104} />
          </View>
          <Segmented options={RANGES} value={range} onChange={setRange} small />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
            <Button label={t("common.actions.receive")} icon="receive" variant="soft" style={{ flex: 1 }} onPress={() => sheets.open("receive", { token: token.symbol })} />
            <Button label={t("common.actions.send")} icon="send" style={{ flex: 1 }} height={52} onPress={() => router.push(`/send?token=${token.id}`)} />
          </View>

          <View style={{ height: 22 }} />
          <SectionLabel>{t("token.market")}</SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            <Row title={t("token.price")} right={priceUnavail ? "—" : fmtUSD(token.price, { cents: token.price < 10 })} />
            <Row title={t("token.change24")} right={priceUnavail ? <AppText faint size={15.5}>—</AppText> : <ChangeBadge pct={token.change} size={13} plain />} />
            <Row title={t("token.network")} right={chain.name} last />
          </Card>

          {txs.length > 0 && (
            <>
              <View style={{ height: 22 }} />
              <SectionLabel>{t("token.recent")}</SectionLabel>
              <Card padding={0} style={{ paddingHorizontal: 16 }}>
                {txs.map((x, i) => (
                  <Row
                    key={x.id}
                    last={i === txs.length - 1}
                    onPress={() => sheets.open("txDetail", { id: x.id })}
                    left={<TxIcon type={x.type} size={40} />}
                    title={`${verb[x.type]} ${x.token}`}
                    sub={x.when}
                    right={
                      <AppText weight="semibold" size={15.5} tnum color={x.type === "receive" ? theme.colors.pos : theme.colors.text}>
                        {x.type === "receive" ? "+" : "−"}
                        {fmtToken(x.amount, x.token)}
                      </AppText>
                    }
                  />
                ))}
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
