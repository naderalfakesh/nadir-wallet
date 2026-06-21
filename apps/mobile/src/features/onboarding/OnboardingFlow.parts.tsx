import React, { useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, ScreenHeader, AppText, Button, Card, Icon, type IconName } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { createOnboardingStyles } from "./OnboardingFlow.styles";

function StepBadge({ icon, radius, stroke }: { icon: IconName; radius: number; stroke: number }) {
  const theme = useTheme();
  const styles = useMemo(() => createOnboardingStyles(theme), [theme]);
  return (
    <View style={[styles.badge, { borderRadius: radius }]}>
      <Icon name={icon} size={54} stroke={stroke} color={theme.colors.accent} />
    </View>
  );
}

export function ExplainStep({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const theme = useTheme();
  const styles = useMemo(() => createOnboardingStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const points: { icon: IconName; title: string; body: string }[] = [
    { icon: "key", title: t("onboarding.explain.keysTitle"), body: t("onboarding.explain.keysBody") },
    { icon: "backup", title: t("onboarding.explain.phraseTitle"), body: t("onboarding.explain.phraseBody") },
    { icon: "shield", title: t("onboarding.explain.recoverTitle"), body: t("onboarding.explain.recoverBody") },
  ];

  return (
    <Screen>
      <ScreenHeader title={t("onboarding.explain.title")} subtitle={t("onboarding.explain.sub")} onBack={onBack} />
      <View style={[styles.explainList, { paddingBottom: insets.bottom + theme.spacing.pad }]}>
        {points.map((p) => (
          <Card key={p.title} padding={16}>
            <View style={styles.explainRow}>
              <View style={styles.explainIcon}>
                <Icon name={p.icon} size={22} color={theme.colors.accent} />
              </View>
              <View style={styles.explainBody}>
                <AppText weight="bold" size={15.5}>
                  {p.title}
                </AppText>
                <AppText size={12.5} muted style={styles.explainText}>
                  {p.body}
                </AppText>
              </View>
            </View>
          </Card>
        ))}
        <View style={styles.spacer} />
        <Button label={t("onboarding.explain.continue")} onPress={onContinue} />
      </View>
    </Screen>
  );
}

export function BiometricStep({ onEnable, onSkip }: { onEnable: () => void; onSkip: () => void }) {
  const theme = useTheme();
  const styles = useMemo(() => createOnboardingStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.centerStep}>
        <StepBadge icon="faceid" radius={30} stroke={1.7} />
        <AppText weight="bold" size={26} style={styles.heroTitle}>
          {t("onboarding.biometric.title")}
        </AppText>
        <AppText size={14.5} muted style={[styles.heroBody, { maxWidth: 270 }]}>
          {t("onboarding.biometric.body")}
        </AppText>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.pad }]}>
        <Button label={t("onboarding.biometric.enable")} icon="faceid" onPress={onEnable} />
        <Button label={t("onboarding.biometric.later")} variant="ghost" onPress={onSkip} height={50} />
      </View>
    </Screen>
  );
}

export function ReadyStep({ onOpen }: { onOpen: () => void }) {
  const theme = useTheme();
  const styles = useMemo(() => createOnboardingStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.centerStep}>
        <StepBadge icon="check" radius={50} stroke={2.4} />
        <AppText weight="bold" size={28} style={styles.heroTitleLarge}>
          {t("onboarding.ready.title")}
        </AppText>
        <AppText size={14.5} muted style={[styles.heroBody, { maxWidth: 260 }]}>
          {t("onboarding.ready.body")}
        </AppText>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.pad }]}>
        <Button label={t("onboarding.ready.open")} onPress={onOpen} />
      </View>
    </Screen>
  );
}
