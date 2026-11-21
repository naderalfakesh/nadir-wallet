import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { AppText } from "@/components";
import { alpha, useTheme, useThemedStyles, type Theme } from "@/theme";

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

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
      <AppText
        weight="semibold"
        size={13.5}
        color={active ? theme.colors.accent : theme.colors.textMuted}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    chip: {
      height: 36,
      paddingHorizontal: 13,
      borderRadius: theme.radius.chip,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
  });
