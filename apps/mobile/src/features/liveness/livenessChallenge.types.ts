import type { LivenessSnapshot } from "./liveness.types";

export type { ChallengeId, FaceFit, LivenessPhase, LivenessSnapshot } from "./liveness.types";

// Held in a ref rather than React state so 30 fps camera observations don't churn renders.
export interface LivenessMachine {
  snapshot: LivenessSnapshot;
  alignedSince: number | null;
  heldLastAt: number;
  challengeStart: number;
  blinkClosedSeen: boolean;
  reachedTarget: boolean;
  nodBaseline: number | null;
  smileSince: number | null;
}
