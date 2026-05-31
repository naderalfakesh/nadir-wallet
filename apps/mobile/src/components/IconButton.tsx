import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "@/theme";
import { Icon, type IconName } from "./Icon";

interface IconButtonProps {
  name: IconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  accessibilityLabel: string;
}

export function IconButton({ name, onPress, size = 21, color, accessibilityLabel }: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.hairline,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
}
