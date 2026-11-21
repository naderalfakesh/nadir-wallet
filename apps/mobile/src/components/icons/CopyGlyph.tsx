import React from "react";
import { G, Path, Rect } from "react-native-svg";

export function CopyGlyph() {
  return (
    <G>
      <Rect x={9} y={9} width={11} height={11} rx={2.5} />
      <Path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" />
    </G>
  );
}
