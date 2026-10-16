import React, { useMemo } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Screen, ScreenHeader, AppText, Card, Row, Button, MiniIcon, SectionLabel } from "@/components";
import { useTheme, useThemeControls } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useSheets } from "@/providers/SheetProvider";
import { useApp } from "@/providers/AppProvider";
import { createSettingsStyles } from "./SettingsScreen.styles";
import { AccountCard } from "./SettingsScreen.parts";
import { DemoControls } from "./DemoControls";

export function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsStyles(theme), [theme]);
  const router = useRouter();
  const sheets = useSheets();
  const { scheme } = useThemeControls();
  const { t } = useTranslation();
  const { prefs, resetWallet, lockSession } = useApp();

  const confirmReset = () => {
    Alert.alert(t("settings.reset.title"), t("settings.reset.body"), [
      { text: t("settings.reset.cancel"), style: "cancel" },
      {
        text: t("settings.reset.confirm"),
        style: "destructive",
        onPress: () => {
          // Resetting closes the wallet route group; index then routes to onboarding.
          void resetWallet();
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader title={t("settings.title")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.body}>
          <AccountCard address={prefs.walletAddress} />

          <View style={styles.gap} />
          <SectionLabel>{t("settings.wallet.section")}</SectionLabel>
          <Card padding={0} style={styles.cardInset}>
            <Row onPress={() => sheets.open("accounts")} left={<MiniIcon name="user" />} title={t("settings.wallet.accounts")} sub={t("settings.wallet.accountsSub")} chevron />
            <Row onPress={() => sheets.open("soon", { title: t("settings.wallet.networks") })} left={<MiniIcon name="globe" />} title={t("settings.wallet.networks")} sub={t("settings.wallet.networksSub")} chevron />
            <Row onPress={() => sheets.open("soon", { title: t("settings.wallet.currency") })} left={<MiniIcon name="trend" />} title={t("settings.wallet.currency")} right={t("settings.wallet.currencyValue")} chevron last />
          </Card>

          <View style={styles.gap} />
          <SectionLabel>{t("settings.preferences.section")}</SectionLabel>
          <Card padding={0} style={styles.cardInset}>
            <Row
              left={<MiniIcon name="settings" />}
              title={t("settings.preferences.theme")}
              right={scheme === "light" ? t("settings.preferences.light") : t("settings.preferences.dark")}
              chevron
              onPress={() => sheets.open("theme")}
            />
            <Row onPress={() => sheets.open("soon", { title: t("settings.preferences.privacy") })} left={<MiniIcon name="eyeOff" />} title={t("settings.preferences.privacy")} sub={t("settings.preferences.privacySub")} chevron last />
          </Card>

          <View style={styles.gap} />
          <SectionLabel>{t("settings.security.section")}</SectionLabel>
          <Card padding={0} style={styles.cardInset}>
            <Row
              left={<MiniIcon name="shield" />}
              title={t("settings.security.center")}
              sub={t("settings.security.actionNeeded")}
              chevron
              onPress={() => router.navigate("/security")}
            />
            <Row onPress={() => router.push("/reveal")} left={<MiniIcon name="key" />} title={t("settings.security.recovery")} chevron />
            <Row onPress={() => sheets.open("soon", { title: t("settings.security.notifications") })} left={<MiniIcon name="bell" />} title={t("settings.security.notifications")} chevron last />
          </Card>

          <View style={styles.gap} />
          <SectionLabel>{t("settings.about.section")}</SectionLabel>
          <Card padding={0} style={styles.cardInset}>
            <Row onPress={() => sheets.open("howItWorks")} left={<MiniIcon name="shield" />} title={t("settings.about.howItWorks")} sub={t("settings.about.howItWorksSub")} chevron />
            <Row onPress={() => sheets.open("soon", { title: t("settings.about.help") })} left={<MiniIcon name="info" />} title={t("settings.about.help")} chevron />
            <Row onPress={() => sheets.open("soon", { title: t("settings.about.version") })} left={<MiniIcon name="globe" />} title={t("settings.about.version")} right="v1.0.0" chevron last />
          </Card>

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
          <Button label={t("settings.lockWallet")} variant="ghost" icon="lock" onPress={lockSession} />

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
