import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { AppText, Card } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme } from "@/theme";
import { RING_CIRCUMFERENCE, RING_RADIUS, RING_SIZE, RING_STROKE } from "../security.constants";
import type { SecurityTier } from "../security.types";

const RING_CENTER = RING_SIZE / 2;

interface ScoreCardProps {
  score: number;
  total: number;
  pct: number;
  tier: SecurityTier;
  backedUp: boolean;
}

export function ScoreCard({ score, total, pct, tier, backedUp }: ScoreCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const meta = {
    excellent: { color: colors.pos, label: t("security.score.excellent") },
    actionNeeded: { color: colors.warn, label: t("security.score.actionNeeded") },
    atRisk: { color: colors.neg, label: t("security.score.atRisk") },
  }[tier];

  return (
    <Card padding={20}>
      <View style={styles.scoreRow}>
        <View style={styles.ring}>
          <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
            <Circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={colors.surface3}
              strokeWidth={RING_STROKE}
            />
            <Circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={meta.color}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - pct)}
              rotation={-90}
              origin={`${RING_CENTER}, ${RING_CENTER}`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <AppText weight="bold" size={30} tnum>
              {score}
              <AppText size={16} faint>
                /{total}
              </AppText>
            </AppText>
          </View>
        </View>
        <View style={styles.scoreInfo}>
          <AppText weight="semibold" size={12.5} muted>
            {t("security.score.label")}
          </AppText>
          <AppText weight="bold" size={21} color={meta.color} style={styles.scoreTier}>
            {meta.label}
          </AppText>
          <AppText size={13} muted style={styles.scoreBody}>
            {!backedUp
              ? t("security.score.finishBackup")
              : t("security.score.active", { score, total })}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  ringCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTier: {
    marginVertical: 2,
  },
  scoreBody: {
    lineHeight: 18,
  },
});
