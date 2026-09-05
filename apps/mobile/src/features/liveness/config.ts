/**
 * Oval mask geometry, normalized to the screen (0..1). The same values drive
 * the SVG overlay and the face-fit check so they can never drift apart.
 */
export const OVAL = { cx: 0.5, cy: 0.42, rx: 0.33, ry: 0.26 } as const;

export const THRESHOLDS = {
  /**
   * Minimum face-box width (normalized) - guards against "too far". The upper
   * bound is enforced implicitly by containment (a too-close face overflows
   * the oval), so there is no separate max.
   */
  faceMinWidth: 0.3,
  /**
   * How far the face box may spill past the oval's bounding rect and still
   * count as "inside". ML Kit's box runs forehead-to-chin and is a touch wider
   * than the visible face, so a little slack keeps a well-placed face from
   * flickering to amber - but small enough that a partial/off-center face fails.
   */
  ovalSlack: 0.05,
  /** How long the face must stay aligned before challenges start. */
  alignHoldMs: 900,
  /** Face may drop out briefly (e.g. while turning) without resetting. */
  faceLostGraceMs: 900,
  /**
   * Live "stay aligned" band, enforced *during* challenges. Looser than the
   * start-up containment (a turn shifts the box, and hysteresis avoids
   * flicker), but a gross move - very close, very far, or off to the side -
   * breaks it and, if sustained past the grace window, restarts alignment.
   */
  holdCenterTol: 0.18,
  holdMinWidth: 0.2,
  holdMaxWidth: 0.72,
  /** Per-challenge time limit. */
  challengeTimeoutMs: 10_000,
  /** Eye-open probability boundaries for the blink challenge. */
  eyeClosedBelow: 0.25,
  eyeOpenAbove: 0.55,
  /** Head yaw (degrees) that counts as a completed turn, and the return band. */
  turnYawDeg: 18,
  turnReturnDeg: 8,
  /**
   * Nod is measured as a pitch *swing* from the neutral baseline captured when
   * the challenge starts (not an absolute angle), so a per-device/per-pose
   * pitch bias can't make it finicky: tilt this far from baseline, then return
   * within the second band of baseline.
   */
  nodDeltaDeg: 12,
  nodReturnDeltaDeg: 6,
  /**
   * Smiling probability that counts, and how long it must be held - a brief
   * hold makes the smile deliberate instead of firing on the first blip.
   */
  smileAbove: 0.7,
  smileHoldMs: 450,
} as const;

/**
 * Sign that maps ML Kit's raw Euler-Y onto "+ = user turned to THEIR left".
 * Verified the same (+1) on device for both iOS (iPhone 15) and Android
 * (Pixel 9) - despite the platforms feeding ML Kit mirrored vs unmirrored
 * images, the resulting yaw sign matches.
 */
export const YAW_USER_LEFT_SIGN = 1;

/**
 * How many challenges one run requires, capped at the number available. Set
 * high to ask for all supported challenges (blink, turn L/R, nod, smile) in
 * randomized order; lower it for a shorter random subset.
 */
export const CHALLENGES_PER_RUN = 5;

/** Process every Nth camera frame (~30 Hz at 60 fps capture). */
export const FRAME_STRIDE = 2;
