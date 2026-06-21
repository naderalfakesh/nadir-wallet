import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import {
  Screen,
  ScreenHeader,
  AppText,
  Card,
  IconButton,
  SectionLabel,
  EmptyState,
  BackendNotice,
} from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useSheets } from "@/providers/SheetProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { TransactionRow } from "@/features/wallet/TransactionRow";
import { createActivityStyles } from "./ActivityScreen.styles";
import { FilterChip } from "./ActivityScreen.parts";
import { filterTransactions, getActivityDays, getActivitySubtitle } from "./activity.utils";
import type { ActivityFilter, ActivityFilterOption } from "./activity.types";

export function ActivityScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createActivityStyles(theme), [theme]);
  const { t } = useTranslation();
  const sheets = useSheets();
  const { transactions, backend, refresh } = useWallet();
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const rows = filterTransactions(transactions, filter);
  const days = getActivityDays(rows);
  const filters: ActivityFilterOption[] = [
    { value: "all", label: t("activity.filters.all") },
    { value: "receive", label: t("activity.filters.receive") },
    { value: "send", label: t("activity.filters.send") },
    { value: "swap", label: t("activity.filters.swap") },
  ];

  return (
    <Screen>
      <ScreenHeader
        title={t("activity.title")}
        trailing={
          <IconButton
            name="search"
            size={20}
            accessibilityLabel="Search activity"
            onPress={() => sheets.open("soon", { title: "Search activity" })}
          />
        }
      />
      {backend !== "online" && (
        <View style={styles.notice}>
          <BackendNotice status={backend} onRetry={refresh} />
        </View>
      )}
      <View style={styles.filters}>
        {filters.map((f) => (
          <FilterChip key={f.value} label={f.label} active={filter === f.value} onPress={() => setFilter(f.value)} />
        ))}
      </View>

      {rows.length === 0 ? (
        <EmptyState
          icon="activity"
          title={t("activity.empty.filteredTitle")}
          body={t("activity.empty.filteredBody")}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <View style={styles.listInner}>
            {days.map((day) => {
              const dayRows = rows.filter((tx) => tx.day === day);
              return (
                <View key={day} style={styles.daySection}>
                  <SectionLabel>{day}</SectionLabel>
                  <Card padding={0} style={styles.dayCard}>
                    {dayRows.map((tx, i) => (
                      <TransactionRow
                        key={tx.id}
                        tx={tx}
                        subtitle={getActivitySubtitle(tx, t)}
                        last={i === dayRows.length - 1}
                        onPress={() => sheets.open("txDetail", { id: tx.id })}
                      />
                    ))}
                  </Card>
                </View>
              );
            })}
            <View style={styles.footer}>
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
