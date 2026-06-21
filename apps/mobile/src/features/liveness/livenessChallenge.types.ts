import type { LivenessSnapshot } from "./liveness.types";

export type {
  ChallengeId,
  FaceFit,
  LivenessPhase,
  LivenessSnapshot,
} from "./liveness.types";

/**
 * The full machine state driven off the camera worklet: the user-visible
 * snapshot plus the transient timing/progress fields the reducer carries
 * between observations. Kept out of React state so 30 fps observations don't
 * churn renders; only `snapshot` is published to the UI.
 */
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
