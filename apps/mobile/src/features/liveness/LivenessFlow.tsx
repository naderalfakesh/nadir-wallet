import React from "react";
import { CameraErrorBoundary } from "@/features/camera/components/CameraErrorBoundary";
import { LivenessCamera } from "./components/LivenessCamera";
import { LivenessUnavailable } from "./components/LivenessUnavailable";
import type { LivenessFlowProps } from "./liveness.types";

/**
 * Any camera or native failure ends in an error panel and never calls
 * `onPass`, so a broken camera can't stand in for a passed check.
 */
export function LivenessFlow(props: LivenessFlowProps) {
  return (
    <CameraErrorBoundary fallback={<LivenessUnavailable onCancel={props.onCancel} />}>
      <LivenessCamera {...props} />
    </CameraErrorBoundary>
  );
}
