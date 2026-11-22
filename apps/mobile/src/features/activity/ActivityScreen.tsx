import React, { useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  Screen,
  ScreenHeader,
  AppText,
  Card,
  IconButton,
  SectionLabel,
  EmptyState,
} from "@/components";
import { BackendNotice } from "@/features/wallet/components/BackendNotice";
import { TransactionRow } from "@/features/wallet/components/TransactionRow";
import { getTransactionVerbs } from "@/features/wallet/transactions";
import { useTranslation } from "@/i18n/useTranslation";
import { useSheets } from "@/providers/SheetProvider";
import { useWallet } from "@/providers/WalletDataProvider";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import type { ActivityFilter, ActivityFilterOption } from "./activity.types";
import { filterTransactions, getActivityDays, searchTransactions } from "./activity.utils";
import { ActivitySearchField } from "./components/ActivitySearchField";
import { ActivitySubtitle } from "./components/ActivitySubtitle";
import { FilterChip } from "./components/FilterChip";

export function ActivityScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const sheets = useSheets();
  const { transactions, tokens, backend, refresh, loading } = useWallet();
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const verbs = useMemo(() => getTransactionVerbs(t), [t]);

  const toggleSearch = () => {
    setSearching((open) => !open);
    setQuery("");
  };

  const hasQuery = query.trim().length > 0;
  const rows = searchTransactions(filterTransactions(transactions, filter), query, {
    typeLabels: verbs,
    tokens,
  });
  const days = getActivityDays(rows);
  const filters: ActivityFilterOption[] = [
    { value: "all", label: t("activity.filters.all") },
    { value: "receive", label: t("activity.filters.receive") },
    { value: "send", label: t("activity.filters.send") },
    { value: "swap", label: t("activity.filters.swap") },
  ];

  return (
    <Screen bottomInset={false} avoidKeyboard>
      <ScreenHeader
        title={t("activity.title")}
        trailing={
          <IconButton
            name="search"
            size={20}
            accessibilityLabel={t("common.a11y.searchActivity")}
            color={searching ? theme.colors.accent : undefined}
            onPress={toggleSearch}
          />
        }
      />
      {searching && <ActivitySearchField value={query} onChangeText={setQuery} />}
      {backend !== "online" && (
        <View style={styles.notice}>
          <BackendNotice status={backend} onRetry={refresh} />
        </View>
      )}
      <View style={styles.filters}>
        {filters.map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            active={filter === f.value}
            onPress={() => setFilter(f.value)}
          />
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon="activity"
            title={
              hasQuery
                ? t("activity.empty.searchTitle", { query: query.trim() })
                : t("activity.empty.filteredTitle")
            }
            body={hasQuery ? t("activity.empty.searchBody") : t("activity.empty.filteredBody")}
          />
        ) : (
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
                        subtitle={<ActivitySubtitle tx={tx} />}
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
        )}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    notice: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: 4,
    },
    filters: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: 4,
    },
    list: {
      paddingBottom: 24,
    },
    listInner: {
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 8,
    },
    daySection: {
      marginBottom: 6,
    },
    dayCard: {
      paddingHorizontal: 16,
      marginBottom: 14,
    },
    footer: {
      alignItems: "center",
      paddingVertical: 4,
    },
  });
