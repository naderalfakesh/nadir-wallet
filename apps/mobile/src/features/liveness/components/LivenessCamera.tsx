import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera, useFrameOutput } from "react-native-vision-camera";
import { createSynchronizable, scheduleOnRN } from "react-native-worklets";
import { createFaceLiveness } from "@nadir-wallet/face-liveness";
import { AppText, Icon } from "@/components";
import { tryCreateNative } from "@/features/camera/cameraStatus";
import { CameraStatusPanel } from "@/features/camera/components/CameraStatusPanel";
import { useCameraAccess } from "@/features/camera/useCameraAccess";
import { useTranslation } from "@/i18n/useTranslation";
import { useTheme } from "@/theme";
import { FRAME_STRIDE } from "../config";
import type { LivenessFlowProps } from "../liveness.types";
import { getChallengeProgress, getLivenessPrompt, isCameraActivePhase } from "../liveness.utils";
import { useLivenessChallenge } from "../useLivenessChallenge";
import { useLivenessResultFeedback } from "../useLivenessResultFeedback";
import { BottomPromptPanel } from "./BottomPromptPanel";
import { FaceMaskOverlay } from "./FaceMaskOverlay";
import { LivenessHeader } from "./LivenessHeader";
import { ResultBadge } from "./ResultBadge";

// Reuse the detector across visits so an in-flight frame keeps a valid native object.
let sharedPlugin: ReturnType<typeof createFaceLiveness> | null = null;
function getFaceDetector() {
  return (sharedPlugin ??= tryCreateNative(createFaceLiveness));
}

export function LivenessCamera({ mode, onPass, onCancel }: LivenessFlowProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, process, reset } = useLivenessChallenge();
  const [plugin] = useState(getFaceDetector);
  const { device, status, askPermission, markFailed } = useCameraAccess("front", plugin !== null);
  const { badgeStyle, promptStyle, resetLogged } = useLivenessResultFeedback(state.phase);

  const [frameTick] = useState(() => createSynchronizable(0, { fixedType: true }));
  const frameOutput = useFrameOutput({
    pixelFormat: "yuv",
    onFrame(frame) {
      "worklet";
      try {
        if (plugin == null) return;
        const tick = (frameTick.getDirty() + 1) % FRAME_STRIDE;
        frameTick.setDirty(tick);
        if (tick === 0) {
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
    resetLogged();
    reset();
  };

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

      {ready && (
        <FaceMaskOverlay fit={state.faceFit} phase={state.phase} progress={challengeProgress} />
      )}

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  badge: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  prompt: {
    textAlign: "center",
  },
});
