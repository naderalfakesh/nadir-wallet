import { useEffect, useState } from "react";
import { Animated } from "react-native";

/**
 * The looping scale "pulse" behind the biometric icon while a scan is running.
 * Returns the shared value to drive the ring's transform.
 */
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
