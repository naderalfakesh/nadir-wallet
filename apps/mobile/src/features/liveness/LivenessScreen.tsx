import React from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LivenessFlow } from "./LivenessFlow";

/**
 * Route wrapper around {@link LivenessFlow}. Standalone (Security Center) when
 * opened with no params; a step-up gate when given a `next` route to continue
 * to on pass — e.g. `/liveness?next=/reveal`.
 */
export function LivenessScreen() {
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const gated = typeof next === "string" && next.length > 0;

  return (
    <View style={{ flex: 1 }}>
      <LivenessFlow
        mode={gated ? "gate" : "standalone"}
        onPass={() => {
          if (gated) router.replace(next as never);
          else router.back();
        }}
        onCancel={() => router.back()}
      />
    </View>
  );
}
