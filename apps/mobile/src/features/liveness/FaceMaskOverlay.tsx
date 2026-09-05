import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme, alpha } from "@/theme";
import { OVAL } from "./config";
import type { FaceFit, LivenessPhase } from "./liveness.types";

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

/** Ramanujan approximation - plenty accurate for a dash ring. */
function ellipsePerimeter(rx: number, ry: number): number {
  const h = (rx - ry) ** 2 / (rx + ry) ** 2;
  return Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

interface Props {
  fit: FaceFit;
  phase: LivenessPhase;
  /** 0..1 - completed challenges over total. */
  progress: number;
}

/**
 * Dims everything outside an egg-shaped cutout and draws two strokes around
 * it: a state-colored guide (gray → warn → accent/pos) and an animated
 * progress ring that fills as challenges complete.
 */
export function FaceMaskOverlay({ fit, phase, progress }: Props) {
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();

  const cx = OVAL.cx * width;
  const cy = OVAL.cy * height;
  const rx = OVAL.rx * width;
  const ry = OVAL.ry * height;

  const mask =
    `M0 0H${width}V${height}H0Z` +
    ` M${cx - rx} ${cy}` +
    ` a${rx} ${ry} 0 1 0 ${2 * rx} 0` +
    ` a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;

  const ringRx = rx + 10;
  const ringRy = ry + 10;
  const perimeter = ellipsePerimeter(ringRx, ringRy);

  const animatedProgress = useSharedValue(progress);
  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 450 });
  }, [progress, animatedProgress]);
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: perimeter * (1 - animatedProgress.value),
  }));

  const guideColor =
    phase === "passed"
      ? colors.pos
      : phase === "failed"
        ? colors.neg
        : fit === "ok"
          ? colors.accent
          : fit === "outside"
            ? colors.warn
            : alpha("#FFFFFF", 0.45);

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0 }}
      pointerEvents="none"
    >
      <Path d={mask} fill={alpha("#000000", 0.6)} fillRule="evenodd" />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} stroke={guideColor} strokeWidth={2.5} fill="none" />
      <AnimatedEllipse
        cx={cx}
        cy={cy}
        rx={ringRx}
        ry={ringRy}
        stroke={phase === "failed" ? colors.neg : colors.pos}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${perimeter}`}
        animatedProps={ringProps}
      />
    </Svg>
  );
}
