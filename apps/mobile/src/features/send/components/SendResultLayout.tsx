import React from "react";
import { StyleSheet, View } from "react-native";
import { Screen, AppText } from "@/components";
import { useThemedStyles, type Theme } from "@/theme";

interface SendResultLayoutProps {
  badgeColor: string;
  icon: React.ReactNode;
  title: string;
  /** Top margin of the title, below the badge. */
  titleGap: number;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function SendResultLayout({
  badgeColor,
  icon,
  title,
  titleGap,
  children,
  footer,
}: SendResultLayoutProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <Screen>
      <View style={styles.centered}>
        <View style={[styles.resultBadge, { backgroundColor: badgeColor }]}>{icon}</View>
        <AppText weight="bold" size={23} style={{ marginTop: titleGap }}>
          {title}
        </AppText>
        {children}
      </View>
      <View style={styles.footer}>{footer}</View>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.pad,
    },
    resultBadge: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    footer: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
      gap: 10,
    },
  });
