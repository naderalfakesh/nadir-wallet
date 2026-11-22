import React from "react";
import { StyleSheet, View } from "react-native";
import { Screen, ScreenHeader, AppText, Button, Card, Icon, type IconName } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface IdentityStepProps {
  onBack: () => void;
  onStart: () => void;
  onSkip: () => void;
}

export function IdentityStep({ onBack, onStart, onSkip }: IdentityStepProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const points: { icon: IconName; title: string; body: string }[] = [
    {
      icon: "user",
      title: t("onboarding.identity.personTitle"),
      body: t("onboarding.identity.personBody"),
    },
    {
      icon: "device",
      title: t("onboarding.identity.deviceTitle"),
      body: t("onboarding.identity.deviceBody"),
    },
    {
      icon: "shield",
      title: t("onboarding.identity.privateTitle"),
      body: t("onboarding.identity.privateBody"),
    },
  ];

  return (
    <Screen>
      <ScreenHeader
        title={t("onboarding.identity.title")}
        subtitle={t("onboarding.identity.sub")}
        onBack={onBack}
      />
      <View style={styles.list}>
        {points.map((p) => (
          <Card key={p.title} padding={16}>
            <View style={styles.row}>
              <View style={styles.icon}>
                <Icon name={p.icon} size={22} color={theme.colors.accent} />
              </View>
              <View style={styles.body}>
                <AppText weight="bold" size={15.5}>
                  {p.title}
                </AppText>
                <AppText size={12.5} muted style={styles.text}>
                  {p.body}
                </AppText>
              </View>
            </View>
          </Card>
        ))}
        <View style={styles.spacer} />
        <Button label={t("onboarding.identity.start")} icon="faceid" onPress={onStart} />
        <Button
          label={t("onboarding.identity.skip")}
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
    list: {
      flex: 1,
      paddingHorizontal: theme.spacing.pad,
      gap: 12,
      paddingBottom: theme.spacing.pad,
    },
    row: {
      flexDirection: "row",
      gap: 13,
    },
    icon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: theme.colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      flex: 1,
    },
    text: {
      lineHeight: 19,
      marginTop: 3,
    },
    spacer: {
      flex: 1,
    },
  });
