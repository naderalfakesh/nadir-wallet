import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { haptics } from "@/services/device/haptics";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { AppText } from "./Text";

interface SegmentedProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  small?: boolean;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  small,
}: SegmentedProps<T>) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const on = opt === value;
        return (
          <Pressable
            key={opt}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (on) return;
              haptics.selection();
              onChange(opt);
            }}
            style={[
              styles.option,
              {
                height: small ? 30 : 36,
                backgroundColor: on ? theme.colors.surface3 : "transparent",
              },
            ]}
          >
            <AppText
              weight="semibold"
              size={small ? 12.5 : 13.5}
              color={on ? theme.colors.text : theme.colors.textFaint}
            >
              {opt}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface2,
      borderRadius: 12,
      padding: 3,
      gap: 2,
    },
    option: {
      flex: 1,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },
  });
