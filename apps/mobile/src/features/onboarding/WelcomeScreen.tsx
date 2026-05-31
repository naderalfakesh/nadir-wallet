import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen, Brandmark, AppText, Button, TestnetBadge, TrustNote } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";

export function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const enter = () => router.replace("/home");

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.pad }}>
          <Brandmark size={76} />
          <AppText weight="bold" size={32} style={{ marginTop: 26, letterSpacing: -0.6 }}>
            {t("common.appName")}
          </AppText>
          <AppText
            size={15.5}
            muted
            style={{ marginTop: 10, textAlign: "center", lineHeight: 23, maxWidth: 280 }}
          >
            {t("onboarding.welcome.tagline")}
          </AppText>
          <View style={{ marginTop: 18 }}>
            <TestnetBadge label={t("onboarding.welcome.badge")} />
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: theme.spacing.pad,
            paddingBottom: insets.bottom + theme.spacing.pad,
            gap: 11,
          }}
        >
          <Button label={t("onboarding.welcome.create")} onPress={enter} />
          <Button label={t("onboarding.welcome.import")} variant="ghost" onPress={enter} />
          <View style={{ marginTop: 8, gap: 7 }}>
            <TrustNote icon="lock">{t("onboarding.welcome.trustKeys")}</TrustNote>
            <TrustNote icon="info">{t("onboarding.welcome.trustTestnet")}</TrustNote>
          </View>
        </View>
      </View>
    </Screen>
  );
}
