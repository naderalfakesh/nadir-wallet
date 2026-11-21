import React, { type ComponentRef, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Screen, Brandmark, AppText, Button, Icon, TestnetBadge } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { INTRO_STEPS, nextIntroIndex } from "../firstRun";

interface IntroScreenProps {
  onDone: () => void;
}

// No timers or auto-advance and no transition animation between steps, so it
// needs no reduced-motion branch and never holds anyone on a screen.
export function IntroScreen({ onDone }: IntroScreenProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const titleRef = useRef<ComponentRef<typeof View>>(null);
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
          <View style={styles.badge}>
            <Icon name={step.icon} size={54} stroke={1.7} color={theme.colors.accent} />
          </View>
        ) : (
          <Brandmark size={96} />
        )}
        <View ref={titleRef} accessible accessibilityRole="header">
          <AppText weight="bold" size={28} style={styles.title}>
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

      <View style={styles.footer}>
        <Button
          label={next !== null ? t("onboarding.intro.next") : t("onboarding.intro.start")}
          onPress={() => (next !== null ? setIndex(next) : onDone())}
        />
      </View>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    badge: {
      width: 100,
      height: 100,
      backgroundColor: theme.colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 30,
    },
    title: {
      marginTop: 24,
      letterSpacing: -0.5,
      textAlign: "center",
    },
    footer: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
      gap: 11,
    },
    introTopBar: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.pad,
    },
    introDots: {
      flexDirection: "row",
      gap: 6,
      paddingVertical: 8,
    },
    introDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.surface3,
    },
    introDotActive: {
      width: 22,
      backgroundColor: theme.colors.accent,
    },
    introSkip: {
      minHeight: 44,
      minWidth: 44,
      justifyContent: "center",
      alignItems: "flex-end",
    },
    // flexGrow (not flex) so large text scrolls instead of clipping.
    introBody: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.pad,
    },
    introText: {
      marginTop: 12,
      lineHeight: 23,
      textAlign: "center",
      maxWidth: 320,
    },
    introBadge: {
      marginTop: 20,
    },
  });
