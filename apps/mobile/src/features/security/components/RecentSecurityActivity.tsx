import React from "react";
import { StyleSheet } from "react-native";
import { Card } from "@/components";
import type { SecurityEvent } from "@/types/status";
import { eventWhen } from "../events";
import { latestEvents } from "../security.utils";
import { SecurityEventRow } from "./SecurityEventRow";

interface RecentSecurityActivityProps {
  events: SecurityEvent[];
  now: Date;
}

export function RecentSecurityActivity({ events, now }: RecentSecurityActivityProps) {
  const rows = latestEvents(events);

  return (
    <Card padding={0} style={styles.card}>
      {rows.map((ev, i) => (
        <SecurityEventRow
          key={ev.id}
          event={{ ...ev, when: eventWhen(ev, now) }}
          last={i === rows.length - 1}
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
