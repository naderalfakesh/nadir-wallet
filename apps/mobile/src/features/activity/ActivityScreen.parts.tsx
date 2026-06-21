import React, { useMemo } from "react";
import { Pressable } from "react-native";
import { AppText } from "@/components";
import { alpha, useTheme } from "@/theme";
import { createActivityStyles } from "./ActivityScreen.styles";

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
