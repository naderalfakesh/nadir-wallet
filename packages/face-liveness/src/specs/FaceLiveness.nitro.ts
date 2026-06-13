import type { Frame } from "react-native-vision-camera";
import type { HybridObject } from "react-native-nitro-modules";

/**
 * A single-face observation produced from one camera frame.
 *
 * Coordinate contract: `x/y/width/height` are the face bounding box,
 * normalized to 0..1 in the upright, selfie-mirrored display space — i.e. the
 * same space the user sees in the (mirrored) front-camera preview. (0,0) is
 * top-left.
 *
 * Angle contract: `yaw`/`pitch`/`roll` are ML Kit's raw head Euler angles in
 * degrees (Y/X/Z). The yaw sign convention differs between platforms because
 * iOS frames are mirrored at the buffer level and Android frames are not —
 * the JS layer owns the per-platform sign mapping (see liveness/config).
 */
export interface FaceObservation {
  hasFace: boolean;
  /** Head Euler angle Y in degrees (left/right turn). Raw ML Kit value. */
  yaw: number;
  /** Head Euler angle X in degrees (nod up/down). Raw ML Kit value. */
  pitch: number;
  /** Head Euler angle Z in degrees (tilt). Raw ML Kit value. */
  roll: number;
  /** Probability 0..1 that the left eye is open; -1 when unavailable. */
  leftEyeOpen: number;
  /** Probability 0..1 that the right eye is open; -1 when unavailable. */
  rightEyeOpen: number;
  /** Probability 0..1 that the face is smiling; -1 when unavailable. */
  smile: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Frame timestamp in milliseconds (platform clock; only deltas matter). */
  timestampMs: number;
}

export interface FaceLiveness
  extends HybridObject<{ ios: "swift"; android: "kotlin" }> {
  /**
   * Runs ML Kit face detection (fast mode + eye-open classification) on the
   * frame and returns the most prominent face, or `hasFace: false`.
   * Synchronous — call from a frame-output worklet only.
   */
  detect(frame: Frame): FaceObservation;
}
