import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Card, SheetHeader } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import type { NotificationPrefs } from "@/services/storage";
import { useThemedStyles, type Theme } from "@/theme";
import { ToggleRow } from "./ToggleRow";
import type { SheetCloseProps } from "./types";

export function NotificationsSheet({ close }: SheetCloseProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { prefs, setPref } = useApp();
  const { notifications } = prefs;

  const flip = (key: keyof NotificationPrefs) =>
    setPref("notifications", { ...notifications, [key]: !notifications[key] });

  return (
    <View>
      <SheetHeader
        title={t("sheets.notifications.title")}
        subtitle={t("sheets.notifications.sub")}
        onClose={close}
      />
      <Card padding={0} style={styles.cardInset}>
        <ToggleRow
          title={t("sheets.notifications.incoming")}
          sub={t("sheets.notifications.incomingSub")}
          on={notifications.incoming}
          onChange={() => flip("incoming")}
        />
        <ToggleRow
          title={t("sheets.notifications.sent")}
          sub={t("sheets.notifications.sentSub")}
          on={notifications.sent}
          onChange={() => flip("sent")}
        />
        <ToggleRow
          title={t("sheets.notifications.security")}
          sub={t("sheets.notifications.securitySub")}
          on={notifications.security}
          onChange={() => flip("security")}
        />
        <ToggleRow
          title={t("sheets.notifications.price")}
          sub={t("sheets.notifications.priceSub")}
          on={notifications.price}
          onChange={() => flip("price")}
          last
        />
      </Card>
      <AppText size={12.5} muted style={styles.note}>
        {t("sheets.notifications.note")}
      </AppText>
    </View>
  );
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    cardInset: { paddingHorizontal: 16 },
    note: { marginTop: 14, lineHeight: 19 },
  });
