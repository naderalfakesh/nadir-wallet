import React from "react";
import { View } from "react-native";
import { useTheme, alpha } from "@/theme";
import { AppText } from "./Text";
import { Icon } from "./Icon";
import { fmtPct } from "@/utils/format";
import type { TransactionStatus } from "@nadir-wallet/types";

// Persistent testnet / demo positioning.
export function TestnetBadge({ label = "Testnet" }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: 24,
        paddingHorizontal: 9,
        borderRadius: 8,
        backgroundColor: alpha(colors.warn, 0.14),
        borderWidth: 1,
        borderColor: alpha(colors.warn, 0.3),
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.warn }} />
      <AppText weight="bold" size={11.5} color={colors.warn} style={{ letterSpacing: 0.2 }}>
        {label}
      </AppText>
    </View>
  );
}

export function ChangeBadge({
  pct,
  size = 13,
  plain = false,
}: {
  pct: number;
  size?: number;
  plain?: boolean;
}) {
  const { colors } = useTheme();
  const up = pct >= 0;
  const c = up ? colors.pos : colors.neg;

  if (plain) {
    return (
      <AppText weight="semibold" size={size} color={c} tnum>
        {fmtPct(pct)}
      </AppText>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: alpha(c, 0.13),
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 7,
        alignSelf: "flex-start",
      }}
    >
      <Icon name={up ? "arrowUpRight" : "arrowDownLeft"} size={size + 1} stroke={2.4} color={c} />
      <AppText weight="semibold" size={size} color={c} tnum>
        {fmtPct(pct).replace("+", "").replace("−", "")}
      </AppText>
    </View>
  );
}

const statusMap: Record<TransactionStatus, { key: "pos" | "warn" | "neg"; label: string }> = {
  confirmed: { key: "pos", label: "Confirmed" },
  pending: { key: "warn", label: "Pending" },
  failed: { key: "neg", label: "Failed" },
};

export function StatusPill({ status }: { status: TransactionStatus }) {
  const { colors } = useTheme();
  const s = statusMap[status];
  const c = colors[s.key];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: alpha(c, 0.14),
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: "flex-start",
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
      <AppText weight="semibold" size={12} color={c}>
        {s.label}
      </AppText>
    </View>
  );
}
