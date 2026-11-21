import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Icon, IconButton } from "@/components";
import { ACCOUNT } from "@/features/wallet/data";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface AccountBarProps {
  hidden: boolean;
  onToggleBalances: () => void;
  onOpenAccounts: () => void;
  onOpenScan: () => void;
}

export function AccountBar({
  hidden,
  onToggleBalances,
  onOpenAccounts,
  onOpenScan,
}: AccountBarProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.accountBar}>
      <Pressable onPress={onOpenAccounts} style={styles.accountPicker}>
        <View style={styles.accountAvatar} />
        <AppText weight="bold" size={14.5}>
          {ACCOUNT.label}
        </AppText>
        <Icon name="chevronD" size={16} color={theme.colors.textMuted} />
      </Pressable>
      <View style={styles.accountSpacer} />
      <IconButton
        name={hidden ? "eyeOff" : "eye"}
        onPress={onToggleBalances}
        accessibilityLabel={hidden ? t("common.a11y.showBalances") : t("common.a11y.hideBalances")}
      />
      <IconButton name="scan" accessibilityLabel={t("common.a11y.scanQr")} onPress={onOpenScan} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    accountBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: theme.spacing.pad,
      paddingTop: 14,
      paddingBottom: 4,
    },
    accountPicker: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      height: 42,
      paddingLeft: 7,
      paddingRight: 12,
      borderRadius: 99,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    accountAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.accent,
    },
    accountSpacer: {
      flex: 1,
    },
  });
