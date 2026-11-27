import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Icon } from "@/components";
import { biometryIcon } from "@/services/auth/biometry";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface BiometricBadgeProps {
  pulse: Animated.Value;
  active: boolean;
  ringSize?: number;
}

export function BiometricBadge({ pulse, active, ringSize = 96 }: BiometricBadgeProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.wrap, { width: ringSize, height: ringSize }]}>
      {active && (
        <Animated.View
          style={[
            styles.ring,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              transform: [{ scale: pulse }],
            },
          ]}
        />
      )}
      <View style={styles.tile}>
        <Icon name={biometryIcon()} size={50} stroke={1.8} color={theme.colors.accent} />
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: { alignItems: "center", justifyContent: "center" },
    ring: {
      position: "absolute",
      backgroundColor: theme.colors.accent,
      opacity: 0.18,
    },
    tile: {
      width: 96,
      height: 96,
      borderRadius: 30,
      backgroundColor: theme.colors.accentDim,
      alignItems: "center",
      justifyContent: "center",
    },
  });
