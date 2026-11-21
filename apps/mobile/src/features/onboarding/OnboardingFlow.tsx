import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { generateMnemonic } from "@nadir-wallet/crypto-core";
import { Screen, ScreenHeader } from "@/components";
import { useBlockScreenCapture } from "@/features/security/useBlockScreenCapture";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useThemedStyles, type Theme } from "@/theme";
import { BiometricStep } from "./components/BiometricStep";
import { CreatePasscode } from "./components/CreatePasscode";
import { ExplainStep } from "./components/ExplainStep";
import { ImportScreen } from "./components/ImportScreen";
import { IntroScreen } from "./components/IntroScreen";
import { ReadyStep } from "./components/ReadyStep";
import { SeedReveal } from "./components/SeedReveal";
import { SeedVerify } from "./components/SeedVerify";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { initialOnboardingStep } from "./firstRun";

type Step =
  | "intro"
  | "welcome"
  | "explain"
  | "reveal"
  | "verify"
  | "import"
  | "passcode"
  | "biometric"
  | "ready";

export function OnboardingFlow() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { setPref, setPasscode, logEvent, createWallet, introSeen, markIntroSeen } = useApp();
  const [step, setStep] = useState<Step>(() => initialOnboardingStep(introSeen));
  const [viaImport, setViaImport] = useState(false);
  // The fresh/imported phrase lives only in memory until the user confirms.
  const [mnemonic, setMnemonic] = useState("");
  const words = mnemonic ? mnemonic.split(" ") : [];
  const [finishState, setFinishState] = useState<"idle" | "saving" | "failed">("idle");
  // The phrase is on screen (or being typed) in these steps.
  useBlockScreenCapture(step === "reveal" || step === "verify" || step === "import");

  // createWallet unlocks the session, which closes this route group; index then
  // routes to home. On failure the wallet stays un-onboarded and can retry.
  const finish = async () => {
    if (finishState === "saving") return;
    setFinishState("saving");
    try {
      await createWallet(mnemonic, { imported: viaImport });
    } catch {
      setFinishState("failed");
    }
  };

  if (step === "intro") {
    return (
      <IntroScreen
        onDone={() => {
          markIntroSeen();
          setStep("welcome");
        }}
      />
    );
  }

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
    return (
      <Animated.View entering={FadeIn.duration(180)} style={styles.explain}>
        <ExplainStep onBack={() => setStep("welcome")} onContinue={() => setStep("reveal")} />
      </Animated.View>
    );
  }

  if (step === "reveal") {
    return (
      <Screen>
        <ScreenHeader
          title={t("onboarding.reveal.title")}
          subtitle={t("onboarding.reveal.step")}
          onBack={() => setStep("explain")}
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
          <SeedVerify words={words} onContinue={() => setStep("passcode")} />
        </ScrollView>
      </Screen>
    );
  }

  if (step === "import") {
    return (
      <Screen avoidKeyboard>
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
          onDone={async (pin) => {
            try {
              await setPasscode(pin);
            } catch {
              return false;
            }
            setStep("biometric");
            return true;
          }}
          onBack={() => setStep("welcome")}
        />
      </Screen>
    );
  }

  if (step === "biometric") {
    return (
      <BiometricStep
        onEnable={() => {
          setPref("biometricEnabled", true);
          logEvent("biometric_on");
          setStep("ready");
        }}
        onSkip={() => {
          setPref("biometricEnabled", false);
          setStep("ready");
        }}
      />
    );
  }

  return (
    <ReadyStep
      onOpen={() => void finish()}
      saving={finishState === "saving"}
      failed={finishState === "failed"}
    />
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    explain: { flex: 1 },
    scrollContent: { paddingHorizontal: theme.spacing.pad, paddingBottom: theme.spacing.pad },
  });
