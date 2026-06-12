import type { Frame } from "react-native-vision-camera";
import type { HybridObject } from "react-native-nitro-modules";

/**
 * Spike scope: a deliberately minimal surface to prove the native stack
 * (Nitro HybridObject + VisionCamera Frame + ML Kit linkage) builds and runs.
 * The real liveness API (Euler angles, eye-open probabilities, bounds)
 * replaces this in the next phase.
 */
export interface FaceLiveness
  extends HybridObject<{ ios: "swift"; android: "kotlin" }> {
  /**
   * Runs ML Kit face detection on the frame and returns the number of
   * detected faces. Must be called from a frame-output worklet.
   */
  detectFaceCount(frame: Frame): number;
}
