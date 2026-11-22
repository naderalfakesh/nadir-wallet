import React from "react";
import { StyleSheet } from "react-native";
import { Card, MiniIcon, Row, Toggle } from "@/components";
import type { SecurityRowModel } from "../security.types";

interface SecurityRowCardProps {
  rows: SecurityRowModel[];
}

export function SecurityRowCard({ rows }: SecurityRowCardProps) {
  return (
    <Card padding={0} style={styles.card}>
      {rows.map((row, i) => (
        <Row
          key={row.key}
          last={i === rows.length - 1}
          onPress={row.onPress}
          left={<MiniIcon name={row.icon} tone={row.tone} />}
          title={row.label}
          sub={row.sub || undefined}
          right={
            row.toggle ? (
              <Toggle label={row.label} on={row.toggle.on} onChange={row.toggle.onChange} />
            ) : undefined
          }
          chevron={!!row.onPress}
        />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
  },
});
