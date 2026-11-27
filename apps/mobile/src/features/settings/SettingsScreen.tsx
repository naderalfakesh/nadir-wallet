import React from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  Screen,
  ScreenHeader,
  AppText,
  Card,
  Row,
  Button,
  MiniIcon,
  SectionLabel,
} from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { AboutSection } from "./components/AboutSection";
import { AccountCard } from "./components/AccountCard";
import { DemoControls } from "./components/DemoControls";
import { PreferencesSection } from "./components/PreferencesSection";
import { SecuritySection } from "./components/SecuritySection";
import { WalletSection } from "./components/WalletSection";

export function SettingsScreen() {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { prefs, resetWallet, lockSession } = useApp();

  const confirmReset = () => {
    Alert.alert(t("settings.reset.title"), t("settings.reset.body"), [
      { text: t("settings.reset.cancel"), style: "cancel" },
      {
        text: t("settings.reset.confirm"),
        style: "destructive",
        onPress: () => {
          void resetWallet();
        },
      },
    ]);
  };

  return (
    <Screen bottomInset={false}>
      <ScreenHeader title={t("settings.title")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.body}>
          <AccountCard address={prefs.walletAddress} />

          <View style={styles.gap} />
          <WalletSection />

          <View style={styles.gap} />
          <PreferencesSection />

          <View style={styles.gap} />
          <SecuritySection />

          <View style={styles.gap} />
          <AboutSection />

          <View style={styles.gap} />
          <SectionLabel>{t("settings.demo.section")}</SectionLabel>
          <DemoControls />

          <View style={styles.gap} />
          <SectionLabel>{t("settings.reset.section")}</SectionLabel>
          <Card padding={0} style={styles.cardInset}>
            <Row
              onPress={confirmReset}
              left={<MiniIcon name="refresh" tone="neg" />}
              title={
                <AppText weight="semibold" size={16} color={theme.colors.neg}>
                  {t("settings.reset.action")}
                </AppText>
              }
              sub={t("settings.reset.sub")}
              chevron
              last
            />
          </Card>

          <View style={styles.gap} />
          <Button
            label={t("settings.lockWallet")}
            variant="ghost"
            icon="lock"
            onPress={lockSession}
          />

          <View style={styles.footer}>
            <AppText size={12} faint>
              {t("settings.footerName")}
            </AppText>
            <AppText size={11.5} faint style={styles.footerNote}>
              {t("settings.footerNote")}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      paddingBottom: 24,
    },
    body: {
      paddingHorizontal: theme.spacing.pad,
    },
    gap: {
      height: 18,
    },
    cardInset: {
      paddingHorizontal: 16,
    },
    footer: {
      alignItems: "center",
      paddingVertical: 20,
      gap: 4,
    },
    footerNote: {
      textAlign: "center",
    },
  });
