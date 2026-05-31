import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import {
  Screen,
  ScreenHeader,
  AppText,
  Card,
  Row,
  IconButton,
  TxIcon,
  StatusPill,
  SectionLabel,
  EmptyState,
} from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { fmtUSD, fmtToken } from "@/utils/format";
import { TRANSACTIONS, type DemoTransaction, type TxType } from "@/features/wallet/data";

type Filter = "all" | TxType;

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 36,
        paddingHorizontal: 13,
        borderRadius: theme.radius.chip,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: on ? alpha(theme.colors.accent, 0.15) : theme.colors.surface2,
        borderWidth: 1,
        borderColor: on ? "transparent" : theme.colors.hairline,
      }}
    >
      <AppText weight="semibold" size={13.5} color={on ? theme.colors.accent : theme.colors.textMuted}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ActivityScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>("all");

  const verb: Record<TxType, string> = {
    receive: t("activity.verb.receive"),
    send: t("activity.verb.send"),
    swap: t("activity.verb.swap"),
  };

  const rows = TRANSACTIONS.filter((tx) => (filter === "all" ? true : tx.type === filter));
  const days = [...new Set(rows.map((tx) => tx.day))];

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: t("activity.filters.all") },
    { value: "receive", label: t("activity.filters.receive") },
    { value: "send", label: t("activity.filters.send") },
    { value: "swap", label: t("activity.filters.swap") },
  ];

  const renderRow = (tx: DemoTransaction, last: boolean) => {
    const incoming = tx.type === "receive";
    const amtColor =
      tx.status === "failed" ? theme.colors.textFaint : incoming ? theme.colors.pos : theme.colors.text;
    const prefix = incoming ? "+" : tx.type === "send" ? "−" : "";
    const partyLabel =
      tx.type === "swap" ? tx.party : `${incoming ? t("activity.from") : t("activity.to")}${tx.party}`;
    return (
      <Row
        key={tx.id}
        last={last}
        left={<TxIcon type={tx.type} />}
        title={`${verb[tx.type]} ${tx.token}`}
        sub={`${partyLabel}  ·  ${tx.when.split(" · ")[1] ?? ""}`}
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
  };

  return (
    <Screen>
      <ScreenHeader
        title={t("activity.title")}
        trailing={<IconButton name="search" size={20} accessibilityLabel="Search activity" />}
      />
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: theme.spacing.pad, paddingBottom: 4 }}>
        {filters.map((f) => (
          <Chip key={f.value} label={f.label} on={filter === f.value} onPress={() => setFilter(f.value)} />
        ))}
      </View>

      {rows.length === 0 ? (
        <EmptyState
          icon="activity"
          title={t("activity.empty.filteredTitle")}
          body={t("activity.empty.filteredBody")}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={{ paddingHorizontal: theme.spacing.pad, paddingTop: 8 }}>
            {days.map((day) => {
              const dayRows = rows.filter((tx) => tx.day === day);
              return (
                <View key={day} style={{ marginBottom: 6 }}>
                  <SectionLabel>{day}</SectionLabel>
                  <Card padding={0} style={{ paddingHorizontal: 16, marginBottom: 14 }}>
                    {dayRows.map((tx, i) => renderRow(tx, i === dayRows.length - 1))}
                  </Card>
                </View>
              );
            })}
            <View style={{ alignItems: "center", paddingVertical: 4 }}>
              <AppText size={13} faint>
                {t("activity.footer")}
              </AppText>
            </View>
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
