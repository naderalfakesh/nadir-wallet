import React from "react";
import { StyleSheet } from "react-native";
import { Card, MiniIcon, Row, SectionLabel } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useSheets } from "@/providers/SheetProvider";
import { useThemeControls, useThemedStyles, type Theme } from "@/theme";

export function PreferencesSection() {
  const styles = useThemedStyles(createStyles);
  const sheets = useSheets();
  const { t } = useTranslation();
  const { preference } = useThemeControls();

  const themeLabel =
    preference === "system"
      ? t("settings.preferences.system")
      : preference === "light"
        ? t("settings.preferences.light")
        : t("settings.preferences.dark");

  return (
    <>
      <SectionLabel>{t("settings.preferences.section")}</SectionLabel>
      <Card padding={0} style={styles.cardInset}>
        <Row
          left={<MiniIcon name="settings" />}
          title={t("settings.preferences.theme")}
          right={themeLabel}
          chevron
          onPress={() => sheets.open("theme")}
        />
        <Row
          onPress={() => sheets.open("privacy")}
          left={<MiniIcon name="eyeOff" />}
          title={t("settings.preferences.privacy")}
          sub={t("settings.preferences.privacySub")}
          chevron
        />
        <Row
          onPress={() => sheets.open("notifications")}
          left={<MiniIcon name="bell" />}
          title={t("settings.preferences.notifications")}
          sub={t("settings.preferences.notificationsSub")}
          chevron
          last
        />
      </Card>
    </>
  );
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    cardInset: { paddingHorizontal: 16 },
  });
