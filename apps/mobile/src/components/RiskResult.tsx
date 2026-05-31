import React from "react";
import { View } from "react-native";
import { useTheme, alpha } from "@/theme";
import { AppText } from "./Text";
import { Icon, type IconName } from "./Icon";
import type { RiskLevel } from "@/types/status";

const TONE: Record<RiskLevel, { key: "pos" | "warn" | "neg"; icon: IconName }> = {
  low: { key: "pos", icon: "checkCircle" },
  medium: { key: "warn", icon: "alert" },
  high: { key: "neg", icon: "shield" },
};

interface RiskResultProps {
  level: RiskLevel;
  title: string;
  detail: string;
  // Short label for the "<level> RISK" pill, e.g. "low".
  levelLabel: string;
  compact?: boolean;
}

export function RiskResult({ level, title, detail, levelLabel, compact }: RiskResultProps) {
  const theme = useTheme();
  const tone = TONE[level];
  const c = theme.colors[tone.key];

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 11,
        padding: compact ? 12 : 13,
        borderRadius: 14,
        backgroundColor: alpha(c, 0.11),
        borderWidth: 1,
        borderColor: alpha(c, 0.28),
      }}
    >
      <Icon name={tone.icon} size={compact ? 18 : 20} color={c} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AppText weight="bold" size={compact ? 13 : 13.5} color={c}>
            {title}
          </AppText>
          <View style={{ backgroundColor: alpha(c, 0.16), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
            <AppText weight="bold" size={10.5} color={c} style={{ letterSpacing: 0.3 }}>
              {levelLabel.toUpperCase()} RISK
            </AppText>
          </View>
        </View>
        <AppText size={12.5} muted style={{ lineHeight: 18, marginTop: 3 }}>
          {detail}
        </AppText>
      </View>
    </View>
  );
}
