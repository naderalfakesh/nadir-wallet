import React from "react";
import { Circle, G } from "react-native-svg";

export function MoreGlyph() {
  return (
    <G>
      <Circle cx={6} cy={12} r={1.4} />
      <Circle cx={12} cy={12} r={1.4} />
      <Circle cx={18} cy={12} r={1.4} />
    </G>
  );
}
