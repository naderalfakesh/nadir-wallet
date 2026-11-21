import React from "react";
import Svg from "react-native-svg";
import { useTheme } from "@/theme";
import { iconGlyphs, type IconName } from "./icons";

export type { IconName } from "./icons";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
}

export function Icon({ name, size = 22, stroke = 2, color }: IconProps) {
  const theme = useTheme();
  const Glyph = iconGlyphs[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? theme.colors.text}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Glyph />
    </Svg>
  );
}
