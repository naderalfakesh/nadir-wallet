import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Icon, type IconName } from "@/components";
import { alpha, useTheme, useThemedStyles, type Theme } from "@/theme";
import type { SecurityEvent } from "@/types/status";

const severityTone: Record<
  SecurityEvent["severity"],
  { key: "textMuted" | "pos" | "warn" | "neg"; icon: IconName }
> = {
  info: { key: "textMuted", icon: "clock" },
  success: { key: "pos", icon: "checkCircle" },
  warning: { key: "warn", icon: "alert" },
  critical: { key: "neg", icon: "shield" },
};

interface SecurityEventRowProps {
  event: SecurityEvent;
  last?: boolean;
}

export function SecurityEventRow({ event, last }: SecurityEventRowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const tone = severityTone[event.severity];
  const c = colors[tone.key];
  return (
    <View style={[styles.row, { borderBottomWidth: last ? 0 : 1 }]}>
      <View style={[styles.iconBox, { backgroundColor: alpha(c, 0.15) }]}>
        <Icon name={tone.icon} size={18} color={c} />
      </View>
      <View style={styles.body}>
        <AppText weight="semibold" size={14}>
          {event.title}
        </AppText>
        <AppText size={12} muted style={styles.detail}>
          {event.detail}
        </AppText>
      </View>
      <AppText faint size={11.5}>
        {event.when}
      </AppText>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      borderBottomColor: theme.colors.hairline,
    },
    iconBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      flex: 1,
      minWidth: 0,
    },
    detail: {
      marginTop: 1,
    },
  });
