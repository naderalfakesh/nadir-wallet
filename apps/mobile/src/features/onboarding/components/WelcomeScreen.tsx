import React from "react";
import { StyleSheet, View } from "react-native";
import { Screen, Brandmark, AppText, Button, TestnetBadge, TrustNote } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useThemedStyles, type Theme } from "@/theme";

interface WelcomeScreenProps {
  onCreate: () => void;
  onImport: () => void;
}

export function WelcomeScreen({ onCreate, onImport }: WelcomeScreenProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Brandmark size={76} />
          <AppText weight="bold" size={32} style={styles.title}>
            {t("common.appName")}
          </AppText>
          <AppText size={15.5} muted style={styles.tagline}>
            {t("onboarding.welcome.tagline")}
          </AppText>
          <View style={styles.badge}>
            <TestnetBadge label={t("onboarding.welcome.badge")} />
          </View>
        </View>

        <View style={styles.footer}>
          <Button label={t("onboarding.welcome.create")} onPress={onCreate} />
          <Button label={t("onboarding.welcome.import")} variant="ghost" onPress={onImport} />
          <View style={styles.trust}>
            <TrustNote icon="lock">{t("onboarding.welcome.trustKeys")}</TrustNote>
            <TrustNote icon="info">{t("onboarding.welcome.trustTestnet")}</TrustNote>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: "space-between" },
    hero: { flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing.pad },
    title: { marginTop: 26, letterSpacing: -0.6 },
    tagline: { marginTop: 10, textAlign: "center", lineHeight: 23, maxWidth: 280 },
    badge: { marginTop: 18 },
    footer: {
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: theme.spacing.pad,
      gap: 11,
    },
    trust: { marginTop: 8, gap: 7 },
  });
