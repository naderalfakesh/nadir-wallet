import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Camera, useFrameOutput } from "react-native-vision-camera";
import { createSynchronizable, scheduleOnRN } from "react-native-worklets";
import { createCodeScanner } from "@nadir-wallet/code-scanner";
import { tryCreateNative } from "@/features/camera/cameraStatus";
import { CameraStatusPanel } from "@/features/camera/components/CameraStatusPanel";
import { useCameraAccess } from "@/features/camera/useCameraAccess";
import { haptics } from "@/services/device/haptics";
import { evaluateScan } from "../scanBridge";
import type { ScanFeedback } from "../scanFeedback";
import { scanFeedback } from "../scanFeedback";
import type { ScanTarget } from "../scanPayload";
import { ScanHint } from "./ScanHint";
import { ScanReticle } from "./ScanReticle";

const SCAN_STRIDE = 4;

// Reuse the detector across visits so an in-flight frame keeps a valid native object.
let sharedScanner: ReturnType<typeof createCodeScanner> | null = null;
function getCodeScanner() {
  return (sharedScanner ??= tryCreateNative(createCodeScanner));
}

export function ScanCamera({
  bottomInset,
  onAccept,
}: {
  bottomInset: number;
  onAccept: (target: ScanTarget) => void;
}) {
  const [scanner] = useState(getCodeScanner);
  const [found, setFound] = useState(false);
  const [rejection, setRejection] = useState<ScanFeedback | null>(null);
  const { device, status, askPermission, markFailed } = useCameraAccess("back", scanner !== null);

  const onCodes = (codes: string[]) => {
    if (found) return;
    let firstRejection: ScanFeedback | null = null;
    for (const raw of codes) {
      const result = evaluateScan(raw);
      if (result.ok) {
        haptics.success();
        setFound(true);
        onAccept({
          recipient: result.recipient,
          chainId: result.chainId,
          tokenContract: result.tokenContract,
        });
        return;
      }
      firstRejection ??= scanFeedback(result.reason);
    }
    if (firstRejection) setRejection(firstRejection);
  };

  const [frameTick] = useState(() => createSynchronizable(0, { fixedType: true }));
  const frameOutput = useFrameOutput({
    pixelFormat: "yuv",
    onFrame(frame) {
      "worklet";
      try {
        if (scanner == null) return;
        const tick = (frameTick.getDirty() + 1) % SCAN_STRIDE;
        frameTick.setDirty(tick);
        if (tick === 0) {
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
