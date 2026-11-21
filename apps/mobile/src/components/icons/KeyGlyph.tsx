import React from "react";
import { Circle, G, Path } from "react-native-svg";

export function KeyGlyph() {
  return (
    <G>
      <Circle cx={8} cy={8} r={3.5} />
      <Path d="M10.5 10.5 20 20M16 16l2-2M18.5 18.5l1.5-1.5" />
    </G>
  );
}
