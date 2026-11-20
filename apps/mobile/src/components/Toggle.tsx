import { haptics } from "@/services/device/haptics";
import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/theme";

interface ToggleProps {
  label?: string;
  testID?: string;
  on: boolean;
  onChange: () => void;
}

export function Toggle({ label, on, onChange, testID }: ToggleProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => { haptics.selection(); onChange(); }}
      accessibilityRole="switch"
      accessibilityLabel={label}
      testID={testID}
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
          // White knob in both schemes - the standard switch look; it leans on
          // the shadow for separation on the light off-state track.
          backgroundColor: "#fff",
          ...theme.shadows.toggleKnob,
        }}
      />
    </Pressable>
  );
}
