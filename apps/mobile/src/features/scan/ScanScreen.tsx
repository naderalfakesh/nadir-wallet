import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera, useCameraDevice, useCameraPermission, useFrameOutput } from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";
import { createCodeScanner } from "@nadir-wallet/code-scanner";
import { scanStyles as styles } from "./ScanScreen.styles";
import { PermissionPanel, ScanHeader, ScanHint, ScanReticle } from "./ScanScreen.parts";
import { deliverScan, extractEvmAddress } from "./scanBridge";

const SCAN_STRIDE = 4;

/**
 * Full-screen QR scanner. Reads frames through the custom ML Kit barcode Nitro
 * plugin and hands the first EVM address it finds back to the opener via
 * {@link scanBridge}. Open it with `beginScan(onResult)` then `router.push("/scan")`.
 */
export function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const scanner = useMemo(() => createCodeScanner(), []);
  const [found, setFound] = useState(false);
  const handledRef = useRef(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const onCodes = (codes: string[]) => {
    if (handledRef.current) return;
    for (const raw of codes) {
      const addr = extractEvmAddress(raw);
      if (addr) {
        handledRef.current = true;
        setFound(true);
        deliverScan(addr);
        // Brief beat so the success frame is visible, then return.
        setTimeout(() => router.back(), 350);
        return;
      }
    }
  };

  const cancel = () => {
    if (!handledRef.current) {
      handledRef.current = true;
      deliverScan(null);
    }
    router.back();
  };

  const frameOutput = useFrameOutput({
    pixelFormat: "yuv",
    onFrame(frame) {
      "worklet";
      try {
        const globalState = globalThis as Record<string, unknown>;
        const tick = ((globalState.__scanTick as number) ?? 0) + 1;
        globalState.__scanTick = tick;
        if (tick % SCAN_STRIDE === 0) {
          const codes = scanner.scan(frame);
          if (codes.length > 0) scheduleOnRN(onCodes, codes);
        }
      } finally {
        frame.dispose();
      }
    },
  });

  return (
    <View style={styles.root}>
      {hasPermission && device ? (
        <Camera style={StyleSheet.absoluteFill} device={device} isActive={!found} outputs={[frameOutput]} />
      ) : (
        <PermissionPanel onRequestPermission={requestPermission} />
      )}

      {hasPermission && device && <ScanReticle found={found} />}

      <ScanHeader topInset={insets.top} onCancel={cancel} />

      {hasPermission && device && <ScanHint bottomInset={insets.bottom} found={found} />}
    </View>
  );
}
