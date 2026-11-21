import { useEffect, useRef } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useApp } from "@/providers/AppProvider";
import { haptics } from "@/services/device/haptics";
import type { LivenessPhase } from "./liveness.types";

export function useLivenessResultFeedback(phase: LivenessPhase) {
  const { logEvent } = useApp();
  const loggedRef = useRef(false);

  const badgeScale = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (phase === "passed") {
      if (!loggedRef.current) {
        loggedRef.current = true;
        logEvent("liveness_pass");
        haptics.success();
      }
      badgeScale.value = withSpring(1, { damping: 11, stiffness: 140 });
    } else if (phase === "failed") {
      if (!loggedRef.current) {
        loggedRef.current = true;
        logEvent("liveness_fail");
        haptics.error();
      }
      shakeX.value = withSequence(
        withTiming(-9, { duration: 55 }),
        withTiming(9, { duration: 55 }),
        withTiming(-6, { duration: 55 }),
        withTiming(0, { duration: 55 }),
      );
    } else {
      badgeScale.value = 0;
    }
  }, [badgeScale, logEvent, shakeX, phase]);

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgeScale.value }] }));
  const promptStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  const resetLogged = () => {
    loggedRef.current = false;
  };

  return { badgeStyle, promptStyle, resetLogged };
}
