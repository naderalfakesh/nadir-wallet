import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme";

interface ToggleProps {
  on: boolean;
  onChange: () => void;
}

export function Toggle({ on, onChange }: ToggleProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onChange}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      style={{
        width: 50,
        height: 30,
        borderRadius: 99,
        backgroundColor: on ? theme.colors.accent : theme.colors.surface3,
        padding: 3,
        alignItems: on ? "flex-end" : "flex-start",
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          // White knob in both schemes — the standard switch look; it leans on
          // the shadow for separation on the light off-state track.
          backgroundColor: "#fff",
          ...theme.shadows.toggleKnob,
        }}
      />
    </Pressable>
  );
}
