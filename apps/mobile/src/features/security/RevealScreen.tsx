import React, { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, ScreenHeader } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { DeviceAuthGate, type GateOutcome } from "@/features/auth/DeviceAuthGate";
import { useSensitiveReveal } from "@/features/auth/useSensitiveReveal";
import { revealMnemonic } from "@/services/storage/mnemonic";
import { SeedReveal } from "@/features/onboarding/SeedComponents";
import { consumeLiveness, peekLiveness } from "@/features/liveness/livenessGate";
import { revealWhileCurrent } from "./revealPhrase";

export function RevealScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { prefs } = useApp();
  const [words, setWords] = useState<string[] | null>(null);
  const hide = useCallback(() => setWords(null), []);
  const guard = useSensitiveReveal(hide);

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

  const unlock = useCallback(
    (): Promise<GateOutcome> =>
      revealWhileCurrent(guard, () => revealMnemonic(t("onboarding.backup.revealPrompt")), setWords),
    [guard, t],
  );

  // Render nothing while bouncing to the liveness gate.
  if (!allowed) return null;

  return (
    <Screen>
      <ScreenHeader title={t("onboarding.backup.revealTitle")} onBack={() => router.back()} />
      {words === null ? (
        <DeviceAuthGate
          title={t("onboarding.backup.verifyIt")}
          subtitle={t("onboarding.backup.revealGate")}
          authenticate={unlock}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.pad, paddingBottom: insets.bottom + theme.spacing.pad }}>
          <SeedReveal words={words} onContinue={() => router.back()} ctaLabel={t("common.actions.done")} />
        </ScrollView>
      )}
    </Screen>
  );
}
