import React from "react";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { useTheme } from "@/theme";
import { CHART_WIDTH, chartPoints, linePath } from "./chartGeometry";

interface SparklineProps {
  data: number[];
  up?: boolean;
  height?: number;
  fill?: boolean;
  stroke?: number;
}

export function Sparkline({
  data,
  up = true,
  height = 96,
  fill = true,
  stroke = 2.5,
}: SparklineProps) {
  const { colors } = useTheme();
  const h = height;
  const pts = chartPoints(data, h);
  const d = linePath(pts);
  const area = `${d} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;
  const col = up ? colors.accent : colors.neg;
  const last = pts[pts.length - 1];
  const gid = up ? "spark-up" : "spark-down";

  return (
    <Svg width="100%" height={h} viewBox={`0 0 ${CHART_WIDTH} ${h}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={col} stopOpacity={0.28} />
          <Stop offset="100%" stopColor={col} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {fill && <Path d={area} fill={`url(#${gid})`} />}
      <Path
        d={d}
        fill="none"
        stroke={col}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={last[0]} cy={last[1]} r={3.5} fill={col} />
    </Svg>
  );
}
