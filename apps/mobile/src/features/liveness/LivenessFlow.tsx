import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  Camera,
  useCameraPermission,
  useFrameOutput,
} from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";
import { createFaceLiveness } from "@nadir-wallet/face-liveness";
import { AppText, Button, Icon } from "@/components";
import { useTheme, alpha } from "@/theme";
import { useTranslation } from "@/i18n/useTranslation";
import { useApp } from "@/providers/AppProvider";
import { FaceMaskOverlay } from "./FaceMaskOverlay";
import { useLivenessChallenge } from "./useLivenessChallenge";
import { FRAME_STRIDE } from "./config";

export type LivenessMode = "standalone" | "gate";

interface Props {
  /** "standalone" = Security Center demo; "gate" = a step before a protected action. */
  mode: LivenessMode;
  /** Called when the user confirms a passed check (Done / Continue). */
  onPass: () => void;
  /** Called when the user dismisses (close / cancel). */
  onCancel: () => void;
}

/**
 * The full liveness experience — camera, challenge state machine, oval overlay,
 * and pass/fail panels — decoupled from navigation so it can be a route or be
 * embedded inline as a step-up gate (e.g. inside the send flow).
 */
export function LivenessFlow({ mode, onPass, onCancel }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { logEvent } = useApp();
  const { hasPermission, requestPermission } = useCameraPermission();
  const { state, process, reset } = useLivenessChallenge();
  const plugin = useMemo(() => createFaceLiveness(), []);
  const loggedRef = useRef(false);

  // Result flourish: a badge that springs in on pass, and a shake on fail.
  const badgeScale = useSharedValue(0);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  // All shared-value animation is driven here off the phase, and reset when a
  // new run begins — keeping mutations out of callbacks (React Compiler rule).
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, logEvent]);

  const frameOutput = useFrameOutput({
    pixelFormat: "yuv",
    onFrame(frame) {
      "worklet";
      try {
        const g = globalThis as Record<string, unknown>;
        const tick = ((g.__livenessTick as number) ?? 0) + 1;
        g.__livenessTick = tick;
        if (tick % FRAME_STRIDE === 0) {
          const obs = plugin.detect(frame);
          scheduleOnRN(process, obs);
        }
      } finally {
        frame.dispose();
      }
    },
  });

  const running = state.phase === "align" || state.phase === "challenge";
  const passed = state.phase === "passed";
  const failed = state.phase === "failed";
  const total = state.challenges.length;
  const progress = passed ? 1 : Math.min(state.index / total, 1);

  const prompt =
    state.phase === "align"
      ? state.faceFit === "ok"
        ? t("liveness.alignHold")
        : state.faceFit === "outside"
          ? t("liveness.align")
          : t("liveness.noFace")
      : state.phase === "challenge"
        ? t(`liveness.challenge.${state.challenges[state.index]}`)
        : passed
          ? t("liveness.passed")
          : t("liveness.failed");

  const retry = () => {
    loggedRef.current = false;
    reset(); // phase returns to "align"; the effect resets the badge.
  };

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgeScale.value }] }));
  const promptStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  return (
    <View style={styles.root}>
      {hasPermission ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device="front"
          isActive={running}
          outputs={[frameOutput]}
        />
      ) : (
        <View style={styles.permission}>
          <Icon name="scan" size={36} color={colors.accent} />
          <AppText weight="bold" size={18} color="#FFFFFF" style={{ marginTop: 14 }}>
            {t("liveness.permissionTitle")}
          </AppText>
          <AppText size={13.5} color={alpha("#FFFFFF", 0.7)} style={{ marginTop: 6, textAlign: "center" }}>
            {t("liveness.permissionBody")}
          </AppText>
          <Button label={t("liveness.grant")} onPress={requestPermission} style={{ marginTop: 20, alignSelf: "stretch" }} />
        </View>
      )}

      {hasPermission && <FaceMaskOverlay fit={state.faceFit} phase={state.phase} progress={progress} />}

      {/* Result badge: springs in on pass. */}
      {passed && (
        <View style={styles.badgeWrap} pointerEvents="none">
          <Animated.View style={[styles.badge, { backgroundColor: colors.pos }, badgeStyle]}>
            <Icon name="check" size={52} stroke={2.6} color="#FFFFFF" />
          </Animated.View>
        </View>
      )}

      {/* header */}
      <View style={[styles.header, { top: insets.top + 8 }]}>
        <Pressable onPress={onCancel} style={styles.close} hitSlop={10}>
          <Icon name="close" size={20} color="#FFFFFF" />
        </Pressable>
        <View style={styles.stepPill}>
          <AppText weight="semibold" size={12.5} color="#FFFFFF">
            {state.phase === "challenge" ? t("liveness.step", { n: state.index + 1, total }) : t("liveness.title")}
          </AppText>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* bottom panel */}
      {hasPermission && (
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 18 }]}>
          <Animated.View style={promptStyle}>
            <AppText weight="bold" size={19} color="#FFFFFF" style={{ textAlign: "center" }}>
              {prompt}
            </AppText>
          </Animated.View>
          {passed && (
            <AppText size={13} color={alpha("#FFFFFF", 0.75)} style={{ textAlign: "center", marginTop: 5 }}>
              {t("liveness.passedBody")}
            </AppText>
          )}
          {failed && (
            <AppText size={13} color={alpha("#FFFFFF", 0.75)} style={{ textAlign: "center", marginTop: 5 }}>
              {t("liveness.failedTimeout")}
            </AppText>
          )}
          {passed || failed ? (
            <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
              {failed && (
                <View style={{ flex: 1 }}>
                  <Button label={t("liveness.retry")} onPress={retry} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Button
                  label={passed ? (mode === "gate" ? t("liveness.continue") : t("liveness.done")) : t("liveness.cancel")}
                  variant={passed ? "primary" : "ghost"}
                  onPress={passed ? onPass : onCancel}
                />
              </View>
            </View>
          ) : (
            <AppText size={11.5} color={alpha("#FFFFFF", 0.5)} style={{ textAlign: "center", marginTop: 14 }}>
              {t("liveness.scopeNote")}
            </AppText>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  permission: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36 },
  header: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.45)" },
  badgeWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: { width: 104, height: 104, borderRadius: 52, alignItems: "center", justifyContent: "center" },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 18 },
});
