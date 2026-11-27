import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraErrorBoundary } from "@/features/camera/components/CameraErrorBoundary";
import { CameraStatusPanel } from "@/features/camera/components/CameraStatusPanel";
import { useTimeout } from "@/hooks";
import { ScanCamera } from "./components/ScanCamera";
import { ScanHeader } from "./components/ScanHeader";
import { currentScanSession, deliverScan } from "./scanBridge";
import type { ScanTarget } from "./scanPayload";

export function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { schedule } = useTimeout();
  const handledRef = useRef(false);
  const [scanSession] = useState(currentScanSession);

  const deliverOnce = useCallback(
    (value: ScanTarget | null) => {
      if (handledRef.current) return false;
      handledRef.current = true;
      deliverScan(value, scanSession);
      return true;
    },
    [scanSession],
  );

  // Swipe-down and hardware back skip `cancel`; settle on unmount so queued frames cannot leak out.
  useEffect(() => () => void deliverOnce(null), [deliverOnce]);

  const cancel = () => {
    deliverOnce(null);
    router.back();
  };

  return (
    <View style={styles.root}>
      <CameraErrorBoundary
        fallback={
          <CameraStatusPanel
            feature="scan"
            status="unavailable"
            onRequestPermission={() => undefined}
          />
        }
      >
        <ScanCamera
          bottomInset={insets.bottom}
          onAccept={(target) => {
            if (!deliverOnce(target)) return;
            // Brief beat so the success frame is visible, then return.
            schedule(() => router.back(), 350);
          }}
        />
      </CameraErrorBoundary>
      <ScanHeader topInset={insets.top} onCancel={cancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
});
