import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Screen,
  ScreenHeader,
  AppText,
  Card,
  Row,
  Button,
  IconButton,
  MiniIcon,
  TestnetBadge,
  SectionLabel,
} from "@/components";
import { useTheme, useThemeControls } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useSheets } from "@/providers/SheetProvider";
import { displayAddress } from "@/services/wallet/account";
import { copyText } from "@/services/device";
import { ACCOUNT } from "@/features/wallet/data";
import { DemoControls } from "./DemoControls";

export function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const sheets = useSheets();
  const { scheme } = useThemeControls();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void copyText(ACCOUNT.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const gap = { height: 18 } as const;

  return (
    <Screen>
      <ScreenHeader title={t("settings.title")} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: theme.spacing.pad }}>
          {/* account card */}
          <Card padding={18}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: theme.colors.accent }} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <AppText weight="bold" size={17}>
                    {ACCOUNT.label}
                  </AppText>
                  <TestnetBadge label={t("common.testnet.badge")} />
                </View>
                <AppText mono size={12.5} color={theme.colors.accent} style={{ marginTop: 2 }}>
                  {ACCOUNT.ens}
                </AppText>
                <AppText mono size={12} muted style={{ marginTop: 3 }}>
                  {displayAddress(ACCOUNT.address)}
                </AppText>
              </View>
              <IconButton
                name={copied ? "check" : "copy"}
                onPress={copy}
                size={19}
                color={copied ? theme.colors.pos : undefined}
                accessibilityLabel="Copy wallet address"
              />
            </View>
          </Card>

          <View style={gap} />
          <SectionLabel>{t("settings.wallet.section")}</SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            <Row onPress={() => sheets.open("accounts")} left={<MiniIcon name="user" />} title={t("settings.wallet.accounts")} sub={t("settings.wallet.accountsSub")} chevron />
            <Row onPress={() => sheets.open("soon", { title: t("settings.wallet.networks") })} left={<MiniIcon name="globe" />} title={t("settings.wallet.networks")} sub={t("settings.wallet.networksSub")} chevron />
            <Row onPress={() => sheets.open("soon", { title: t("settings.wallet.currency") })} left={<MiniIcon name="trend" />} title={t("settings.wallet.currency")} right={t("settings.wallet.currencyValue")} chevron last />
          </Card>

          <View style={gap} />
          <SectionLabel>{t("settings.preferences.section")}</SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            <Row
              left={<MiniIcon name="settings" />}
              title={t("settings.preferences.theme")}
              right={scheme === "light" ? t("settings.preferences.light") : t("settings.preferences.dark")}
              chevron
              onPress={() => sheets.open("theme")}
            />
            <Row onPress={() => sheets.open("soon", { title: t("settings.preferences.privacy") })} left={<MiniIcon name="eyeOff" />} title={t("settings.preferences.privacy")} sub={t("settings.preferences.privacySub")} chevron last />
          </Card>

          <View style={gap} />
          <SectionLabel>{t("settings.security.section")}</SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
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

          <View style={gap} />
          <SectionLabel>{t("settings.about.section")}</SectionLabel>
          <Card padding={0} style={{ paddingHorizontal: 16 }}>
            <Row onPress={() => sheets.open("howItWorks")} left={<MiniIcon name="shield" />} title={t("settings.about.howItWorks")} sub={t("settings.about.howItWorksSub")} chevron />
            <Row onPress={() => sheets.open("soon", { title: t("settings.about.help") })} left={<MiniIcon name="info" />} title={t("settings.about.help")} chevron />
            <Row onPress={() => sheets.open("soon", { title: t("settings.about.version") })} left={<MiniIcon name="globe" />} title={t("settings.about.version")} right="v1.0.0" chevron last />
          </Card>

          <View style={gap} />
          <SectionLabel>{t("settings.demo.section")}</SectionLabel>
          <DemoControls />

          <View style={gap} />
          <Button label={t("settings.lockWallet")} variant="ghost" icon="lock" onPress={() => router.push("/lock")} />

          <View style={{ alignItems: "center", paddingVertical: 20, gap: 4 }}>
            <AppText size={12} faint>
              {t("settings.footerName")}
            </AppText>
            <AppText size={11.5} faint style={{ textAlign: "center" }}>
              {t("settings.footerNote")}
            </AppText>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
