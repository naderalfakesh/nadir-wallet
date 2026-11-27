import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme, useThemedStyles, type Theme } from "@/theme";
import { SEND_STEPS } from "../send.constants";

interface SendProgressBarProps {
  stepIndex: number;
}

export function SendProgressBar({ stepIndex }: SendProgressBarProps) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.progress}>
      {SEND_STEPS.map((item, index) => (
        <View
          key={item}
          style={[
            styles.track,
            { backgroundColor: stepIndex >= index ? theme.colors.accent : theme.colors.surface3 },
          ]}
        />
      ))}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    progress: {
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: theme.spacing.pad,
      paddingBottom: 8,
    },
    track: {
      flex: 1,
      height: 3,
      borderRadius: 9,
    },
  });
