import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen, ScreenHeader } from "@/components";
import { DeviceAuthGate } from "@/features/auth/components/DeviceAuthGate";
import { SeedReveal } from "@/features/onboarding/components/SeedReveal";
import { SeedVerify } from "@/features/onboarding/components/SeedVerify";
import { useTranslation } from "@/i18n/useTranslation";
import { useThemedStyles, type Theme } from "@/theme";
import { BackupDone } from "./components/BackupDone";
import { BackupIntro } from "./components/BackupIntro";
import { useBackupFlow } from "./useBackupFlow";
import { useBlockScreenCapture } from "./useBlockScreenCapture";

export function BackupScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { t } = useTranslation();
  const { step, setStep, words, restart, unlock, confirmBackup } = useBackupFlow();
  useBlockScreenCapture();

  if (step === "intro") {
    return <BackupIntro onBack={() => router.back()} onShow={() => setStep("auth")} />;
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

  return <BackupDone onDone={() => router.back()} />;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
    },
  });
