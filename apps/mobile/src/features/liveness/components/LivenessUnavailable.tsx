import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraStatusPanel } from "@/features/camera/components/CameraStatusPanel";
import { LivenessHeader } from "./LivenessHeader";

export function LivenessUnavailable({ onCancel }: { onCancel: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <CameraStatusPanel
        feature="liveness"
        status="unavailable"
        onRequestPermission={() => undefined}
      />
      <LivenessHeader topInset={insets.top} phase="align" index={0} total={0} onCancel={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
});
