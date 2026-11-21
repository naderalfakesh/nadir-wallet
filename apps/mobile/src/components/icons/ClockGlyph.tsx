import React from "react";
import { Circle, G, Path } from "react-native-svg";

export function ClockGlyph() {
  return (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 7.5V12l3 2" />
    </G>
  );
}
