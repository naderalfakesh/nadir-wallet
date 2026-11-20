import React from "react";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/theme";

// A rounded hexagon (a block) with the initial N cut out of it. Same geometry
// as the app icon and splash. The N is drawn in the backdrop colour, so pass
// `backdrop` when the mark sits on something other than the screen background.
export function Brandmark({ size = 64, backdrop }: { size?: number; backdrop?: string }) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Path
        d="M50 22.29L74 36.14V63.86L50 77.71L26 63.86V36.14Z"
        fill={colors.accent}
        stroke={colors.accent}
        strokeWidth={13}
        strokeLinejoin="round"
      />
      <Path
        d="M39 63V37L61 63V37"
        stroke={backdrop ?? colors.bg}
        strokeWidth={7.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
