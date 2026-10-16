import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera, useCameraDevice, useCameraPermission, useFrameOutput } from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";
import { createCodeScanner } from "@nadir-wallet/code-scanner";
import { CameraErrorBoundary } from "@/features/camera/CameraErrorBoundary";
import { CameraStatusPanel } from "@/features/camera/CameraStatusPanel";
import { cameraStatus, tryCreateNative } from "@/features/camera/cameraStatus";
import { scanStyles as styles } from "./ScanScreen.styles";
import { ScanHeader, ScanHint, ScanReticle } from "./ScanScreen.parts";
import {
  currentScanSession,
  deliverScan,
  evaluateScan,
  scanFeedback,
  type ScanFeedback,
  type ScanTarget,
} from "./scanBridge";

const SCAN_STRIDE = 4;

/**
 * Full-screen QR scanner. Reads frames through the custom ML Kit barcode Nitro
 * plugin and hands the first accepted payment target back to the opener via
 * {@link scanBridge}. Rejected codes keep the camera running and show why.
 * Open it with `beginScan(onResult, check)` then `router.push("/scan")`.
 */
export function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const handledRef = useRef(false);
  const [scanSession] = useState(currentScanSession);

  // Resolves the opener exactly once, whatever happens to the camera below.
  const deliverOnce = useCallback(
    (value: ScanTarget | null) => {
      if (handledRef.current) return false;
      handledRef.current = true;
      deliverScan(value, scanSession);
      return true;
    },
    [scanSession],
  );

  // Swipe-down and hardware back skip `cancel`; resolve here so a frame callback
  // queued before unmount can't fill the opener after the scanner is gone.
  useEffect(() => () => void deliverOnce(null), [deliverOnce]);

  const cancel = () => {
    deliverOnce(null);
    router.back();
  };

  return (
    <View style={styles.root}>
      <CameraErrorBoundary
        fallback={<CameraStatusPanel feature="scan" status="unavailable" onRequestPermission={() => undefined} />}
      >
        <ScanCamera
          bottomInset={insets.bottom}
          onAccept={(target) => {
            if (!deliverOnce(target)) return;
            // Brief beat so the success frame is visible, then return.
            setTimeout(() => router.back(), 350);
          }}
        />
      </CameraErrorBoundary>
      <ScanHeader topInset={insets.top} onCancel={cancel} />
    </View>
  );
}

function ScanCamera({ bottomInset, onAccept }: { bottomInset: number; onAccept: (target: ScanTarget) => void }) {
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const scanner = useMemo(() => tryCreateNative(createCodeScanner), []);
  const [found, setFound] = useState(false);
  const [failed, setFailed] = useState(false);
  const [rejection, setRejection] = useState<ScanFeedback | null>(null);
  const markFailed = useCallback(() => setFailed(true), []);

  const status = cameraStatus({
    nativeReady: scanner !== null,
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

  const onCodes = (codes: string[]) => {
    if (found) return;
    let firstRejection: ScanFeedback | null = null;
    for (const raw of codes) {
      const result = evaluateScan(raw);
      if (result.ok) {
        setFound(true);
        onAccept({ recipient: result.recipient, chainId: result.chainId, tokenContract: result.tokenContract });
        return;
      }
      firstRejection ??= scanFeedback(result.reason);
    }
    if (firstRejection) setRejection(firstRejection);
  };

  const frameOutput = useFrameOutput({
    pixelFormat: "yuv",
    onFrame(frame) {
      "worklet";
      try {
        if (scanner == null) return;
        const globalState = globalThis as Record<string, unknown>;
        const tick = ((globalState.__scanTick as number) ?? 0) + 1;
        globalState.__scanTick = tick;
        if (tick % SCAN_STRIDE === 0) {
          const codes = scanner.scan(frame);
          if (codes.length > 0) scheduleOnRN(onCodes, codes);
        }
      } catch {
        // Stop on a frame the scanner can't read rather than skip it silently.
        scheduleOnRN(markFailed);
      } finally {
        frame.dispose();
      }
    },
  });

  if (status !== "ready" || device == null) {
    return (
      <CameraStatusPanel
        feature="scan"
        status={status === "ready" ? "noDevice" : status}
        onRequestPermission={askPermission}
      />
    );
  }

  return (
    <>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!found}
        outputs={[frameOutput]}
        onError={markFailed}
      />
      <ScanReticle found={found} />
      <ScanHint bottomInset={bottomInset} found={found} rejection={rejection} />
    </>
  );
}
