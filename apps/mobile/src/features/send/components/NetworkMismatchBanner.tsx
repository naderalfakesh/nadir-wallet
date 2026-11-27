import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { alpha, useTheme, useThemedStyles, type Theme } from "@/theme";

interface NetworkMismatchBannerProps {
  fromChainName: string;
  toChainName: string;
}

export function NetworkMismatchBanner({ fromChainName, toChainName }: NetworkMismatchBannerProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.banner}>
      <Icon name="alert" size={20} color={theme.colors.warn} />
      <View style={styles.body}>
        <AppText weight="bold" size={13.5} color={theme.colors.warn}>
          {t("send.mismatch.title")}
        </AppText>
        <AppText size={12.5} muted style={styles.text}>
          {t("send.mismatch.body", { from: fromChainName, to: toChainName })}
        </AppText>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    banner: {
      flexDirection: "row",
      gap: 11,
      marginTop: 12,
      padding: 13,
      borderRadius: 14,
      backgroundColor: alpha(theme.colors.warn, 0.12),
      borderWidth: 1,
      borderColor: alpha(theme.colors.warn, 0.3),
    },
    body: {
      flex: 1,
    },
    text: {
      lineHeight: 18,
      marginTop: 2,
    },
  });
