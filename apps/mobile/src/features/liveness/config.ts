// Shared between the SVG overlay and face-fit check (normalized 0..1).
export const OVAL = { cx: 0.5, cy: 0.42, rx: 0.33, ry: 0.26 } as const;

export const THRESHOLDS = {
  // No separate max width: a too-close face overflows the oval containment check.
  faceMinWidth: 0.3,
  // Slight slack around the oval because ML Kit's box runs slightly wider than the visible face.
  ovalSlack: 0.05,
  alignHoldMs: 900,
  faceLostGraceMs: 900,
  // Looser live band during challenges to tolerate turns without flickering.
  holdCenterTol: 0.18,
  holdMinWidth: 0.2,
  holdMaxWidth: 0.72,
  challengeTimeoutMs: 10_000,
  eyeClosedBelow: 0.25,
  eyeOpenAbove: 0.55,
  turnYawDeg: 18,
  turnReturnDeg: 8,
  // Measured relative to each challenge's starting pitch to ignore per-pose bias.
  nodDeltaDeg: 12,
  nodReturnDeltaDeg: 6,
  smileAbove: 0.7,
  smileHoldMs: 450,
} as const;

// Maps ML Kit Euler-Y to "+ = user turned left"; verified +1 on both iOS and Android devices.
export const YAW_USER_LEFT_SIGN = 1;

export const CHALLENGES_PER_RUN = 5;

export const FRAME_STRIDE = 2;
