import React from "react";
import { StyleSheet, View } from "react-native";
import { Screen, AppText, Button } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { biometryIcon } from "@/services/auth/biometry";
import { useThemedStyles, type Theme } from "@/theme";
import { StepBadge } from "./StepBadge";

interface BiometricStepProps {
  onEnable: () => void;
  onSkip: () => void;
}

export function BiometricStep({ onEnable, onSkip }: BiometricStepProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.center}>
        <StepBadge icon={biometryIcon()} radius={30} stroke={1.7} />
        <AppText weight="bold" size={26} style={styles.title}>
          {t("onboarding.biometric.title")}
        </AppText>
        <AppText size={14.5} muted style={styles.body}>
          {t("onboarding.biometric.body")}
        </AppText>
      </View>
      <View style={styles.footer}>
        <Button label={t("onboarding.biometric.enable")} icon={biometryIcon()} onPress={onEnable} />
        <Button
          label={t("onboarding.biometric.later")}
          variant="ghost"
          onPress={onSkip}
          height={50}
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
      letterSpacing: -0.4,
    },
    body: {
      marginTop: 10,
      lineHeight: 22,
      textAlign: "center",
      maxWidth: 270,
    },
    footer: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
      gap: 11,
    },
  });
