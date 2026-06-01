import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, ScreenHeader, AppText, Button, Card, Icon, type IconName } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { generateMnemonic } from "@nadir-wallet/crypto-core";
import { WelcomeScreen } from "./WelcomeScreen";
import { ImportScreen } from "./ImportScreen";
import { CreatePasscode } from "./CreatePasscode";
import { SeedReveal, SeedVerify } from "./SeedComponents";

type Step = "welcome" | "explain" | "reveal" | "verify" | "import" | "passcode" | "biometric" | "ready";

export function OnboardingFlow() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { setPref, setPasscode, logEvent, createWallet } = useApp();
  const [step, setStep] = useState<Step>("welcome");
  const [viaImport, setViaImport] = useState(false);
  // The fresh/imported phrase lives only in memory until the user confirms.
  const [mnemonic, setMnemonic] = useState("");
  const words = mnemonic ? mnemonic.split(" ") : [];

  const finish = async () => {
    await createWallet(mnemonic, { imported: viaImport });
    router.replace("/home");
  };
  const pad = theme.spacing.pad;

  if (step === "welcome") {
    return (
      <WelcomeScreen
        onCreate={() => {
          setViaImport(false);
          setMnemonic(generateMnemonic());
          setStep("explain");
        }}
        onImport={() => {
          setViaImport(true);
          setStep("import");
        }}
      />
    );
  }

  if (step === "explain") {
    const points: { icon: IconName; title: string; body: string }[] = [
      { icon: "key", title: t("onboarding.explain.keysTitle"), body: t("onboarding.explain.keysBody") },
      { icon: "backup", title: t("onboarding.explain.phraseTitle"), body: t("onboarding.explain.phraseBody") },
      { icon: "shield", title: t("onboarding.explain.recoverTitle"), body: t("onboarding.explain.recoverBody") },
    ];
    return (
      <Screen>
        <ScreenHeader title={t("onboarding.explain.title")} subtitle={t("onboarding.explain.sub")} onBack={() => setStep("welcome")} />
        <View style={{ flex: 1, paddingHorizontal: pad, paddingBottom: insets.bottom + pad, gap: 12 }}>
          {points.map((p) => (
            <Card key={p.title} padding={16}>
              <View style={{ flexDirection: "row", gap: 13 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    backgroundColor: theme.colors.accentDim,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={p.icon} size={22} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText weight="bold" size={15.5}>
                    {p.title}
                  </AppText>
                  <AppText size={12.5} muted style={{ lineHeight: 19, marginTop: 3 }}>
                    {p.body}
                  </AppText>
                </View>
              </View>
            </Card>
          ))}
          <View style={{ flex: 1 }} />
          <Button label={t("onboarding.explain.continue")} onPress={() => setStep("reveal")} />
        </View>
      </Screen>
    );
  }

  if (step === "reveal") {
    return (
      <Screen>
        <ScreenHeader title={t("onboarding.reveal.title")} subtitle={t("onboarding.reveal.step")} onBack={() => setStep("explain")} />
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
          <SeedVerify words={words} onContinue={() => setStep("passcode")} />
        </ScrollView>
      </Screen>
    );
  }

  if (step === "import") {
    return (
      <Screen>
        <ImportScreen
          onBack={() => setStep("welcome")}
          onDone={(phrase) => {
            setMnemonic(phrase);
            setStep("passcode");
          }}
        />
      </Screen>
    );
  }

  if (step === "passcode") {
    return (
      <Screen>
        <CreatePasscode
          onDone={(pin) => {
            setPasscode(pin);
            setStep("biometric");
          }}
          onBack={() => setStep("welcome")}
        />
      </Screen>
    );
  }

  if (step === "biometric") {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: pad }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 30,
              backgroundColor: theme.colors.accentDim,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="faceid" size={54} stroke={1.7} color={theme.colors.accent} />
          </View>
          <AppText weight="bold" size={26} style={{ marginTop: 24, letterSpacing: -0.4 }}>
            {t("onboarding.biometric.title")}
          </AppText>
          <AppText size={14.5} muted style={{ marginTop: 10, lineHeight: 22, textAlign: "center", maxWidth: 270 }}>
            {t("onboarding.biometric.body")}
          </AppText>
        </View>
        <View style={{ paddingHorizontal: pad, paddingBottom: insets.bottom + pad, gap: 11 }}>
          <Button
            label={t("onboarding.biometric.enable")}
            icon="faceid"
            onPress={() => {
              setPref("biometricEnabled", true);
              logEvent("biometric_on");
              setStep("ready");
            }}
          />
          <Button
            label={t("onboarding.biometric.later")}
            variant="ghost"
            onPress={() => {
              setPref("biometricEnabled", false);
              setStep("ready");
            }}
            height={50}
          />
        </View>
      </Screen>
    );
  }

  // ready
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: pad }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.colors.accentDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="check" size={54} stroke={2.4} color={theme.colors.accent} />
        </View>
        <AppText weight="bold" size={28} style={{ marginTop: 24, letterSpacing: -0.5 }}>
          {t("onboarding.ready.title")}
        </AppText>
        <AppText size={14.5} muted style={{ marginTop: 10, lineHeight: 22, textAlign: "center", maxWidth: 260 }}>
          {t("onboarding.ready.body")}
        </AppText>
      </View>
      <View style={{ paddingHorizontal: pad, paddingBottom: insets.bottom + pad }}>
        <Button label={t("onboarding.ready.open")} onPress={() => void finish()} />
      </View>
    </Screen>
  );
}
