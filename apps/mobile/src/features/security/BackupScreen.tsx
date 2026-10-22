import React, { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, ScreenHeader, AppText, Button, Card, Icon } from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { DeviceAuthGate, type GateOutcome } from "@/features/auth/DeviceAuthGate";
import { useSensitiveReveal } from "@/features/auth/useSensitiveReveal";
import { revealMnemonic } from "@/services/storage/mnemonic";
import { SeedReveal, SeedVerify } from "@/features/onboarding/SeedComponents";
import { revealWhileCurrent } from "./revealPhrase";
import { useBlockScreenCapture } from "./useBlockScreenCapture";

type Step = "intro" | "auth" | "reveal" | "verify" | "done";

export function BackupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { setPref, logEvent } = useApp();
  const [step, setStep] = useState<Step>("intro");
  const [words, setWords] = useState<string[]>([]);
  const pad = theme.spacing.pad;

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
        <View style={{ flex: 1, paddingHorizontal: pad, paddingBottom: insets.bottom + pad }}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                width: 92,
                height: 92,
                borderRadius: 28,
                backgroundColor: alpha(theme.colors.warn, 0.16),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="backup" size={46} color={theme.colors.warn} />
            </View>
            <AppText weight="bold" size={25} style={{ marginTop: 22, letterSpacing: -0.4 }}>
              {t("onboarding.backup.introTitle")}
            </AppText>
            <AppText size={14.5} muted style={{ marginTop: 10, lineHeight: 23, textAlign: "center", maxWidth: 290 }}>
              {t("onboarding.backup.introBody")}
            </AppText>
          </View>
          <Card padding={14} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", gap: 11 }}>
              <Icon name="info" size={19} color={theme.colors.accent} />
              <AppText size={12.5} muted style={{ flex: 1, lineHeight: 18 }}>
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
        <ScreenHeader title={t("onboarding.reveal.title")} subtitle={t("onboarding.reveal.step")} onBack={restart} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: pad, paddingBottom: insets.bottom + pad }}>
          <SeedReveal words={words} onContinue={() => setStep("verify")} ctaLabel={t("onboarding.reveal.cta")} />
        </ScrollView>
      </Screen>
    );
  }

  if (step === "verify") {
    return (
      <Screen>
        <ScreenHeader title={t("onboarding.verify.title")} subtitle={t("onboarding.verify.step")} onBack={() => setStep("reveal")} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: pad, paddingBottom: insets.bottom + pad }}>
          <SeedVerify words={words} onContinue={confirmBackup} />
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: pad }}>
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: theme.colors.accentDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="check" size={50} stroke={2.4} color={theme.colors.accent} />
        </View>
        <AppText weight="bold" size={25} style={{ marginTop: 22 }}>
          {t("onboarding.backup.doneTitle")}
        </AppText>
        <AppText size={14.5} muted style={{ marginTop: 10, lineHeight: 22, textAlign: "center", maxWidth: 260 }}>
          {t("onboarding.backup.doneBody")}
        </AppText>
      </View>
      <View style={{ paddingHorizontal: pad, paddingBottom: insets.bottom + pad }}>
        <Button label={t("common.actions.done")} onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
