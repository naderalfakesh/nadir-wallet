import React from "react";
import { StyleSheet, View } from "react-native";
import { Screen, AppText, Button } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { StepBadge } from "./StepBadge";

interface ReadyStepProps {
  onOpen: () => void;
  saving: boolean;
  failed: boolean;
}

export function ReadyStep({ onOpen, saving, failed }: ReadyStepProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.center}>
        <StepBadge icon="check" radius={50} stroke={2.4} />
        <AppText weight="bold" size={28} style={styles.title}>
          {t("onboarding.ready.title")}
        </AppText>
        <AppText size={14.5} muted style={styles.body}>
          {t("onboarding.ready.body")}
        </AppText>
        {failed ? (
          <AppText
            size={13.5}
            weight="semibold"
            color={theme.colors.neg}
            style={styles.failure}
            accessibilityLiveRegion="polite"
          >
            {t("onboarding.ready.saveFailed")}
          </AppText>
        ) : null}
      </View>
      <View style={styles.footer}>
        <Button
          label={failed ? t("lock.tryAgain") : t("onboarding.ready.open")}
          onPress={onOpen}
          disabled={saving}
        />
      </View>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.pad,
    },
    title: {
      marginTop: 24,
      letterSpacing: -0.5,
    },
    body: {
      marginTop: 10,
      lineHeight: 22,
      textAlign: "center",
      maxWidth: 260,
    },
    failure: {
      marginTop: 10,
      lineHeight: 22,
      textAlign: "center",
      maxWidth: 280,
    },
    footer: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
      gap: 11,
    },
  });
