import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, SectionLabel } from "@/components";
import { TransactionRow } from "@/features/wallet/components/TransactionRow";
import type { ActivityDayGroup } from "../activity.types";
import { ActivitySubtitle } from "./ActivitySubtitle";

interface ActivityDaySectionProps {
  group: ActivityDayGroup;
  onSelectTransaction: (id: string) => void;
}

export function ActivityDaySection({ group, onSelectTransaction }: ActivityDaySectionProps) {
  return (
    <View style={styles.section}>
      <SectionLabel>{group.day}</SectionLabel>
      <Card padding={0} style={styles.card}>
        {group.transactions.map((tx, index) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            subtitle={<ActivitySubtitle tx={tx} />}
            last={index === group.transactions.length - 1}
            onPress={() => onSelectTransaction(tx.id)}
          />
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 6,
  },
  card: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
});
