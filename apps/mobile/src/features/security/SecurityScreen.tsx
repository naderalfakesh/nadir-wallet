import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen, ScreenHeader, SectionLabel } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp, useSecurityEvents } from "@/providers/AppProvider";
import { useThemedStyles, type Theme } from "@/theme";
import { RecentSecurityActivity } from "./components/RecentSecurityActivity";
import { ScoreCard } from "./components/ScoreCard";
import { SecurityRowCard } from "./components/SecurityRowCard";
import { useSecurityChecklist } from "./useSecurityChecklist";

export function SecurityScreen() {
  const { t } = useTranslation();
  const { prefs } = useApp();
  const events = useSecurityEvents();
  // Re-read the clock whenever the tab gains focus so "Today" rolls over.
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(useCallback(() => setNow(new Date()), []));
  const styles = useThemedStyles(createStyles);

  const { protectionRows, transactionRows, score, total, pct, tier } = useSecurityChecklist();

  return (
    <Screen bottomInset={false}>
      <ScreenHeader title={t("security.title")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.scoreWrap}>
          <ScoreCard
            score={score}
            total={total}
            pct={pct}
            tier={tier}
            backedUp={prefs.backupConfirmed}
          />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.protection.title")}</SectionLabel>
          <SecurityRowCard rows={protectionRows} />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.transactions.title")}</SectionLabel>
          <SecurityRowCard rows={transactionRows} />
        </View>

        <View style={styles.section}>
          <SectionLabel>{t("security.events.title")}</SectionLabel>
          <RecentSecurityActivity events={events} now={now} />
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
    scoreWrap: {
      paddingHorizontal: theme.spacing.pad,
    },
    section: {
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 18,
    },
  });
