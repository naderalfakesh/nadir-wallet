import type { Frame } from "react-native-vision-camera";
import type { HybridObject } from "react-native-nitro-modules";

// Bounding box is normalized 0..1 in upright selfie-mirrored space; angles are raw ML Kit degrees.
export interface FaceObservation {
  hasFace: boolean;
  yaw: number;
  pitch: number;
  roll: number;
  // Probabilities 0..1, or -1 when ML Kit cannot classify.
  leftEyeOpen: number;
  rightEyeOpen: number;
  smile: number;
  x: number;
  y: number;
  width: number;
  height: number;
  timestampMs: number;
}

export interface FaceLiveness extends HybridObject<{ ios: "swift"; android: "kotlin" }> {
  // Synchronous: call from a frame-output worklet only.
  detect(frame: Frame): FaceObservation;
}
