import { Platform } from "react-native";

/**
 * Oval mask geometry, normalized to the screen (0..1). The same values drive
 * the SVG overlay and the face-fit check so they can never drift apart.
 */
export const OVAL = { cx: 0.5, cy: 0.42, rx: 0.33, ry: 0.26 } as const;

export const THRESHOLDS = {
  /** Face box width (normalized) accepted as "inside the oval". */
  faceMinWidth: 0.26,
  faceMaxWidth: 0.8,
  /** Max distance between face center and oval center. */
  centerTolX: 0.14,
  centerTolY: 0.14,
  /** How long the face must stay aligned before challenges start. */
  alignHoldMs: 900,
  /** Face may drop out briefly (e.g. while turning) without resetting. */
  faceLostGraceMs: 900,
  /** Per-challenge time limit. */
  challengeTimeoutMs: 10_000,
  /** Eye-open probability boundaries for the blink challenge. */
  eyeClosedBelow: 0.25,
  eyeOpenAbove: 0.55,
  /** Head yaw (degrees) that counts as a completed turn, and the return band. */
  turnYawDeg: 18,
  turnReturnDeg: 8,
} as const;

/**
 * ML Kit reports a positive Euler Y when the face turns toward the camera's
 * right. With Android's unmirrored buffers that means the user turned LEFT;
 * iOS buffers are mirrored, flipping the sign.
 * TODO(device): verify both signs on hardware and adjust if prompts feel inverted.
 */
export const YAW_USER_LEFT_SIGN = Platform.OS === "ios" ? -1 : 1;

/** How many randomized challenges one run requires. */
export const CHALLENGES_PER_RUN = 2;

/** Process every Nth camera frame (~30 Hz at 60 fps capture). */
export const FRAME_STRIDE = 2;
