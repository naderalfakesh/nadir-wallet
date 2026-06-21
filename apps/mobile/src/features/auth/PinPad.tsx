import React, { useEffect, useState } from "react";
import { Animated, Pressable, View } from "react-native";
import { useTheme } from "@/theme";
import { AppText, Icon } from "@/components";

export function PinDots({
  count = 6,
  filled,
  error,
  shake,
}: {
  count?: number;
  filled: number;
  error?: boolean;
  shake?: boolean;
}) {
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
    <Animated.View
      style={{ flexDirection: "row", gap: 16, justifyContent: "center", transform: [{ translateX: offset }] }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const on = i < filled;
        const border = error ? theme.colors.neg : on ? theme.colors.accent : theme.colors.surface3;
        const fill = error ? theme.colors.neg : on ? theme.colors.accent : "transparent";
        return (
          <View
            key={i}
            style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: border, backgroundColor: fill }}
          />
        );
      })}
    </Animated.View>
  );
}

export function PinKeypad({
  onKey,
  onBiometric,
  biometric,
}: {
  onKey: (key: string) => void;
  onBiometric?: () => void;
  biometric?: boolean;
}) {
  const theme = useTheme();
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", biometric ? "bio" : "", "0", "del"];

  return (
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", maxWidth: 280, alignSelf: "center", width: "100%" }}
    >
      {keys.map((k, i) => {
        if (k === "") return <View key={i} style={{ width: "33.33%", height: 64 }} />;
        const isAction = k === "del" || k === "bio";
        return (
          <View key={i} style={{ width: "33.33%", padding: 5 }}>
            <Pressable
              onPress={() => (k === "bio" ? onBiometric?.() : onKey(k))}
              accessibilityRole="button"
              accessibilityLabel={k === "del" ? "Delete" : k === "bio" ? "Use Face ID" : k}
              style={({ pressed }) => ({
                height: 64,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isAction ? "transparent" : theme.colors.surface,
                borderWidth: isAction ? 0 : 1,
                borderColor: theme.colors.hairline,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              {k === "del" ? (
                <Icon name="chevronL" size={26} />
              ) : k === "bio" ? (
                <Icon name="faceid" size={28} color={theme.colors.accent} />
              ) : (
                <AppText weight="semibold" size={26}>
                  {k}
                </AppText>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
