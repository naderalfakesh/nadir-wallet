import React from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LivenessFlow } from "./LivenessFlow";
import { grantLiveness } from "./livenessGate";

export function LivenessScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const gated = typeof next === "string" && next.length > 0;

  return (
    <View style={{ flex: 1 }}>
      <LivenessFlow
        mode={gated ? "gate" : "standalone"}
        onPass={() => {
          if (gated) {
            grantLiveness(next);
            router.replace(next as never);
          } else {
            router.back();
          }
        }}
        onCancel={() => router.back()}
      />
    </View>
  );
}
