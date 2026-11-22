import React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Icon, Row, SheetHeader } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { ToggleRow } from "./ToggleRow";
import type { SheetCloseProps } from "./types";

export function PrivacySheet({ close }: SheetCloseProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { prefs, setPref } = useApp();
  const { privacy } = prefs;

  return (
    <View>
      <SheetHeader
        title={t("sheets.privacy.title")}
        subtitle={t("sheets.privacy.sub")}
        onClose={close}
      />
      <Card padding={0} style={styles.cardInset}>
        <ToggleRow
          title={t("sheets.privacy.hideBalances")}
          sub={t("sheets.privacy.hideBalancesSub")}
          on={prefs.hideBalances}
          onChange={() => setPref("hideBalances", !prefs.hideBalances)}
        />
        <Row
          title={t("sheets.privacy.screenshots")}
          sub={t("sheets.privacy.screenshotsSub")}
          right={<Icon name="lock" size={20} color={theme.colors.accent} />}
        />
        <ToggleRow
          title={t("sheets.privacy.usage")}
          sub={t("sheets.privacy.usageSub")}
          on={privacy.shareUsageData}
          onChange={() =>
            setPref("privacy", { ...privacy, shareUsageData: !privacy.shareUsageData })
          }
        />
        <ToggleRow
          title={t("sheets.privacy.switcher")}
          sub={t("sheets.privacy.switcherSub")}
          on={privacy.hideInSwitcher}
          onChange={() =>
            setPref("privacy", { ...privacy, hideInSwitcher: !privacy.hideInSwitcher })
          }
          last
        />
      </Card>
    </View>
  );
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    cardInset: { paddingHorizontal: 16 },
  });
