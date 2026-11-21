import React from "react";
import { StyleSheet, View } from "react-native";
import { SheetHeader, AppText, Button, Card, Row, Icon } from "@/components";
import { ACCOUNT } from "@/features/wallet/demoData";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useSheets } from "@/providers/SheetProvider";
import { displayAddress } from "@/services/wallet/account";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import type { SheetCloseProps } from "./types";

export function AccountsSheet({ close }: SheetCloseProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { prefs } = useApp();
  const { open } = useSheets();
  return (
    <View>
      <SheetHeader title={t("sheets.accounts.title")} onClose={close} />
      <Card padding={0} style={styles.cardInset}>
        <Row
          last
          left={<View style={styles.avatar} />}
          title={ACCOUNT.label}
          sub={
            <AppText mono size={13} muted>
              {displayAddress(prefs.walletAddress)}
            </AppText>
          }
          right={<Icon name="checkCircle" size={22} color={theme.colors.accent} />}
        />
      </Card>
      <Button
        label={t("sheets.accounts.add")}
        icon="plus"
        variant="soft"
        style={styles.addButton}
        onPress={() => open("soon", { title: t("sheets.accounts.add") })}
      />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    cardInset: {
      paddingHorizontal: 16,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.accent,
    },
    addButton: {
      marginTop: 14,
    },
  });
