import React from "react";
import { G, Path, Rect } from "react-native-svg";

export function PasteGlyph() {
  return (
    <G>
      <Rect x={6} y={5} width={12} height={15} rx={2} />
      <Path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 11h6M9 14h4" />
    </G>
  );
}
