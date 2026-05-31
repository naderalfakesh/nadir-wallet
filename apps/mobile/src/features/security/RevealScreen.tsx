import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, ScreenHeader } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { FaceIDGate } from "@/features/auth/FaceIDGate";
import { SeedReveal } from "@/features/onboarding/SeedComponents";
import { DEMO_RECOVERY_PHRASE } from "@/features/onboarding/data";

export function RevealScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [authed, setAuthed] = useState(false);

  return (
    <Screen>
      <ScreenHeader title={t("onboarding.backup.revealTitle")} onBack={() => router.back()} />
      {!authed ? (
        <FaceIDGate title={t("onboarding.backup.verifyIt")} subtitle={t("onboarding.backup.revealGate")} onDone={() => setAuthed(true)} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.pad, paddingBottom: insets.bottom + theme.spacing.pad }}>
          <SeedReveal words={DEMO_RECOVERY_PHRASE} onContinue={() => router.back()} ctaLabel={t("common.actions.done")} />
        </ScrollView>
      )}
    </Screen>
  );
}
