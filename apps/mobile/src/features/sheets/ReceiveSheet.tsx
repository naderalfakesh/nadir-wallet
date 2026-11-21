import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { getNetwork } from "@nadir-wallet/crypto-core";
import { SheetHeader, AppText, Button, Icon, QRCode, TestnetBadge } from "@/components";
import { CHAINS, chainToNetworkId, type ChainId } from "@/features/wallet/data";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { copyText, shareText } from "@/services/device";
import { useTheme, useThemedStyles, alpha, type Theme } from "@/theme";
import type { SheetBodyProps } from "./types";

export function ReceiveSheet({ params, close }: SheetBodyProps<"receive">) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { prefs } = useApp();
  const address = prefs.walletAddress;
  const symbol = params?.token;
  const [chain, setChain] = useState<ChainId>(params?.chain ?? "ethereum");
  const [copied, setCopied] = useState(false);
  const ch = CHAINS[chain];
  const networkId = chainToNetworkId(chain);
  const network = networkId ? getNetwork(networkId) : undefined;
  const chainQualified = network && (!symbol || symbol === network.nativeCurrency.symbol);
  const qrValue = chainQualified ? `ethereum:${address}@${network.chainId}` : address;

  return (
    <View>
      <SheetHeader title={t("receive.title")} subtitle={t("receive.sub")} onClose={close} />

      <View style={styles.badgeWrap}>
        <TestnetBadge label={t("receive.testnetBadge", { chain: ch.name })} />
      </View>

      <View style={styles.chains}>
        {Object.values(CHAINS).map((c) => {
          const on = chain === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setChain(c.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: on ? alpha(theme.colors.accent, 0.15) : theme.colors.surface2,
                  borderColor: on ? "transparent" : theme.colors.hairline,
                },
              ]}
            >
              <View style={[styles.chipDot, { backgroundColor: c.color }]} />
              <AppText
                weight="semibold"
                size={13.5}
                color={on ? theme.colors.accent : theme.colors.textMuted}
              >
                {c.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>

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
          onPress={() => {
            void copyText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
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
    chains: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      height: 36,
      paddingHorizontal: 13,
      borderRadius: theme.radius.chip,
      borderWidth: 1,
    },
    chipDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
    },
    qrWrap: {
      alignItems: "center",
    },
    qrBox: {
      padding: 16,
      backgroundColor: "#fff",
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
