import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, ScreenHeader } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { generateMnemonic } from "@nadir-wallet/crypto-core";
import { WelcomeScreen } from "./WelcomeScreen";
import { IntroScreen } from "./IntroScreen";
import { initialOnboardingStep } from "./firstRun";
import { useBlockScreenCapture } from "@/features/security/useBlockScreenCapture";
import { ImportScreen } from "./ImportScreen";
import { CreatePasscode } from "./CreatePasscode";
import { SeedReveal, SeedVerify } from "./SeedComponents";
import { BiometricStep, ExplainStep, ReadyStep } from "./OnboardingFlow.parts";

type Step = "intro" | "welcome" | "explain" | "reveal" | "verify" | "import" | "passcode" | "biometric" | "ready";

export function OnboardingFlow() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
  const pad = theme.spacing.pad;

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
    return <ExplainStep onBack={() => setStep("welcome")} onContinue={() => setStep("reveal")} />;
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
