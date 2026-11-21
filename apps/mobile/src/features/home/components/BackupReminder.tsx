import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Card, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface BackupReminderProps {
  onPress: () => void;
}

export function BackupReminder({ onPress }: BackupReminderProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.backupWrap}>
      <Card padding={15} style={styles.backupCard} onPress={onPress}>
        <View style={styles.backupRow}>
          <View style={styles.backupIcon}>
            <Icon name="backup" size={22} color={theme.colors.warn} />
          </View>
          <View style={styles.backupBody}>
            <AppText weight="bold" size={14.5}>
              {t("home.backup.title")}
            </AppText>
            <AppText size={12.5} muted style={styles.backupText}>
              {t("home.backup.body")}
            </AppText>
          </View>
          <Icon name="chevronR" size={18} color={theme.colors.warn} />
        </View>
      </Card>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backupWrap: {
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 16,
    },
    backupCard: {
      backgroundColor: theme.colors.surface,
    },
    backupRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
    },
    backupIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    backupBody: {
      flex: 1,
    },
    backupText: {
      marginTop: 1,
    },
  });
