import React from "react";
import { StyleSheet } from "react-native";
import { Card, MiniIcon, Row, SectionLabel } from "@/components";
import { CHAINS } from "@/features/wallet/chains";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useSheets } from "@/providers/SheetProvider";
import { useThemedStyles, type Theme } from "@/theme";
import { currencyCode } from "../currencies";
import { countEnabled } from "../networks.utils";

const CHAIN_IDS = Object.keys(CHAINS);

export function WalletSection() {
  const styles = useThemedStyles(createStyles);
  const sheets = useSheets();
  const { t } = useTranslation();
  const { prefs } = useApp();

  return (
    <>
      <SectionLabel>{t("settings.wallet.section")}</SectionLabel>
      <Card padding={0} style={styles.cardInset}>
        <Row
          onPress={() => sheets.open("accounts")}
          left={<MiniIcon name="user" />}
          title={t("settings.wallet.accounts")}
          sub={t("settings.wallet.accountsSub")}
          chevron
        />
        <Row
          onPress={() => sheets.open("networks")}
          left={<MiniIcon name="globe" />}
          title={t("settings.wallet.networks")}
          sub={t("settings.wallet.networksSub", {
            enabled: countEnabled(prefs.enabledNetworks, CHAIN_IDS),
            total: CHAIN_IDS.length,
          })}
          chevron
        />
        <Row
          onPress={() => sheets.open("currency")}
          left={<MiniIcon name="trend" />}
          title={t("settings.wallet.currency")}
          right={currencyCode(prefs.currency)}
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
