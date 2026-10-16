import React from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LivenessFlow } from "./LivenessFlow";
import { grantLiveness, parseLivenessTarget } from "./livenessGate";

export function LivenessScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const target = parseLivenessTarget(next);

  return (
    <View style={{ flex: 1 }}>
      <LivenessFlow
        mode={target ? "gate" : "standalone"}
        onPass={() => {
          if (target) {
            grantLiveness(target);
            router.replace(target);
          } else {
            router.back();
          }
        }}
        onCancel={() => router.back()}
      />
    </View>
  );
}
