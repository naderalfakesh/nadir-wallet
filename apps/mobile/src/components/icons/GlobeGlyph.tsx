import React from "react";
import { Circle, G, Path } from "react-native-svg";

export function GlobeGlyph() {
  return (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" />
    </G>
  );
}
