import React from "react";
import { G, Path } from "react-native-svg";

export function BackupGlyph() {
  return (
    <G>
      <Path d="M12 4v9M12 13l-3-3M12 13l3-3" />
      <Path d="M5 15v2.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V15" />
    </G>
  );
}
