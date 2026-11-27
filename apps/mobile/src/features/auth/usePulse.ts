import { useEffect, useState } from "react";
import { Animated } from "react-native";

export function usePulse(active: boolean) {
  const [scale] = useState(() => new Animated.Value(0.9));

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, scale]);

  return scale;
}
