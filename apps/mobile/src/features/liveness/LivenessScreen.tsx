import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

export function LivenessScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logEvent } = useApp();
  const { hasPermission, requestPermission } = useCameraPermission();
  const { state, process, reset } = useLivenessChallenge();
  const plugin = useMemo(() => createFaceLiveness(), []);
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (loggedRef.current) return;
    if (state.phase === "passed") {
      loggedRef.current = true;
      logEvent("liveness_pass");
    } else if (state.phase === "failed") {
      loggedRef.current = true;
      logEvent("liveness_fail");
    }
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
  const finished = state.phase === "passed" || state.phase === "failed";
  const total = state.challenges.length;
  const progress = Math.min(state.index / total, 1);

  const prompt =
    state.phase === "align"
      ? state.faceFit === "ok"
        ? t("liveness.alignHold")
        : state.faceFit === "outside"
          ? t("liveness.align")
          : t("liveness.noFace")
      : state.phase === "challenge"
        ? t(`liveness.challenge.${state.challenges[state.index]}`)
        : state.phase === "passed"
          ? t("liveness.passed")
          : t("liveness.failed");

  const retry = () => {
    loggedRef.current = false;
    reset();
  };

  return (
    <View style={[styles.root, { backgroundColor: "#000" }]}>
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

      {/* header */}
      <View style={[styles.header, { top: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.close} hitSlop={10}>
          <Icon name="close" size={20} color="#FFFFFF" />
        </Pressable>
        <View style={styles.stepPill}>
          <AppText weight="semibold" size={12.5} color="#FFFFFF">
            {state.phase === "challenge"
              ? t("liveness.step", { n: state.index + 1, total })
              : t("liveness.title")}
          </AppText>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* bottom panel */}
      {hasPermission && (
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 18 }]}>
          <AppText weight="bold" size={19} color="#FFFFFF" style={{ textAlign: "center" }}>
            {prompt}
          </AppText>
          {state.phase === "passed" && (
            <AppText size={13} color={alpha("#FFFFFF", 0.75)} style={{ textAlign: "center", marginTop: 5 }}>
              {t("liveness.passedBody")}
            </AppText>
          )}
          {state.phase === "failed" && (
            <AppText size={13} color={alpha("#FFFFFF", 0.75)} style={{ textAlign: "center", marginTop: 5 }}>
              {t("liveness.failedTimeout")}
            </AppText>
          )}
          {finished ? (
            <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
              {state.phase === "failed" && (
                <View style={{ flex: 1 }}>
                  <Button label={t("liveness.retry")} onPress={retry} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Button
                  label={state.phase === "passed" ? t("liveness.done") : t("liveness.cancel")}
                  variant={state.phase === "passed" ? "primary" : "ghost"}
                  onPress={() => router.back()}
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
  root: { flex: 1 },
  permission: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
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
  stepPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
});
