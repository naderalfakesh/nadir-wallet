import React from "react";
import { Circle, G, Path } from "react-native-svg";

export function SettingsGlyph() {
  return (
    <G>
      <Circle cx={12} cy={12} r={3.1} />
      <Path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1" />
    </G>
  );
}
