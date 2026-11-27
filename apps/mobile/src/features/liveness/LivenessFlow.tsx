import React from "react";
import { CameraErrorBoundary } from "@/features/camera/components/CameraErrorBoundary";
import { LivenessCamera } from "./components/LivenessCamera";
import { LivenessUnavailable } from "./components/LivenessUnavailable";
import type { LivenessFlowProps } from "./liveness.types";

export function LivenessFlow(props: LivenessFlowProps) {
  return (
    <CameraErrorBoundary fallback={<LivenessUnavailable onCancel={props.onCancel} />}>
      <LivenessCamera {...props} />
    </CameraErrorBoundary>
  );
}
