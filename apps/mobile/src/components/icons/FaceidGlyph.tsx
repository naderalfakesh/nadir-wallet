import React from "react";
import { G, Path } from "react-native-svg";

export function FaceidGlyph() {
  return (
    <G>
      <Path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <Path d="M9 9.5v1.5M15 9.5v1.5M12 9.5v3l-1 1M9.5 15s1 1.2 2.5 1.2S14.5 15 14.5 15" />
    </G>
  );
}
