import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera, useCameraPermission, useFrameOutput } from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { createFaceLiveness } from "@nadir-wallet/face-liveness";
import { AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useTheme } from "@/theme";
import { FaceMaskOverlay } from "./FaceMaskOverlay";
import { useLivenessChallenge } from "./useLivenessChallenge";
import { FRAME_STRIDE } from "./config";
import { BottomPromptPanel, LivenessHeader, PermissionPanel, ResultBadge } from "./LivenessFlow.parts";
import { livenessStyles as styles } from "./LivenessFlow.styles";
import { getChallengeProgress, getLivenessPrompt, isCameraActivePhase } from "./liveness.utils";
import type { LivenessFlowProps } from "./liveness.types";

export function LivenessFlow({ mode, onPass, onCancel }: LivenessFlowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { logEvent } = useApp();
  const { hasPermission, requestPermission } = useCameraPermission();
  const { state, process, reset } = useLivenessChallenge();
  const plugin = useMemo(() => createFaceLiveness(), []);
  const loggedRef = useRef(false);

  const badgeScale = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (state.phase === "passed") {
      if (!loggedRef.current) {
        loggedRef.current = true;
        logEvent("liveness_pass");
      }
      Vibration.vibrate(40);
      badgeScale.value = withSpring(1, { damping: 11, stiffness: 140 });
    } else if (state.phase === "failed") {
      if (!loggedRef.current) {
        loggedRef.current = true;
        logEvent("liveness_fail");
      }
      Vibration.vibrate([0, 60, 70, 60]);
      shakeX.value = withSequence(
        withTiming(-9, { duration: 55 }),
        withTiming(9, { duration: 55 }),
        withTiming(-6, { duration: 55 }),
        withTiming(0, { duration: 55 }),
      );
    } else {
      badgeScale.value = 0;
    }
  }, [badgeScale, logEvent, shakeX, state.phase]);

  const frameOutput = useFrameOutput({
    pixelFormat: "yuv",
    onFrame(frame) {
      "worklet";
      try {
        const globalState = globalThis as Record<string, unknown>;
        const tick = ((globalState.__livenessTick as number) ?? 0) + 1;
        globalState.__livenessTick = tick;
        if (tick % FRAME_STRIDE === 0) {
          const observation = plugin.detect(frame);
          scheduleOnRN(process, observation);
        }
      } finally {
        frame.dispose();
      }
    },
  });

  const isCameraRunning = isCameraActivePhase(state.phase);
  const hasPassed = state.phase === "passed";
  const hasFailed = state.phase === "failed";
  const challengeProgress = getChallengeProgress(state);
  const currentPrompt = getLivenessPrompt(state, t);
  const totalChallenges = state.challenges.length;

  const retry = () => {
    loggedRef.current = false;
    reset();
  };

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgeScale.value }] }));
  const promptStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  return (
    <View style={styles.root}>
      {hasPermission ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device="front"
          isActive={isCameraRunning}
          outputs={[frameOutput]}
        />
      ) : (
        <PermissionPanel onRequestPermission={requestPermission} />
      )}

      {hasPermission && <FaceMaskOverlay fit={state.faceFit} phase={state.phase} progress={challengeProgress} />}

      <ResultBadge visible={hasPassed}>
        <Animated.View style={[styles.badge, { backgroundColor: colors.pos }, badgeStyle]}>
          <Icon name="check" size={52} stroke={2.6} color="#FFFFFF" />
        </Animated.View>
      </ResultBadge>

      <LivenessHeader
        topInset={insets.top}
        phase={state.phase}
        index={state.index}
        total={totalChallenges}
        onCancel={onCancel}
      />

      {hasPermission && (
        <BottomPromptPanel
          bottomInset={insets.bottom}
          mode={mode}
          prompt={
            <Animated.View style={promptStyle}>
              <AppText weight="bold" size={19} color="#FFFFFF" style={styles.prompt}>
                {currentPrompt}
              </AppText>
            </Animated.View>
          }
          hasPassed={hasPassed}
          hasFailed={hasFailed}
          onRetry={retry}
          onPass={onPass}
          onCancel={onCancel}
        />
      )}
    </View>
  );
}
