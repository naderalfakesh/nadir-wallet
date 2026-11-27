import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme, alpha } from "@/theme";
import { Icon, type IconName } from "./Icon";

interface MiniIconProps {
  name: IconName;
  tone?: "neutral" | "accent" | "pos" | "warn" | "neg";
}

export function MiniIcon({ name, tone = "neutral" }: MiniIconProps) {
  const { colors } = useTheme();

  const toneColor =
    tone === "accent"
      ? colors.accent
      : tone === "pos"
        ? colors.pos
        : tone === "warn"
          ? colors.warn
          : tone === "neg"
            ? colors.neg
            : colors.text;

  const bg =
    tone === "neutral" ? colors.surface2 : alpha(toneColor, tone === "accent" ? 0.15 : 0.16);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Icon name={name} size={20} color={tone === "neutral" ? colors.text : toneColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
