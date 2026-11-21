import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { haptics } from "@/services/device/haptics";
import { useTheme, useThemedStyles, type Theme } from "@/theme";

interface ToggleProps {
  label?: string;
  testID?: string;
  on: boolean;
  onChange: () => void;
}

export function Toggle({ label, on, onChange, testID }: ToggleProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onChange();
      }}
      accessibilityRole="switch"
      accessibilityLabel={label}
      testID={testID}
      accessibilityState={{ checked: on }}
      style={[
        styles.track,
        {
          backgroundColor: on ? theme.colors.accent : theme.colors.surface3,
          alignItems: on ? "flex-end" : "flex-start",
        },
      ]}
    >
      <View style={styles.knob} />
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    track: {
      width: 50,
      height: 30,
      borderRadius: 99,
      padding: 3,
    },
    knob: {
      width: 24,
      height: 24,
      borderRadius: 12,
      // White knob in both schemes - the standard switch look; it leans on
      // the shadow for separation on the light off-state track.
      backgroundColor: "#fff",
      ...theme.shadows.toggleKnob,
    },
  });
