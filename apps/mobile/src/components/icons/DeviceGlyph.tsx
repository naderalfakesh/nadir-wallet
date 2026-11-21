import React from "react";
import { G, Path, Rect } from "react-native-svg";

export function DeviceGlyph() {
  return (
    <G>
      <Rect x={6} y={3} width={12} height={18} rx={3} />
      <Path d="M10.5 18h3" />
    </G>
  );
}
