import React from "react";
import { StyleSheet, View } from "react-native";
import { SheetHeader, AppText, Button, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import type { SheetBodyProps } from "./types";

export function SoonSheet({ params, close }: SheetBodyProps<"soon">) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const title = params?.title ?? t("sheets.soon.fallback");
  return (
    <View>
      <SheetHeader title={title} onClose={close} />
      <View style={styles.body}>
        <View style={styles.iconBox}>
          <Icon name="clock" size={30} color={theme.colors.textMuted} />
        </View>
        <AppText weight="bold" size={16} style={styles.heading}>
          {t("sheets.soon.heading")}
        </AppText>
        <AppText size={13.5} muted style={styles.text}>
          {t("sheets.soon.body", { title })}
        </AppText>
      </View>
      <Button label={t("sheets.soon.close")} variant="ghost" onPress={close} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    body: {
      alignItems: "center",
      paddingVertical: 24,
    },
    iconBox: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: theme.colors.surface2,
      alignItems: "center",
      justifyContent: "center",
    },
    heading: {
      marginTop: 16,
    },
    text: {
      marginTop: 6,
      lineHeight: 20,
      textAlign: "center",
      maxWidth: 260,
    },
  });
