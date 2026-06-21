import React from "react";
import { Animated, View } from "react-native";
import { Icon } from "@/components";
import { useTheme } from "@/theme";

interface BiometricBadgeProps {
  pulse: Animated.Value;
  active: boolean;
  /** Diameter of the pulsing ring; the inner Face ID tile stays a fixed 96. */
  ringSize?: number;
}

export function BiometricBadge({ pulse, active, ringSize = 96 }: BiometricBadgeProps) {
  const theme = useTheme();

  return (
    <View style={{ width: ringSize, height: ringSize, alignItems: "center", justifyContent: "center" }}>
      {active && (
        <Animated.View
          style={{
            position: "absolute",
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            backgroundColor: theme.colors.accent,
            opacity: 0.18,
            transform: [{ scale: pulse }],
          }}
        />
      )}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 30,
          backgroundColor: theme.colors.accentDim,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="faceid" size={50} stroke={1.8} color={theme.colors.accent} />
      </View>
    </View>
  );
}
