import React, { useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { generateMnemonic } from "@nadir-wallet/crypto-core";
import { Screen } from "@/components";
import { LivenessFlow } from "@/features/liveness/LivenessFlow";
import { useBlockScreenCapture } from "@/features/security/useBlockScreenCapture";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { BiometricStep } from "./components/BiometricStep";
import { CreatePasscode } from "./components/CreatePasscode";
import { ExplainStep } from "./components/ExplainStep";
import { IdentityStep } from "./components/IdentityStep";
import { ImportScreen } from "./components/ImportScreen";
import { IntroScreen } from "./components/IntroScreen";
import { ReadyStep } from "./components/ReadyStep";
import { SeedReveal } from "./components/SeedReveal";
import { SeedStepFrame } from "./components/SeedStepFrame";
import { SeedVerify } from "./components/SeedVerify";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { initialOnboardingStep, stepAfterIdentity } from "./firstRun";
import type { FinishState, OnboardingStep } from "./onboarding.types";

export function OnboardingFlow() {
  const { t } = useTranslation();
  const { setPref, setPasscode, logEvent, createWallet, introSeen, markIntroSeen } = useApp();
  const [step, setStep] = useState<OnboardingStep>(() => initialOnboardingStep(introSeen));
  const [viaImport, setViaImport] = useState(false);
  // The fresh/imported phrase lives only in memory until the user confirms.
  const [mnemonic, setMnemonic] = useState("");
  const words = mnemonic ? mnemonic.split(" ") : [];
  const [finishState, setFinishState] = useState<FinishState>("idle");
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
          setStep("identity");
        }}
        onImport={() => {
          setViaImport(true);
          setStep("identity");
        }}
      />
    );
  }

  if (step === "identity") {
    return (
      <IdentityStep
        onBack={() => setStep("welcome")}
        onStart={() => setStep("liveness")}
        onSkip={() => setStep(stepAfterIdentity(viaImport))}
      />
    );
  }

  if (step === "liveness") {
    return (
      <LivenessFlow
        mode="onboarding"
        onPass={() => {
          setPref("identityVerifiedAt", Date.now());
          setStep(stepAfterIdentity(viaImport));
        }}
        onCancel={() => setStep("identity")}
      />
    );
  }

  if (step === "explain") {
    return (
      <Animated.View entering={FadeIn.duration(180)} style={styles.explain}>
        <ExplainStep onBack={() => setStep("identity")} onContinue={() => setStep("reveal")} />
      </Animated.View>
    );
  }

  if (step === "reveal") {
    return (
      <SeedStepFrame
        title={t("onboarding.reveal.title")}
        subtitle={t("onboarding.reveal.step")}
        onBack={() => setStep("explain")}
      >
        <SeedReveal
          words={words}
          onContinue={() => setStep("verify")}
          ctaLabel={t("onboarding.reveal.cta")}
        />
      </SeedStepFrame>
    );
  }

  if (step === "verify") {
    return (
      <SeedStepFrame
        title={t("onboarding.verify.title")}
        subtitle={t("onboarding.verify.step")}
        onBack={() => setStep("reveal")}
      >
        <SeedVerify words={words} onContinue={() => setStep("passcode")} />
      </SeedStepFrame>
    );
  }

  if (step === "import") {
    return (
      <Screen avoidKeyboard>
        <ImportScreen
          onBack={() => setStep("identity")}
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

const styles = StyleSheet.create({
  explain: { flex: 1 },
});
