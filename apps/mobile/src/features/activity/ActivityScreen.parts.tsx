import React, { useMemo } from "react";
import { Pressable } from "react-native";
import { AppText } from "@/components";
import { alpha, useTheme } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import type { DemoTransaction } from "@/features/wallet/data";
import { getTransactionTime } from "@/features/wallet/transactions";
import { createActivityStyles } from "./ActivityScreen.styles";
import { getActivitySubtitle } from "./activity.utils";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  const theme = useTheme();
  const styles = useMemo(() => createActivityStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? alpha(theme.colors.accent, 0.15) : theme.colors.surface2,
          borderColor: active ? "transparent" : theme.colors.hairline,
        },
      ]}
    >
      <AppText weight="semibold" size={13.5} color={active ? theme.colors.accent : theme.colors.textMuted}>
        {label}
      </AppText>
    </Pressable>
  );
}

/**
 * Row subtitle. Addresses are set in the mono face: the display font draws the
 * "x" in "0x44Ae" as a multiplication sign.
 */
export function ActivitySubtitle({ tx }: { tx: DemoTransaction }) {
  const { t } = useTranslation();
  if (!tx.party.startsWith("0x")) {
    return (
      <AppText size={13} muted numberOfLines={1}>
        {getActivitySubtitle(tx, t)}
      </AppText>
    );
  }
  return (
    <AppText size={13} muted numberOfLines={1}>
      {tx.type === "receive" ? t("activity.from") : t("activity.to")}
      <AppText mono size={12.5} muted>
        {tx.party}
      </AppText>
      {`  ·  ${getTransactionTime(tx)}`}
    </AppText>
  );
}
