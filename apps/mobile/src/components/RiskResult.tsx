import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, alpha } from "@/theme";
import type { RiskLevel } from "@/types/status";
import { Icon, type IconName } from "./Icon";
import { AppText } from "./Text";

const TONE: Record<RiskLevel, { key: "pos" | "warn" | "neg"; icon: IconName }> = {
  low: { key: "pos", icon: "checkCircle" },
  medium: { key: "warn", icon: "alert" },
  high: { key: "neg", icon: "shield" },
};

interface RiskResultProps {
  level: RiskLevel;
  title: string;
  detail: string;
  levelLabel: string;
  compact?: boolean;
}

export function RiskResult({ level, title, detail, levelLabel, compact }: RiskResultProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const tone = TONE[level];
  const c = theme.colors[tone.key];

  return (
    <View
      style={[
        styles.container,
        {
          padding: compact ? 12 : 13,
          backgroundColor: alpha(c, 0.11),
          borderColor: alpha(c, 0.28),
        },
      ]}
    >
      <Icon name={tone.icon} size={compact ? 18 : 20} color={c} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText weight="bold" size={compact ? 13 : 13.5} color={c}>
            {title}
          </AppText>
          <View style={[styles.levelPill, { backgroundColor: alpha(c, 0.16) }]}>
            <AppText weight="bold" size={10.5} color={c} style={styles.levelLabel}>
              {t("status.riskPill", { level: levelLabel.toUpperCase() })}
            </AppText>
          </View>
        </View>
        <AppText size={12.5} muted style={styles.detail}>
          {detail}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  body: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  levelPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  levelLabel: { letterSpacing: 0.3 },
  detail: { lineHeight: 18, marginTop: 3 },
});
