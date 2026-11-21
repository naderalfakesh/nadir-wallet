import React from "react";
import { StyleSheet, View } from "react-native";
import { SheetHeader, AppText, Button, Icon, type IconName, TestnetBadge } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { biometryIcon } from "@/services/auth/biometry";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import type { SheetCloseProps } from "./types";

export function HowItWorksSheet({ close }: SheetCloseProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const points: { icon: IconName; title: string; body: string }[] = [
    {
      icon: "key",
      title: t("sheets.howItWorks.localTitle"),
      body: t("sheets.howItWorks.localBody"),
    },
    {
      icon: biometryIcon(),
      title: t("sheets.howItWorks.signTitle"),
      body: t("sheets.howItWorks.signBody"),
    },
    {
      icon: "globe",
      title: t("sheets.howItWorks.backendTitle"),
      body: t("sheets.howItWorks.backendBody"),
    },
    {
      icon: "info",
      title: t("sheets.howItWorks.testnetTitle"),
      body: t("sheets.howItWorks.testnetBody"),
    },
  ];
  return (
    <View>
      <SheetHeader
        title={t("sheets.howItWorks.title")}
        subtitle={t("sheets.howItWorks.sub")}
        onClose={close}
      />
      <View style={styles.badgeWrap}>
        <TestnetBadge label={t("sheets.howItWorks.badge")} />
      </View>
      <View style={styles.list}>
        {points.map((p) => (
          <View key={p.title} style={styles.card}>
            <View style={styles.iconBox}>
              <Icon name={p.icon} size={20} color={theme.colors.accent} />
            </View>
            <View style={styles.cardBody}>
              <AppText weight="bold" size={14.5}>
                {p.title}
              </AppText>
              <AppText size={12.5} muted style={styles.cardText}>
                {p.body}
              </AppText>
            </View>
          </View>
        ))}
      </View>
      <Button label={t("sheets.howItWorks.gotIt")} style={styles.gotIt} onPress={close} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    badgeWrap: {
      alignItems: "center",
      marginBottom: 16,
    },
    list: {
      gap: 12,
    },
    card: {
      flexDirection: "row",
      gap: 12,
      padding: 14,
      borderRadius: theme.radius.card,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: theme.colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: {
      flex: 1,
    },
    cardText: {
      lineHeight: 19,
      marginTop: 3,
    },
    gotIt: {
      marginTop: 16,
    },
  });
