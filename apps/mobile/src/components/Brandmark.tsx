import React from "react";
import Svg, { Circle, Line } from "react-native-svg";
import { useTheme } from "@/theme";

// Ring + a plumb line down to a point resting at its lowest position - the
// "nadir". Same geometry as the app icon and splash: heavy strokes and no faint
// details so it stays legible small. The halo matches the backdrop so the point
// reads as separate from the ring.
export function Brandmark({ size = 64, backdrop }: { size?: number; backdrop?: string }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx={32} cy={30} r={19} stroke={colors.accent} strokeWidth={5} />
      <Line
        x1={32}
        y1={18}
        x2={32}
        y2={46}
        stroke={colors.accent}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeOpacity={0.55}
      />
      <Circle cx={32} cy={49} r={9.5} fill={backdrop ?? colors.bg} />
      <Circle cx={32} cy={49} r={7} fill={colors.accent} />
    </Svg>
  );
}
