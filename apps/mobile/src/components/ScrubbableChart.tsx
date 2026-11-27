import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import {
  GestureDetector,
  useLongPressGesture,
  usePanGesture,
  useSimultaneousGestures,
} from "react-native-gesture-handler";
import { haptics } from "@/services/device/haptics";
import { alpha, useTheme } from "@/theme";
import { chartPoints, nearestIndex, pointToPixels } from "./chartGeometry";
import { Sparkline } from "./Sparkline";

interface ScrubbableChartProps {
  data: number[];
  up?: boolean;
  height?: number;
  onScrub?: (index: number | null) => void;
}

const DOT = 11;

// Horizontal drag or hold scrubs; vertical drag fails the pan so ScrollView still scrolls.
export function ScrubbableChart({ data, up = true, height = 96, onScrub }: ScrubbableChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const live = useRef({ width: 0, count: data.length, onScrub, index: null as number | null });
  const touches = useRef(new Set<"pan" | "hold">());
  const count = data.length;
  useEffect(() => {
    live.current.width = width;
    live.current.count = count;
    live.current.onScrub = onScrub;
  }, [width, count, onScrub]);

  const move = useCallback((x: number) => {
    const { width: w, count } = live.current;
    if (!w) return;
    const index = nearestIndex(x, count, w);
    if (index === live.current.index) return;
    if (live.current.index !== null) haptics.selection();
    live.current.index = index;
    setActive(index);
    live.current.onScrub?.(index);
  }, []);

  const start = useCallback(
    (kind: "pan" | "hold", x: number) => {
      touches.current.add(kind);
      move(x);
    },
    [move],
  );

  const stop = useCallback((kind: "pan" | "hold") => {
    touches.current.delete(kind);
    if (touches.current.size > 0 || live.current.index === null) return;
    live.current.index = null;
    setActive(null);
    live.current.onScrub?.(null);
  }, []);

  const pan = usePanGesture({
    runOnJS: true,
    activeOffsetX: [-6, 6],
    failOffsetY: [-10, 10],
    onActivate: ({ x }) => start("pan", x),
    onUpdate: ({ x }) => move(x),
    onFinalize: () => stop("pan"),
  });
  const hold = useLongPressGesture({
    runOnJS: true,
    minDuration: 180,
    maxDistance: 10,
    onActivate: ({ x }) => start("hold", x),
    onFinalize: () => stop("hold"),
  });
  const gesture = useSimultaneousGestures(pan, hold);

  const cursor = useMemo(() => {
    if (active === null || !width || active >= data.length) return null;
    return pointToPixels(chartPoints(data, height)[active], width);
  }, [active, data, height, width]);

  const color = up ? colors.accent : colors.neg;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <GestureDetector gesture={gesture}>
      <View onLayout={onLayout} style={{ height }}>
        <Sparkline data={data} up={up} height={height} />
        {cursor && (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <View
              style={[
                styles.line,
                { left: cursor.x - 0.5, height, backgroundColor: alpha(color, 0.45) },
              ]}
            />
            <View
              style={[
                styles.dot,
                {
                  left: cursor.x - DOT / 2,
                  top: cursor.y - DOT / 2,
                  backgroundColor: color,
                  borderColor: colors.bg,
                },
              ]}
            />
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  line: {
    position: "absolute",
    top: 0,
    width: 1,
  },
  dot: {
    position: "absolute",
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
  },
});
