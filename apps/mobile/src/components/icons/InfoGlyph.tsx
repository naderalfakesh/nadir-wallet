import React from "react";
import { Circle, G, Path } from "react-native-svg";

export function InfoGlyph() {
  return (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 11v5M12 8v.2" />
    </G>
  );
}
