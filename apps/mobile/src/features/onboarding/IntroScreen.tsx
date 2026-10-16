import React, { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, findNodeHandle, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, Brandmark, AppText, Button, Icon, TestnetBadge } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { createOnboardingStyles } from "./OnboardingFlow.styles";
import { INTRO_STEPS, nextIntroIndex } from "./firstRun";

// No timers or auto-advance and no transition animation between steps, so it
// needs no reduced-motion branch and never holds anyone on a screen.
export function IntroScreen({ onDone }: { onDone: () => void }) {
  const theme = useTheme();
  const styles = useMemo(() => createOnboardingStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const titleRef = useRef<View>(null);
  const step = INTRO_STEPS[index];
  const next = nextIntroIndex(index);

  // Each step swaps content in place, so move screen-reader focus to the new title.
  useEffect(() => {
    if (index === 0) return;
    const node = findNodeHandle(titleRef.current);
    if (node) AccessibilityInfo.setAccessibilityFocus(node);
  }, [index]);

  const progress = t("onboarding.intro.progress", { n: index + 1, total: INTRO_STEPS.length });

  return (
    <Screen>
      <View style={styles.introTopBar}>
        <View style={styles.introDots} accessible accessibilityLabel={progress}>
          {INTRO_STEPS.map((s, i) => (
            <View key={s.id} style={[styles.introDot, i === index && styles.introDotActive]} />
          ))}
        </View>
        {next !== null ? (
          <Pressable
            onPress={onDone}
            accessibilityRole="button"
            accessibilityHint={t("onboarding.intro.skipHint")}
            hitSlop={8}
            style={styles.introSkip}
          >
            <AppText weight="semibold" size={15} muted>
              {t("onboarding.intro.skip")}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.introBody}>
        {step.icon ? (
          <View style={[styles.badge, { borderRadius: 30 }]}>
            <Icon name={step.icon} size={54} stroke={1.7} color={theme.colors.accent} />
          </View>
        ) : (
          <Brandmark size={96} />
        )}
        <View ref={titleRef} accessible accessibilityRole="header">
          <AppText weight="bold" size={28} style={[styles.heroTitleLarge, { textAlign: "center" }]}>
            {t(`onboarding.intro.${step.id}.title`)}
          </AppText>
        </View>
        <AppText size={15.5} muted style={styles.introText}>
          {t(`onboarding.intro.${step.id}.body`)}
        </AppText>
        {index === 0 ? (
          <View style={styles.introBadge}>
            <TestnetBadge label={t("onboarding.welcome.badge")} />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.pad }]}>
        <Button
          label={next !== null ? t("onboarding.intro.next") : t("onboarding.intro.start")}
          onPress={() => (next !== null ? setIndex(next) : onDone())}
        />
      </View>
    </Screen>
  );
}
