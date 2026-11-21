import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Card, SectionLabel } from "@/components";
import { TransactionRow } from "@/features/wallet/components/TransactionRow";
import type { PortfolioTransaction } from "@/features/wallet/data";
import { getTransactionTime } from "@/features/wallet/transactions";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface RecentActivityProps {
  transactions: PortfolioTransaction[];
  onSeeAll: () => void;
  onTransactionPress: (id: string) => void;
}

export function RecentActivity({
  transactions,
  onSeeAll,
  onTransactionPress,
}: RecentActivityProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <SectionLabel
        trailing={
          <Pressable onPress={onSeeAll} style={styles.seeAll}>
            <AppText weight="semibold" size={13} color={theme.colors.accent}>
              {t("common.actions.seeAll")}
            </AppText>
          </Pressable>
        }
      >
        {t("home.recentActivity")}
      </SectionLabel>
      <Card padding={0} style={styles.cardInset}>
        {transactions.map((tx, index) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            subtitle={getTransactionTime(tx)}
            last={index === transactions.length - 1}
            onPress={() => onTransactionPress(tx.id)}
          />
        ))}
      </Card>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    section: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: 14,
    },
    cardInset: {
      paddingHorizontal: 16,
    },
    seeAll: {
      paddingVertical: 4,
      paddingLeft: 8,
    },
  });
