import React from "react";
import { StyleSheet, View } from "react-native";
import type { TransactionStatus } from "@nadir-wallet/types";
import type { TranslationKey } from "@/i18n";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme, alpha } from "@/theme";
import { AppText } from "./Text";

const statusMap: Record<
  TransactionStatus,
  { key: "pos" | "warn" | "neg"; labelKey: TranslationKey }
> = {
  confirmed: { key: "pos", labelKey: "tx.status.confirmed" },
  pending: { key: "warn", labelKey: "tx.status.pending" },
  failed: { key: "neg", labelKey: "tx.status.failed" },
};

interface StatusPillProps {
  status: TransactionStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const s = statusMap[status];
  const c = colors[s.key];
  return (
    <View style={[styles.container, { backgroundColor: alpha(c, 0.14) }]}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <AppText weight="semibold" size={12} color={c}>
        {t(s.labelKey)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
