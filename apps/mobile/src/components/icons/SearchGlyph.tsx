import React from "react";
import { Circle, G, Path } from "react-native-svg";

export function SearchGlyph() {
  return (
    <G>
      <Circle cx={11} cy={11} r={6.5} />
      <Path d="M16 16l4 4" />
    </G>
  );
}
