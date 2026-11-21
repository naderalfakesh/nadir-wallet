import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Card, MiniIcon, Toggle } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { alpha, useTheme, useThemedStyles, type Theme } from "@/theme";

interface TxProtectionCardProps {
  on: boolean;
  onToggle: () => void;
}

export function TxProtectionCard({ on, onToggle }: TxProtectionCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  const riskLevels: { color: string; label: string; body: string }[] = [
    {
      color: colors.pos,
      label: t("security.txProtection.low"),
      body: t("security.txProtection.lowBody"),
    },
    {
      color: colors.warn,
      label: t("security.txProtection.caution"),
      body: t("security.txProtection.cautionBody"),
    },
    {
      color: colors.neg,
      label: t("security.txProtection.high"),
      body: t("security.txProtection.highBody"),
    },
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
        <Toggle label={t("security.txProtection.heading")} on={on} onChange={onToggle} />
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
    },
    cardRowBody: {
      flex: 1,
    },
    cardRowSub: {
      marginTop: 1,
    },
    riskDivider: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.hairline,
      marginTop: 14,
      paddingTop: 14,
      gap: 9,
    },
    riskHeading: {
      letterSpacing: 0.3,
    },
    riskRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    riskBadge: {
      width: 64,
      paddingVertical: 3,
      borderRadius: 7,
      alignItems: "center",
    },
    riskBody: {
      flex: 1,
      lineHeight: 17,
    },
  });
