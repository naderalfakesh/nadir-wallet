import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, alpha, type Theme } from "@/theme";
import { AppText } from "./Text";

interface TestnetBadgeProps {
  label?: string;
}

export function TestnetBadge({ label }: TestnetBadgeProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <AppText weight="bold" size={11.5} color={colors.warn} style={styles.label}>
        {label ?? t("common.testnet.badge")}
      </AppText>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      height: 24,
      paddingHorizontal: 9,
      borderRadius: 8,
      backgroundColor: alpha(theme.colors.warn, 0.14),
      borderWidth: 1,
      borderColor: alpha(theme.colors.warn, 0.3),
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.warn },
    label: { letterSpacing: 0.2 },
  });
