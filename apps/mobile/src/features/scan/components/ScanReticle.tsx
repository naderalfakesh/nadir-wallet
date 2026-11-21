import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "@/theme";

type CornerPosition = "tl" | "tr" | "bl" | "br";

const CORNER_EDGES: Record<CornerPosition, ViewStyle> = {
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 14 },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 14,
  },
};

function Corner({ position, color }: { position: CornerPosition; color: string }) {
  return <View style={[styles.corner, { borderColor: color }, CORNER_EDGES[position]]} />;
}

interface ScanReticleProps {
  found: boolean;
}

export function ScanReticle({ found }: ScanReticleProps) {
  const { colors } = useTheme();
  const cornerColor = found ? colors.pos : colors.accent;

  return (
    <View style={styles.reticleWrap} pointerEvents="none">
      <View style={[styles.reticle, { borderColor: found ? colors.pos : "#FFFFFF" }]}>
        <Corner position="tl" color={cornerColor} />
        <Corner position="tr" color={cornerColor} />
        <Corner position="bl" color={cornerColor} />
        <Corner position="br" color={cornerColor} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reticleWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  reticle: {
    width: 240,
    height: 240,
  },
  corner: {
    position: "absolute",
    width: 34,
    height: 34,
  },
});
