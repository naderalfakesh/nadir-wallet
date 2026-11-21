import React from "react";
import { StyleSheet, View } from "react-native";
import { Screen, ScreenHeader, AppText, Button, Card, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, alpha, type Theme } from "@/theme";

interface BackupIntroProps {
  onBack: () => void;
  onShow: () => void;
}

export function BackupIntro({ onBack, onShow }: BackupIntroProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <Screen>
      <ScreenHeader title={t("onboarding.backup.title")} onBack={onBack} />
      <View style={styles.introBody}>
        <View style={styles.introCenter}>
          <View style={styles.introIcon}>
            <Icon name="backup" size={46} color={theme.colors.warn} />
          </View>
          <AppText weight="bold" size={25} style={styles.introTitle}>
            {t("onboarding.backup.introTitle")}
          </AppText>
          <AppText size={14.5} muted style={styles.introText}>
            {t("onboarding.backup.introBody")}
          </AppText>
        </View>
        <Card padding={14} style={styles.noteCard}>
          <View style={styles.noteRow}>
            <Icon name="info" size={19} color={theme.colors.accent} />
            <AppText size={12.5} muted style={styles.noteText}>
              {t("onboarding.backup.introNote")}
            </AppText>
          </View>
        </Card>
        <Button label={t("onboarding.backup.show")} onPress={onShow} />
      </View>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    introBody: {
      flex: 1,
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
    },
    introCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    introIcon: {
      width: 92,
      height: 92,
      borderRadius: 28,
      backgroundColor: alpha(theme.colors.warn, 0.16),
      alignItems: "center",
      justifyContent: "center",
    },
    introTitle: {
      marginTop: 22,
      letterSpacing: -0.4,
    },
    introText: {
      marginTop: 10,
      lineHeight: 23,
      textAlign: "center",
      maxWidth: 290,
    },
    noteCard: {
      marginBottom: 16,
    },
    noteRow: {
      flexDirection: "row",
      gap: 11,
    },
    noteText: {
      flex: 1,
      lineHeight: 18,
    },
  });
