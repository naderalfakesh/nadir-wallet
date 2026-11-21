import React from "react";
import { G, Path, Rect } from "react-native-svg";

export function QrGlyph() {
  return (
    <G>
      <Rect x={4} y={4} width={6} height={6} rx={1} />
      <Rect x={14} y={4} width={6} height={6} rx={1} />
      <Rect x={4} y={14} width={6} height={6} rx={1} />
      <Path d="M14 14h2v2M20 14v6h-6M18 18h2" />
    </G>
  );
}
