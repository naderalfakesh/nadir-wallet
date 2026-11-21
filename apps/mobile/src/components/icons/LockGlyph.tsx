import React from "react";
import { G, Path, Rect } from "react-native-svg";

export function LockGlyph() {
  return (
    <G>
      <Rect x={5} y={10.5} width={14} height={9.5} rx={2.5} />
      <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </G>
  );
}
