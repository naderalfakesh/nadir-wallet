import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen, AppText, Button, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface BackupDoneProps {
  onDone: () => void;
}

export function BackupDone({ onDone }: BackupDoneProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(180)} style={styles.doneBody}>
        <View style={styles.doneIcon}>
          <Icon name="check" size={50} stroke={2.4} color={theme.colors.accent} />
        </View>
        <AppText weight="bold" size={25} style={styles.doneTitle}>
          {t("onboarding.backup.doneTitle")}
        </AppText>
        <AppText size={14.5} muted style={styles.doneText}>
          {t("onboarding.backup.doneBody")}
        </AppText>
      </Animated.View>
      <View style={styles.footer}>
        <Button label={t("common.actions.done")} onPress={onDone} />
      </View>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    doneBody: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.pad,
    },
    doneIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
    doneTitle: {
      marginTop: 22,
    },
    doneText: {
      marginTop: 10,
      lineHeight: 22,
      textAlign: "center",
      maxWidth: 260,
    },
    footer: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
    },
  });
