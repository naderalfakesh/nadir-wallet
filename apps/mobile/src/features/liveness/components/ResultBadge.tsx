import React from "react";
import { StyleSheet, View } from "react-native";

interface ResultBadgeProps {
  visible: boolean;
  children: React.ReactNode;
}

export function ResultBadge({ visible, children }: ResultBadgeProps) {
  if (!visible) return null;

  return (
    <View style={styles.badgeWrap} pointerEvents="none">
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  badgeWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
