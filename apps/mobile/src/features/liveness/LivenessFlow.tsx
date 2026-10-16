import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera, useCameraDevice, useCameraPermission, useFrameOutput } from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { createFaceLiveness } from "@nadir-wallet/face-liveness";
import { AppText, Icon } from "@/components";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { useTheme } from "@/theme";
import { CameraErrorBoundary } from "@/features/camera/CameraErrorBoundary";
import { CameraStatusPanel } from "@/features/camera/CameraStatusPanel";
import { cameraStatus, tryCreateNative } from "@/features/camera/cameraStatus";
import { FaceMaskOverlay } from "./FaceMaskOverlay";
import { useLivenessChallenge } from "./useLivenessChallenge";
import { FRAME_STRIDE } from "./config";
import { BottomPromptPanel, LivenessHeader, ResultBadge } from "./LivenessFlow.parts";
import { livenessStyles as styles } from "./LivenessFlow.styles";
import { getChallengeProgress, getLivenessPrompt, isCameraActivePhase } from "./liveness.utils";
import type { LivenessFlowProps } from "./liveness.types";

/**
 * Any camera or native failure ends in an error panel and never calls
 * `onPass`, so a broken camera can't stand in for a passed check.
 */
export function LivenessFlow(props: LivenessFlowProps) {
  return (
    <CameraErrorBoundary fallback={<LivenessUnavailable onCancel={props.onCancel} />}>
      <LivenessCamera {...props} />
    </CameraErrorBoundary>
  );
}

function LivenessUnavailable({ onCancel }: { onCancel: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <CameraStatusPanel feature="liveness" status="unavailable" onRequestPermission={() => undefined} />
      <LivenessHeader topInset={insets.top} phase="align" index={0} total={0} onCancel={onCancel} />
    </View>
  );
}

function LivenessCamera({ mode, onPass, onCancel }: LivenessFlowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { logEvent } = useApp();
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");
  const { state, process, reset } = useLivenessChallenge();
  const plugin = useMemo(() => tryCreateNative(createFaceLiveness), []);
  const [failed, setFailed] = useState(false);
  const markFailed = useCallback(() => setFailed(true), []);
  const loggedRef = useRef(false);

  const badgeScale = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const status = cameraStatus({
    nativeReady: plugin !== null,
    failed,
    hasPermission,
    canRequestPermission,
    hasDevice: device != null,
  });

  const askPermission = useCallback(() => {
    requestPermission().catch(markFailed);
  }, [requestPermission, markFailed]);

  // Only a not-yet-asked permission prompts on its own; a denied one waits for the user.
  useEffect(() => {
    if (status === "request") askPermission();
  }, [status, askPermission]);

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
        if (plugin == null) return;
        const globalState = globalThis as Record<string, unknown>;
        const tick = ((globalState.__livenessTick as number) ?? 0) + 1;
        globalState.__livenessTick = tick;
        if (tick % FRAME_STRIDE === 0) {
          const observation = plugin.detect(frame);
          scheduleOnRN(process, observation);
        }
      } catch {
        // A frame the detector can't read stops the check instead of being skipped silently.
        scheduleOnRN(markFailed);
      } finally {
        frame.dispose();
      }
    },
  });

  const ready = status === "ready" && device != null;
  const isCameraRunning = ready && isCameraActivePhase(state.phase);
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
      {ready ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isCameraRunning}
          outputs={[frameOutput]}
          onError={markFailed}
        />
      ) : (
        <CameraStatusPanel
          feature="liveness"
          status={status === "ready" ? "noDevice" : status}
          onRequestPermission={askPermission}
        />
      )}

      {ready && <FaceMaskOverlay fit={state.faceFit} phase={state.phase} progress={challengeProgress} />}

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

      {ready && (
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
