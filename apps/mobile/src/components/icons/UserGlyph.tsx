import React from "react";
import { Circle, G, Path } from "react-native-svg";

export function UserGlyph() {
  return (
    <G>
      <Circle cx={12} cy={8.5} r={3.7} />
      <Path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </G>
  );
}
