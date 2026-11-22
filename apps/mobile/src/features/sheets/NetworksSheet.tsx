import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Card, SheetHeader, TestnetBadge } from "@/components";
import { toggleNetwork } from "@/features/settings/networks.utils";
import { CHAINS } from "@/features/wallet/chains";
import type { ChainId } from "@/features/wallet/types";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { alpha, useThemedStyles, type Theme } from "@/theme";
import { ToggleRow } from "./ToggleRow";
import type { SheetCloseProps } from "./types";

const CHAIN_IDS = Object.keys(CHAINS) as ChainId[];

function ChainBadge({ color }: { color: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.badge, { backgroundColor: alpha(color, 0.18) }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
    </View>
  );
}

export function NetworksSheet({ close }: SheetCloseProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { prefs, setPref } = useApp();

  return (
    <View>
      <SheetHeader
        title={t("sheets.networks.title")}
        subtitle={t("sheets.networks.sub")}
        onClose={close}
      />
      <Card padding={0} style={styles.cardInset}>
        {CHAIN_IDS.map((id, i) => (
          <ToggleRow
            key={id}
            left={<ChainBadge color={CHAINS[id].color} />}
            title={CHAINS[id].name}
            sub={
              <View style={styles.tag}>
                <TestnetBadge label={t("sheets.networks.testnet")} />
              </View>
            }
            on={prefs.enabledNetworks.includes(id)}
            onChange={() => setPref("enabledNetworks", toggleNetwork(prefs.enabledNetworks, id))}
            last={i === CHAIN_IDS.length - 1}
          />
        ))}
      </Card>
      <AppText size={12.5} muted style={styles.note}>
        {t("sheets.networks.minOne")} {t("sheets.networks.note")}
      </AppText>
    </View>
  );
}

const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    cardInset: { paddingHorizontal: 16 },
    badge: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeDot: { width: 16, height: 16, borderRadius: 8 },
    tag: { alignItems: "flex-start", marginTop: 2 },
    note: { marginTop: 14, lineHeight: 19 },
  });
