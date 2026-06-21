import React, { useMemo } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { AppText, Card, Icon, MiniIcon, Toggle, type IconName } from "@/components";
import { alpha, useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { DEVICE_CHECK_KEYS } from "./data";
import { RING_CIRCUMFERENCE, RING_RADIUS, RING_SIZE, RING_STROKE } from "./security.constants";
import { createSecurityStyles } from "./SecurityScreen.styles";
import type { SecurityTier } from "./security.types";

const RING_CENTER = RING_SIZE / 2;

interface ScoreCardProps {
  score: number;
  total: number;
  pct: number;
  tier: SecurityTier;
  backedUp: boolean;
}

export function ScoreCard({ score, total, pct, tier, backedUp }: ScoreCardProps) {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const styles = useMemo(() => createSecurityStyles(theme), [theme]);

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
            <Circle cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS} fill="none" stroke={colors.surface3} strokeWidth={RING_STROKE} />
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
            {backedUp ? t("security.score.protected") : t("security.score.finishBackup")}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

export function SecurityModelCard() {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const styles = useMemo(() => createSecurityStyles(theme), [theme]);

  const rows: { icon: IconName; title: string; body: string }[] = [
    { icon: "key", title: t("security.model.keysTitle"), body: t("security.model.keysBody") },
    { icon: "faceid", title: t("security.model.signTitle"), body: t("security.model.signBody") },
    { icon: "globe", title: t("security.model.backendTitle"), body: t("security.model.backendBody") },
  ];

  return (
    <Card padding={16}>
      <View style={styles.modelList}>
        {rows.map((r) => (
          <View key={r.title} style={styles.modelRow}>
            <View style={styles.modelIcon}>
              <Icon name={r.icon} size={19} color={colors.accent} />
            </View>
            <View style={styles.modelBody}>
              <AppText weight="bold" size={14}>
                {r.title}
              </AppText>
              <AppText size={12.5} muted style={styles.modelText}>
                {r.body}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function DeviceSecurityCard() {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const styles = useMemo(() => createSecurityStyles(theme), [theme]);

  return (
    <Card padding={16}>
      <View style={styles.cardRow}>
        <MiniIcon name="device" tone="pos" />
        <View style={styles.cardRowBody}>
          <AppText weight="bold" size={15}>
            {t("security.device.secure")}
          </AppText>
          <AppText size={12.5} muted style={styles.cardRowSub}>
            {t("security.device.lastChecked")}
          </AppText>
        </View>
      </View>
      <View style={styles.deviceChecks}>
        {DEVICE_CHECK_KEYS.map((key) => (
          <View key={key} style={styles.deviceCheck}>
            <Icon name="checkCircle" size={17} color={colors.pos} />
            <AppText size={12.5} muted>
              {t(`security.device.checks.${key}`)}
            </AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

interface TxProtectionCardProps {
  on: boolean;
  onToggle: () => void;
}

export function TxProtectionCard({ on, onToggle }: TxProtectionCardProps) {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();
  const styles = useMemo(() => createSecurityStyles(theme), [theme]);

  const riskLevels: { color: string; label: string; body: string }[] = [
    { color: colors.pos, label: t("security.txProtection.low"), body: t("security.txProtection.lowBody") },
    { color: colors.warn, label: t("security.txProtection.caution"), body: t("security.txProtection.cautionBody") },
    { color: colors.neg, label: t("security.txProtection.high"), body: t("security.txProtection.highBody") },
  ];

  return (
    <Card padding={16}>
      <View style={styles.cardRow}>
        <MiniIcon name="radar" tone="accent" />
        <View style={styles.cardRowBody}>
          <AppText weight="bold" size={15}>
            {t("security.txProtection.heading")}
          </AppText>
          <AppText size={12.5} muted style={styles.cardRowSub}>
            {t("security.txProtection.sub")}
          </AppText>
        </View>
        <Toggle on={on} onChange={onToggle} />
      </View>
      <View style={styles.riskDivider}>
        <AppText weight="bold" size={11.5} faint style={styles.riskHeading}>
          {t("security.txProtection.riskLevels")}
        </AppText>
        {riskLevels.map((r) => (
          <View key={r.label} style={styles.riskRow}>
            <View style={[styles.riskBadge, { backgroundColor: alpha(r.color, 0.14) }]}>
              <AppText weight="bold" size={11.5} color={r.color}>
                {r.label}
              </AppText>
            </View>
            <AppText size={12.5} muted style={styles.riskBody}>
              {r.body}
            </AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}
