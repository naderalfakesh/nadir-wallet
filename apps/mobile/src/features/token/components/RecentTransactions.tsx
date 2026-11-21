import React from "react";
import { StyleSheet } from "react-native";
import { Card, SectionLabel } from "@/components";
import { TransactionRow } from "@/features/wallet/components/TransactionRow";
import type { PortfolioTransaction } from "@/features/wallet/types";
import { useTranslation } from "@/i18n/useTranslation";

interface RecentTransactionsProps {
  transactions: PortfolioTransaction[];
  onTransactionPress: (id: string) => void;
}

export function RecentTransactions({ transactions, onTransactionPress }: RecentTransactionsProps) {
  const { t } = useTranslation();

  return (
    <>
      <SectionLabel>{t("token.recent")}</SectionLabel>
      <Card padding={0} style={styles.cardInset}>
        {transactions.map((tx, index) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            subtitle={tx.when}
            iconSize={40}
            showValue={false}
            last={index === transactions.length - 1}
            onPress={() => onTransactionPress(tx.id)}
          />
        ))}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  cardInset: {
    paddingHorizontal: 16,
  },
});
