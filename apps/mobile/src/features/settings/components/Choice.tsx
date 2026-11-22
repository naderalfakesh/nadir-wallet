import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface ChoiceProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string; testID?: string }[];
  onChange: (v: T) => void;
}

export function Choice<T extends string>({ label, value, options, onChange }: ChoiceProps<T>) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.root}>
      <AppText weight="semibold" size={12.5} muted>
        {label}
      </AppText>
      <View style={styles.track}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              testID={o.testID}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={[
                styles.option,
                { backgroundColor: on ? theme.colors.surface3 : "transparent" },
              ]}
            >
              <AppText
                weight="semibold"
                size={12.5}
                color={on ? theme.colors.text : theme.colors.textFaint}
              >
                {o.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      gap: 8,
    },
    track: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface2,
      borderRadius: 12,
      padding: 3,
      gap: 2,
    },
    option: {
      flex: 1,
      height: 32,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },
  });
