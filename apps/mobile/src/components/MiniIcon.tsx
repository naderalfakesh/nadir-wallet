import React from "react";
import { View } from "react-native";
import { useTheme, alpha } from "@/theme";
import { Icon, type IconName } from "./Icon";

interface MiniIconProps {
  name: IconName;
  // Tone tints the disc; omit for the neutral surface treatment.
  tone?: "neutral" | "accent" | "pos" | "warn" | "neg";
}

export function MiniIcon({ name, tone = "neutral" }: MiniIconProps) {
  const theme = useTheme();
  const { colors } = theme;

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

  const bg = tone === "neutral" ? colors.surface2 : alpha(toneColor, tone === "accent" ? 0.15 : 0.16);

  return (
    <View
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={name} size={20} color={tone === "neutral" ? colors.text : toneColor} />
    </View>
  );
}
