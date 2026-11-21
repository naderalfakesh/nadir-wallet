import React from "react";
import { Circle, G, Path } from "react-native-svg";

export function CheckCircleGlyph() {
  return (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M8.3 12.2 11 14.8 15.8 9.4" />
    </G>
  );
}
