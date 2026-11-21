import React from "react";
import { Circle, G, Path } from "react-native-svg";

export function EyeGlyph() {
  return (
    <G>
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <Circle cx={12} cy={12} r={2.6} />
    </G>
  );
}
