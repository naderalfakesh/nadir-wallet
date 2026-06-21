import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { AppText, Card, IconButton, TestnetBadge } from "@/components";
import { useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { displayAddress } from "@/services/wallet/account";
import { copyText } from "@/services/device";
import { ACCOUNT } from "@/features/wallet/data";
import { createSettingsStyles } from "./SettingsScreen.styles";

export function AccountCard({ address }: { address: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsStyles(theme), [theme]);
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void copyText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <Card padding={18}>
      <View style={styles.accountRow}>
        <View style={styles.accountAvatar} />
        <View style={styles.accountInfo}>
          <View style={styles.accountNameRow}>
            <AppText weight="bold" size={17}>
              {ACCOUNT.label}
            </AppText>
            <TestnetBadge label={t("common.testnet.badge")} />
          </View>
          <AppText weight="semibold" size={12.5} color={theme.colors.accent} style={styles.accountCaption}>
            {ACCOUNT.caption}
          </AppText>
          <AppText mono size={12} muted style={styles.accountAddress}>
            {displayAddress(address)}
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
  );
}
