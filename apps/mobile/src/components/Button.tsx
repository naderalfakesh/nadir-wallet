import React from "react";
import { Pressable, View, type ViewStyle, type StyleProp } from "react-native";
import { useTheme } from "@/theme";
import { AppText } from "./Text";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "ghost" | "soft";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
  height,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const { colors } = theme;

  const bg =
    variant === "primary"
      ? colors.accent
      : variant === "ghost"
        ? colors.surface2
        : colors.accentDim;
  const fg =
    variant === "primary" ? colors.accentInk : variant === "ghost" ? colors.text : colors.accent;
  const h = height ?? (variant === "soft" ? 52 : 56);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          height: h,
          borderRadius: theme.radius.btn,
          backgroundColor: bg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          paddingHorizontal: 18,
        },
        variant === "primary" && !disabled && theme.shadows.accentGlow,
        disabled && { opacity: 0.4 },
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {icon ? (
        <View>
          <Icon name={icon} size={20} color={fg} />
        </View>
      ) : null}
      <AppText weight="semibold" size={16} color={fg}>
        {label}
      </AppText>
    </Pressable>
  );
}
