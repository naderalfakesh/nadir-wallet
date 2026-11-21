import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { Screen, ScreenHeader, AppText, Button, Card, Icon } from "@/components";
import { DeviceAuthGate, type GateOutcome } from "@/features/auth/components/DeviceAuthGate";
import { useSensitiveReveal } from "@/features/auth/useSensitiveReveal";
import { SeedReveal } from "@/features/onboarding/components/SeedReveal";
import { SeedVerify } from "@/features/onboarding/components/SeedVerify";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { revealMnemonic } from "@/services/storage/mnemonic";
import { useTheme, useThemedStyles, alpha, type Theme } from "@/theme";
import { revealWhileCurrent } from "./revealPhrase";
import { useBlockScreenCapture } from "./useBlockScreenCapture";

type Step = "intro" | "auth" | "reveal" | "verify" | "done";

export function BackupScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { t } = useTranslation();
  const { setPref, logEvent } = useApp();
  const [step, setStep] = useState<Step>("intro");
  const [words, setWords] = useState<string[]>([]);

  // Leaving the reveal/verify steps (back, background, done) drops the words,
  // so seeing them again needs a fresh OS prompt.
  const clear = useCallback(() => {
    setWords([]);
    setStep((prev) => (prev === "done" ? prev : "intro"));
  }, []);
  const guard = useSensitiveReveal(clear);
  useBlockScreenCapture();
  const restart = () => {
    guard.invalidate();
    clear();
  };

  const unlock = useCallback(
    (): Promise<GateOutcome> =>
      revealWhileCurrent(
        guard,
        () => revealMnemonic(t("onboarding.backup.revealPrompt")),
        (revealed) => {
          setWords(revealed);
          setStep("reveal");
        },
      ),
    [guard, t],
  );

  const confirmBackup = () => {
    setPref("backupConfirmed", true);
    logEvent("backup");
    setWords([]);
    setStep("done");
  };

  if (step === "intro") {
    return (
      <Screen>
        <ScreenHeader title={t("onboarding.backup.title")} onBack={() => router.back()} />
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
          <Button label={t("onboarding.backup.show")} onPress={() => setStep("auth")} />
        </View>
      </Screen>
    );
  }

  if (step === "auth") {
    return (
      <Screen>
        <ScreenHeader title={t("onboarding.backup.revealTitle")} onBack={restart} />
        <DeviceAuthGate
          title={t("onboarding.backup.verifyIt")}
          subtitle={t("onboarding.backup.revealGate")}
          authenticate={unlock}
        />
      </Screen>
    );
  }

  if (step === "reveal") {
    return (
      <Screen>
        <ScreenHeader
          title={t("onboarding.reveal.title")}
          subtitle={t("onboarding.reveal.step")}
          onBack={restart}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SeedReveal
            words={words}
            onContinue={() => setStep("verify")}
            ctaLabel={t("onboarding.reveal.cta")}
          />
        </ScrollView>
      </Screen>
    );
  }

  if (step === "verify") {
    return (
      <Screen>
        <ScreenHeader
          title={t("onboarding.verify.title")}
          subtitle={t("onboarding.verify.step")}
          onBack={() => setStep("reveal")}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SeedVerify words={words} onContinue={confirmBackup} />
        </ScrollView>
      </Screen>
    );
  }

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
        <Button label={t("common.actions.done")} onPress={() => router.back()} />
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
    scrollContent: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
    },
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
