import React from "react";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { useTheme } from "@/theme";

// 24x24 line icons, single stroke, inheriting color from the parent Svg.
const paths: Record<string, React.ReactNode> = {
  home: <Path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" />,
  activity: <Path d="M4 12h3.5l2-6 4 13 2.5-7H20" />,
  shield: <Path d="M12 3.5 5.5 6v5.5c0 4 2.8 7 6.5 8.5 3.7-1.5 6.5-4.5 6.5-8.5V6L12 3.5Z" />,
  settings: (
    <G>
      <Circle cx={12} cy={12} r={3.1} />
      <Path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1" />
    </G>
  ),
  send: <Path d="M6 18 18 6M9 6h9v9" />,
  receive: <Path d="M18 6 6 18M15 18H6V9" />,
  swap: <Path d="M7 7h11l-3.2-3.2M17 17H6l3.2 3.2" />,
  scan: (
    <G>
      <Path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <Path d="M4 12h16" />
    </G>
  ),
  qr: (
    <G>
      <Rect x={4} y={4} width={6} height={6} rx={1} />
      <Rect x={14} y={4} width={6} height={6} rx={1} />
      <Rect x={4} y={14} width={6} height={6} rx={1} />
      <Path d="M14 14h2v2M20 14v6h-6M18 18h2" />
    </G>
  ),
  copy: (
    <G>
      <Rect x={9} y={9} width={11} height={11} rx={2.5} />
      <Path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" />
    </G>
  ),
  check: <Path d="M5 12.5 10 17.5 19 7" />,
  checkCircle: (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M8.3 12.2 11 14.8 15.8 9.4" />
    </G>
  ),
  chevronR: <Path d="M9 5l7 7-7 7" />,
  chevronL: <Path d="M15 5l-7 7 7 7" />,
  chevronD: <Path d="M5 9l7 7 7-7" />,
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  eye: (
    <G>
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <Circle cx={12} cy={12} r={2.6} />
    </G>
  ),
  eyeOff: (
    <G>
      <Path d="M4 4l16 16" />
      <Path d="M9.5 5.9A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.8 3.4M6.2 7.8A15.7 15.7 0 0 0 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 3.3-.6" />
      <Path d="M9.9 10.2a2.6 2.6 0 0 0 3.7 3.7" />
    </G>
  ),
  lock: (
    <G>
      <Rect x={5} y={10.5} width={14} height={9.5} rx={2.5} />
      <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </G>
  ),
  faceid: (
    <G>
      <Path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <Path d="M9 9.5v1.5M15 9.5v1.5M12 9.5v3l-1 1M9.5 15s1 1.2 2.5 1.2S14.5 15 14.5 15" />
    </G>
  ),
  key: (
    <G>
      <Circle cx={8} cy={8} r={3.5} />
      <Path d="M10.5 10.5 20 20M16 16l2-2M18.5 18.5l1.5-1.5" />
    </G>
  ),
  alert: (
    <G>
      <Path d="M12 4 21 19H3L12 4Z" />
      <Path d="M12 10v4M12 16.5v.2" />
    </G>
  ),
  info: (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 11v5M12 8v.2" />
    </G>
  ),
  link: <Path d="M9.5 14.5 14.5 9.5M10 7l1.5-1.5a3.5 3.5 0 0 1 5 5L15 12M14 17l-1.5 1.5a3.5 3.5 0 0 1-5-5L9 12" />,
  external: <Path d="M14 5h5v5M19 5l-8 8M17 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 5 18V8.5A1.5 1.5 0 0 1 6.5 7H11" />,
  arrowDownLeft: <Path d="M16 8 8 16M8 9.5V16h6.5" />,
  arrowUpRight: <Path d="M8 16 16 8M9.5 8H16v6.5" />,
  search: (
    <G>
      <Circle cx={11} cy={11} r={6.5} />
      <Path d="M16 16l4 4" />
    </G>
  ),
  more: (
    <G>
      <Circle cx={6} cy={12} r={1.4} />
      <Circle cx={12} cy={12} r={1.4} />
      <Circle cx={18} cy={12} r={1.4} />
    </G>
  ),
  trend: <Path d="M4 16 9 11l3 3 8-8M16 6h4v4" />,
  bell: <Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5h-15L6 16ZM10 19a2 2 0 0 0 4 0" />,
  refresh: <Path d="M19 8a7 7 0 1 0 1.5 6M19 4v4h-4" />,
  globe: (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" />
    </G>
  ),
  clock: (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 7.5V12l3 2" />
    </G>
  ),
  user: (
    <G>
      <Circle cx={12} cy={8.5} r={3.7} />
      <Path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </G>
  ),
  fingerprint: (
    <Path d="M7 11a5 5 0 0 1 9.5-2M5.5 14.5A12 12 0 0 0 6 18M9 9.8A3 3 0 0 1 15 11c0 3 .4 5 1 6.5M12 11v2.5c0 2 .4 3.8 1.2 5.2M9 13c0 3 .6 4.8 1.4 6.3" />
  ),
  backup: (
    <G>
      <Path d="M12 4v9M12 13l-3-3M12 13l3-3" />
      <Path d="M5 15v2.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V15" />
    </G>
  ),
  paste: (
    <G>
      <Rect x={6} y={5} width={12} height={15} rx={2} />
      <Path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 11h6M9 14h4" />
    </G>
  ),
  power: <Path d="M12 4v8M7.5 7a7 7 0 1 0 9 0" />,
  wifiOff: (
    <G>
      <Path d="M3 4l18 18" />
      <Path d="M5 12.5a11 11 0 0 1 3.2-2.1M2 8.8A16 16 0 0 1 7 6M12 6c3.4 0 6.5 1.1 9 3M16.5 10.4a11 11 0 0 1 2.5 2.1M8.6 16.1A6 6 0 0 1 12 15c1.3 0 2.5.4 3.4 1.1" />
      <Path d="M12 19.5v.2" />
    </G>
  ),
  device: (
    <G>
      <Rect x={6} y={3} width={12} height={18} rx={3} />
      <Path d="M10.5 18h3" />
    </G>
  ),
  radar: (
    <G>
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={4} />
      <Path d="M12 12 18 6" />
    </G>
  ),
};

export type IconName = keyof typeof paths;

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
}

export function Icon({ name, size = 22, stroke = 2, color }: IconProps) {
  const theme = useTheme();
  const child = paths[name];
  if (!child) return null;
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
      {child}
    </Svg>
  );
}
