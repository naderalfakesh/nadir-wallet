import React from "react";
import { G, Path } from "react-native-svg";

export function AlertGlyph() {
  return (
    <G>
      <Path d="M12 4 21 19H3L12 4Z" />
      <Path d="M12 10v4M12 16.5v.2" />
    </G>
  );
}
