import React from "react";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { useTheme } from "@/theme";

interface SparklineProps {
  data: number[];
  up?: boolean;
  height?: number;
  fill?: boolean;
  stroke?: number;
}

const WIDTH = 320;

export function Sparkline({ data, up = true, height = 96, fill = true, stroke = 2.5 }: SparklineProps) {
  const { colors } = useTheme();
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 4;
  const h = height;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (WIDTH - pad * 2);
    const y = pad + (1 - (v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });

  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  const area = `${d} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;
  const col = up ? colors.accent : colors.neg;
  const last = pts[pts.length - 1];
  const gid = up ? "spark-up" : "spark-down";

  return (
    <Svg width="100%" height={h} viewBox={`0 0 ${WIDTH} ${h}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={col} stopOpacity={0.28} />
          <Stop offset="100%" stopColor={col} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {fill && <Path d={area} fill={`url(#${gid})`} />}
      <Path d={d} fill="none" stroke={col} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last[0]} cy={last[1]} r={3.5} fill={col} />
    </Svg>
  );
}
