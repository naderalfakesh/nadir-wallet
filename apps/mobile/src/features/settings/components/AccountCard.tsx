import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Card, IconButton, TestnetBadge } from "@/components";
import { ACCOUNT } from "@/features/wallet/data";
import { useTranslation } from "@/i18n/useTranslation";
import { copyText } from "@/services/device";
import { displayAddress } from "@/services/wallet/account";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface AccountCardProps {
  address: string;
}

export function AccountCard({ address }: AccountCardProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
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
          <AppText
            weight="semibold"
            size={12.5}
            color={theme.colors.accent}
            style={styles.accountCaption}
          >
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
          accessibilityLabel={t("common.a11y.copyAddress")}
        />
      </View>
    </Card>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    accountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    accountAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.accent,
    },
    accountInfo: {
      flex: 1,
      minWidth: 0,
    },
    accountNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    accountCaption: {
      marginTop: 2,
    },
    accountAddress: {
      marginTop: 3,
    },
  });
