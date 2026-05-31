import React from "react";
import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from "react-native";
import { useTheme } from "@/theme";

type Weight = "regular" | "medium" | "semibold" | "bold";

interface AppTextProps extends RNTextProps {
  weight?: Weight;
  size?: number;
  color?: string;
  mono?: boolean;
  // Tabular figures keep balances from shifting width as digits change.
  tnum?: boolean;
  muted?: boolean;
  faint?: boolean;
}

export function AppText({
  weight = "regular",
  size = 15,
  color,
  mono = false,
  tnum = false,
  muted = false,
  faint = false,
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();

  const family = mono
    ? weight === "regular"
      ? theme.font.monoRegular
      : weight === "medium"
        ? theme.font.monoMedium
        : theme.font.monoSemibold
    : theme.font[weight];

  const resolved =
    color ?? (faint ? theme.colors.textFaint : muted ? theme.colors.textMuted : theme.colors.text);

  return (
    <RNText
      {...rest}
      style={[
        { fontFamily: family, fontSize: size, color: resolved },
        tnum && styles.tnum,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tnum: { fontVariant: ["tabular-nums"] },
});
