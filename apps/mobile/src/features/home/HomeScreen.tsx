import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  AppText,
  Card,
  Row,
  Icon,
  IconButton,
  TokenGlyph,
  TxIcon,
  ChangeBadge,
  StatusPill,
  TestnetBadge,
  SectionLabel,
  Segmented,
  Sparkline,
  PriceFreshness,
} from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { fmtUSD, fmtToken } from "@/utils/format";
import {
  ACCOUNT,
  TOKENS,
  TRANSACTIONS,
  SPARKLINE,
  RANGES,
  PORTFOLIO_TOTAL,
  PORTFOLIO_CHANGE_ABS,
  PORTFOLIO_CHANGE_PCT,
  chainBadgeColor,
  type Range,
  type DemoTransaction,
} from "@/features/wallet/data";

function QuickAction({
  icon,
  label,
  onPress,
  primary,
}: {
  icon: "receive" | "send" | "swap" | "trend";
  label: string;
  onPress?: () => void;
  primary?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: "center", gap: 8 }}>
      <View
        style={[
          {
            width: 58,
            height: 58,
            borderRadius: 19,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: primary ? theme.colors.accent : theme.colors.surface2,
            borderWidth: primary ? 0 : 1,
            borderColor: theme.colors.hairline,
          },
          primary && theme.shadows.accentGlow,
        ]}
      >
        <Icon
          name={icon}
          size={25}
          stroke={2.2}
          color={primary ? theme.colors.accentInk : theme.colors.text}
        />
      </View>
      <AppText weight="semibold" size={12.5} muted>
        {label}
      </AppText>
    </Pressable>
  );
}

export function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const [range, setRange] = useState<Range>("1W");
  const [hidden, setHidden] = useState(false);

  const recent = TRANSACTIONS.slice(0, 3);
  const verb: Record<DemoTransaction["type"], string> = {
    receive: t("activity.verb.receive"),
    send: t("activity.verb.send"),
    swap: t("activity.verb.swap"),
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        {/* account bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: theme.spacing.pad,
            paddingTop: 14,
            paddingBottom: 4,
          }}
        >
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 9,
              height: 42,
              paddingLeft: 7,
              paddingRight: 12,
              borderRadius: 99,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.hairline,
            }}
          >
            <View
              style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.accent }}
            />
            <AppText weight="bold" size={14.5}>
              {ACCOUNT.label}
            </AppText>
            <Icon name="chevronD" size={16} color={theme.colors.textMuted} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <IconButton
            name={hidden ? "eyeOff" : "eye"}
            onPress={() => setHidden((h) => !h)}
            accessibilityLabel={hidden ? "Show balances" : "Hide balances"}
          />
          <IconButton name="scan" accessibilityLabel="Scan QR code" />
        </View>

        {/* balance hero */}
        <View style={{ paddingHorizontal: theme.spacing.pad, paddingTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <AppText weight="semibold" size={13.5} muted>
              {t("home.totalBalance")}
            </AppText>
            <TestnetBadge label={t("common.testnet.badge")} />
          </View>
          <AppText weight="bold" size={44} tnum style={{ letterSpacing: -1.4 }}>
            {hidden ? "••••••" : fmtUSD(PORTFOLIO_TOTAL)}
          </AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 9, marginTop: 11 }}>
            <ChangeBadge pct={PORTFOLIO_CHANGE_PCT} />
            <AppText size={14} muted tnum>
              {hidden ? "••••" : fmtUSD(PORTFOLIO_CHANGE_ABS, { sign: true })} · {t("home.today")}
            </AppText>
          </View>
          <PriceFreshness status="fresh" />

          <View style={{ marginTop: 18, marginBottom: 12 }}>
            <Sparkline data={SPARKLINE} up={PORTFOLIO_CHANGE_PCT >= 0} height={92} />
          </View>
          <Segmented options={RANGES} value={range} onChange={setRange} small />
        </View>

        {/* quick actions */}
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            paddingHorizontal: theme.spacing.pad,
            paddingTop: 20,
            paddingBottom: 4,
          }}
        >
          <QuickAction icon="receive" label={t("common.actions.receive")} />
          <QuickAction icon="send" label={t("common.actions.send")} primary />
          <QuickAction icon="swap" label={t("common.actions.swap")} />
          <QuickAction icon="trend" label={t("common.actions.buy")} />
        </View>

        {/* backup reminder */}
        <View style={{ paddingHorizontal: theme.spacing.pad, paddingTop: 16 }}>
          <Card padding={15} style={{ backgroundColor: theme.colors.surface }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: theme.colors.surface2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="backup" size={22} color={theme.colors.warn} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText weight="bold" size={14.5}>
                  {t("home.backup.title")}
                </AppText>
                <AppText size={12.5} muted style={{ marginTop: 1 }}>
                  {t("home.backup.body")}
                </AppText>
              </View>
              <Icon name="chevronR" size={18} color={theme.colors.warn} />
            </View>
          </Card>
        </View>

        {/* tokens */}
        <View style={{ paddingHorizontal: theme.spacing.pad, paddingTop: 22, paddingBottom: 14 }}>
          <SectionLabel
            trailing={
              <AppText weight="semibold" size={13} color={theme.colors.accent}>
                {t("common.actions.manage")}
              </AppText>
            }
          >
            {t("home.tokens")}
          </SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            {TOKENS.map((token, i) => (
              <Row
                key={token.id}
                last={i === TOKENS.length - 1}
                left={
                  <TokenGlyph
                    symbol={token.symbol}
                    color={token.color}
                    chainColor={chainBadgeColor(token.chain)}
                  />
                }
                title={token.name}
                sub={<AppText size={13} muted tnum>{fmtToken(token.amount, token.symbol)}</AppText>}
                right={hidden ? "••••" : fmtUSD(token.value)}
                rightSub={<ChangeBadge pct={token.change} size={12} plain />}
              />
            ))}
          </Card>
        </View>

        {/* recent activity */}
        <View style={{ paddingHorizontal: theme.spacing.pad, paddingBottom: 14 }}>
          <SectionLabel
            trailing={
              <Pressable onPress={() => router.navigate("/activity")}>
                <AppText weight="semibold" size={13} color={theme.colors.accent}>
                  {t("common.actions.seeAll")}
                </AppText>
              </Pressable>
            }
          >
            {t("home.recentActivity")}
          </SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            {recent.map((tx, i) => {
              const incoming = tx.type === "receive";
              const amtColor =
                tx.status === "failed"
                  ? theme.colors.textFaint
                  : incoming
                    ? theme.colors.pos
                    : theme.colors.text;
              const prefix = incoming ? "+" : tx.type === "send" ? "−" : "";
              return (
                <Row
                  key={tx.id}
                  last={i === recent.length - 1}
                  left={<TxIcon type={tx.type} size={40} />}
                  title={`${verb[tx.type]} ${tx.token}`}
                  sub={tx.when.split(" · ")[1] ?? tx.when}
                  right={
                    <AppText
                      weight="semibold"
                      size={15.5}
                      tnum
                      color={amtColor}
                      style={tx.status === "failed" ? { textDecorationLine: "line-through" } : undefined}
                    >
                      {prefix}
                      {fmtToken(tx.amount, tx.token)}
                    </AppText>
                  }
                  rightSub={
                    tx.status !== "confirmed" ? (
                      <StatusPill status={tx.status} />
                    ) : (
                      <AppText size={13} muted tnum>{fmtUSD(tx.fiat)}</AppText>
                    )
                  }
                />
              );
            })}
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
