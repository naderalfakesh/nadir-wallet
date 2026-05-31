import React from "react";
import Svg, { Circle, Line } from "react-native-svg";
import { useTheme } from "@/theme";

// Ring + a single point at its lowest position — the "nadir".
export function Brandmark({ size = 64 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={32} r={22} stroke={colors.accent} strokeWidth={3} opacity={0.9} />
      <Circle
        cx={32}
        cy={32}
        r={22}
        stroke={colors.accent}
        strokeWidth={3}
        strokeOpacity={0.18}
        strokeDasharray="2 6"
      />
      <Line
        x1={32}
        y1={20}
        x2={32}
        y2={48}
        stroke={colors.accent}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeOpacity={0.55}
      />
      <Circle cx={32} cy={48} r={5.5} fill={colors.accent} />
      <Circle cx={32} cy={24} r={2.4} fill={colors.accent} opacity={0.7} />
    </Svg>
  );
}
