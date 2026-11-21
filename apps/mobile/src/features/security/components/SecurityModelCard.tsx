import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Card, Icon, type IconName } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { biometryIcon } from "@/services/auth/biometry";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

export function SecurityModelCard() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  const rows: { icon: IconName; title: string; body: string }[] = [
    { icon: "key", title: t("security.model.keysTitle"), body: t("security.model.keysBody") },
    {
      icon: biometryIcon(),
      title: t("security.model.signTitle"),
      body: t("security.model.signBody"),
    },
    {
      icon: "globe",
      title: t("security.model.backendTitle"),
      body: t("security.model.backendBody"),
    },
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

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    modelList: {
      gap: 13,
    },
    modelRow: {
      flexDirection: "row",
      gap: 12,
    },
    modelIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: theme.colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
    modelBody: {
      flex: 1,
    },
    modelText: {
      lineHeight: 18,
      marginTop: 2,
    },
  });
