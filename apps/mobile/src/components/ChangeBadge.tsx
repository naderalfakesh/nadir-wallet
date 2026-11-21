import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme, alpha } from "@/theme";
import { fmtPct } from "@/utils/format";
import { Icon } from "./Icon";
import { AppText } from "./Text";

interface ChangeBadgeProps {
  pct: number;
  size?: number;
  plain?: boolean;
}

export function ChangeBadge({ pct, size = 13, plain = false }: ChangeBadgeProps) {
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
    <View style={[styles.container, { backgroundColor: alpha(c, 0.13) }]}>
      <Icon name={up ? "arrowUpRight" : "arrowDownLeft"} size={size + 1} stroke={2.4} color={c} />
      <AppText weight="semibold" size={size} color={c} tnum>
        {fmtPct(pct).replace("+", "").replace("−", "")}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    alignSelf: "flex-start",
  },
});
