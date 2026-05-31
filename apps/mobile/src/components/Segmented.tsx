import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme";
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
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.colors.surface2,
        borderRadius: 12,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((opt) => {
        const on = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={{
              flex: 1,
              height: small ? 30 : 36,
              borderRadius: 9,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: on ? theme.colors.surface3 : "transparent",
            }}
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
