import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme";

interface PinDotsProps {
  count?: number;
  filled: number;
  error?: boolean;
  shake?: boolean;
}

export function PinDots({ count = 6, filled, error, shake }: PinDotsProps) {
  const theme = useTheme();
  const [offset] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!shake) return;
    Animated.sequence([
      Animated.timing(offset, { toValue: -9, duration: 60, useNativeDriver: true }),
      Animated.timing(offset, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(offset, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(offset, { toValue: 5, duration: 60, useNativeDriver: true }),
      Animated.timing(offset, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shake, offset]);

  return (
    <Animated.View style={[styles.row, { transform: [{ translateX: offset }] }]}>
      {Array.from({ length: count }).map((_, i) => {
        const on = i < filled;
        const border = error ? theme.colors.neg : on ? theme.colors.accent : theme.colors.surface3;
        const fill = error ? theme.colors.neg : on ? theme.colors.accent : "transparent";
        return (
          <View key={i} style={[styles.dot, { borderColor: border, backgroundColor: fill }]} />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 16, justifyContent: "center" },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
});
