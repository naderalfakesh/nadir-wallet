import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, ScreenHeader } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { FaceIDGate } from "@/features/auth/FaceIDGate";
import { SeedReveal } from "@/features/onboarding/SeedComponents";
import { consumeLiveness, peekLiveness } from "@/features/liveness/livenessGate";

export function RevealScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { getMnemonic, prefs } = useApp();
  // The phrase is only read from the keychain after the biometric/passcode gate.
  const [words, setWords] = useState<string[] | null>(null);

  // Enforce the optional liveness step-up here, on the route itself, so every
  // entry point (Security Center, Settings, a deep link) is gated identically.
  // Decide once on mount (peek, pure); the effect then either consumes the
  // one-shot pass or bounces to the liveness flow.
  const [allowed] = useState(
    () => !prefs.requireLivenessReveal || peekLiveness("/reveal"),
  );
  useEffect(() => {
    if (allowed) consumeLiveness("/reveal");
    else router.replace("/liveness?next=/reveal");
  }, [allowed, router]);

  const unlock = async () => {
    const mnemonic = await getMnemonic();
    setWords(mnemonic ? mnemonic.split(" ") : []);
  };

  // Render nothing while bouncing to the liveness gate.
  if (!allowed) return null;

  return (
    <Screen>
      <ScreenHeader title={t("onboarding.backup.revealTitle")} onBack={() => router.back()} />
      {words === null ? (
        <FaceIDGate
          title={t("onboarding.backup.verifyIt")}
          subtitle={t("onboarding.backup.revealGate")}
          onDone={() => void unlock()}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.pad, paddingBottom: insets.bottom + theme.spacing.pad }}>
          <SeedReveal words={words} onContinue={() => router.back()} ctaLabel={t("common.actions.done")} />
        </ScrollView>
      )}
    </Screen>
  );
}
