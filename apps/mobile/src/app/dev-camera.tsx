// THROWAWAY DEV SCREEN — native-stack spike verification only.
// Shows the front camera preview and the ML Kit face count coming back from
// the @nadir-wallet/face-liveness Nitro frame-processor plugin.
// Delete this file once the real LivenessScreen lands.
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Camera,
  useCameraPermission,
  useFrameOutput,
} from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";
import { createFaceLiveness } from "@nadir-wallet/face-liveness";

export default function DevCameraScreen() {
  const router = useRouter();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [faceCount, setFaceCount] = useState<number | null>(null);
  const [frames, setFrames] = useState(0);
  const plugin = useMemo(() => createFaceLiveness(), []);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const frameOutput = useFrameOutput({
    pixelFormat: "yuv",
    onFrame(frame) {
      "worklet";
      try {
        const count = plugin.detectFaceCount(frame);
        const g = globalThis as Record<string, unknown>;
        const tick = ((g.__devCameraTick as number) ?? 0) + 1;
        g.__devCameraTick = tick;
        // Throttle UI updates: report on change or every 30th frame.
        if (g.__devCameraLast !== count || tick % 30 === 0) {
          g.__devCameraLast = count;
          scheduleOnRN(setFaceCount, count);
          scheduleOnRN(setFrames, tick);
        }
      } finally {
        frame.dispose();
      }
    },
  });

  return (
    <View style={styles.root}>
      {hasPermission ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device="front"
          isActive
          outputs={[frameOutput]}
        />
      ) : (
        <Text style={styles.info}>Waiting for camera permission…</Text>
      )}
      <View style={styles.hud}>
        <Text style={styles.hudText}>
          faces: {faceCount ?? "—"} · frames: {frames}
        </Text>
        <Pressable onPress={() => router.back()} style={styles.close}>
          <Text style={styles.hudText}>close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  info: { color: "#fff", textAlign: "center" },
  hud: {
    position: "absolute",
    top: 64,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hudText: {
    color: "#fff",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  close: { padding: 4 },
});
