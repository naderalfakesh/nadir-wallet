import React from "react";
import { Circle, G, Path } from "react-native-svg";

export function RadarGlyph() {
  return (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={4} />
      <Path d="M12 12 18 6" />
    </G>
  );
}
