import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Button, Icon, QRCode, SheetHeader, TestnetBadge } from "@/components";
import { CHAINS } from "@/features/wallet/chains";
import type { ChainId } from "@/features/wallet/types";
import { useCopyFeedback } from "@/hooks";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { shareText } from "@/services/device";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { ChainSelector } from "./components/ChainSelector";
import { buildReceiveQrPayload } from "./receive.utils";
import type { SheetBodyProps } from "./types";

const QR_BG_COLOR = "#ffffff";

export function ReceiveSheet({ params, close }: SheetBodyProps<"receive">) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { prefs } = useApp();
  const address = prefs.walletAddress;
  const [chain, setChain] = useState<ChainId>(params?.chain ?? "ethereum");
  const { copied, copy } = useCopyFeedback();

  const ch = CHAINS[chain];
  const { value: qrValue, chainQualified } = buildReceiveQrPayload(address, chain, params?.token);

  return (
    <View>
      <SheetHeader title={t("receive.title")} subtitle={t("receive.sub")} onClose={close} />

      <View style={styles.badgeWrap}>
        <TestnetBadge label={t("receive.testnetBadge", { chain: ch.name })} />
      </View>

      <ChainSelector selected={chain} onSelect={setChain} />

      <View style={styles.qrWrap}>
        <View style={styles.qrBox}>
          <QRCode value={qrValue} size={188} />
        </View>
        <View style={styles.qrLabelRow}>
          <View style={[styles.qrChainDot, { backgroundColor: ch.color }]} />
          <AppText weight="semibold" size={13.5} muted>
            {t(chainQualified ? "receive.networkQrLabel" : "receive.addressLabel", {
              chain: ch.name,
            })}
          </AppText>
        </View>
      </View>

      <View style={styles.addressBox}>
        <AppText mono size={13} style={styles.addressText}>
          {address}
        </AppText>
      </View>

      <View style={styles.actions}>
        <Button
          label={copied ? t("common.actions.copied") : t("common.actions.copy")}
          icon={copied ? "check" : "copy"}
          variant="ghost"
          height={52}
          style={styles.actionButton}
          onPress={() => copy(address)}
        />
        <Button
          label={t("common.actions.share")}
          icon="external"
          height={52}
          style={styles.actionButton}
          onPress={() => void shareText(address)}
        />
      </View>

      <View style={styles.warningRow}>
        <Icon name="info" size={16} color={theme.colors.textFaint} />
        <AppText faint size={12} style={styles.warningText}>
          {t("receive.warning", { chain: ch.name })}
        </AppText>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    badgeWrap: {
      alignItems: "center",
      marginBottom: 14,
    },
    qrWrap: {
      alignItems: "center",
    },
    qrBox: {
      padding: 16,
      backgroundColor: QR_BG_COLOR,
      borderRadius: 22,
    },
    qrLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 16,
    },
    qrChainDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
    },
    addressBox: {
      marginTop: 14,
      padding: 16,
      borderRadius: theme.radius.card,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.hairline,
    },
    addressText: {
      lineHeight: 20,
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 12,
    },
    actionButton: {
      flex: 1,
    },
    warningRow: {
      flexDirection: "row",
      gap: 9,
      marginTop: 14,
      paddingHorizontal: 2,
    },
    warningText: {
      flex: 1,
      lineHeight: 17,
    },
  });
