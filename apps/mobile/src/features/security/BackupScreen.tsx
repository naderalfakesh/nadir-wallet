import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, ScreenHeader, AppText, Button, Card, Icon } from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { SeedReveal, SeedVerify } from "@/features/onboarding/SeedComponents";
import { DEMO_RECOVERY_PHRASE } from "@/features/onboarding/data";

type Step = "intro" | "reveal" | "verify" | "done";

export function BackupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("intro");
  const pad = theme.spacing.pad;

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
          <Button label={t("onboarding.backup.show")} onPress={() => setStep("reveal")} />
        </View>
      </Screen>
    );
  }

  if (step === "reveal") {
    return (
      <Screen>
        <ScreenHeader title={t("onboarding.reveal.title")} subtitle={t("onboarding.reveal.step")} onBack={() => setStep("intro")} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: pad, paddingBottom: insets.bottom + pad }}>
          <SeedReveal words={DEMO_RECOVERY_PHRASE} onContinue={() => setStep("verify")} ctaLabel={t("onboarding.reveal.cta")} />
        </ScrollView>
      </Screen>
    );
  }

  if (step === "verify") {
    return (
      <Screen>
        <ScreenHeader title={t("onboarding.verify.title")} subtitle={t("onboarding.verify.step")} onBack={() => setStep("reveal")} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: pad, paddingBottom: insets.bottom + pad }}>
          <SeedVerify words={DEMO_RECOVERY_PHRASE} onContinue={() => setStep("done")} />
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
