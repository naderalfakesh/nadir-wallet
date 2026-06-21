import type { FaceObservation } from "@nadir-wallet/face-liveness";
import { CHALLENGES_PER_RUN, OVAL, THRESHOLDS } from "./config";
import type { ChallengeId, FaceFit } from "./livenessChallenge.types";

const ALL_CHALLENGES: ChallengeId[] = ["blink", "turnLeft", "turnRight", "nod", "smile"];
const OVAL_LEFT = OVAL.cx - OVAL.rx;
const OVAL_RIGHT = OVAL.cx + OVAL.rx;
const OVAL_TOP = OVAL.cy - OVAL.ry;
const OVAL_BOTTOM = OVAL.cy + OVAL.ry;

export function pickChallenges(): ChallengeId[] {
  const pool = [...ALL_CHALLENGES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(CHALLENGES_PER_RUN, pool.length));
}

export function getFaceFit(obs: FaceObservation): FaceFit {
  if (!obs.hasFace) return "none";
  const slack = THRESHOLDS.ovalSlack;
  const contained =
    obs.x >= OVAL_LEFT - slack &&
    obs.x + obs.width <= OVAL_RIGHT + slack &&
    obs.y >= OVAL_TOP - slack &&
    obs.y + obs.height <= OVAL_BOTTOM + slack;
  const bigEnough = obs.width >= THRESHOLDS.faceMinWidth;
  return contained && bigEnough ? "ok" : "outside";
}

export function isFaceHeldInFrame(obs: FaceObservation): boolean {
  if (!obs.hasFace) return false;
  const centerX = obs.x + obs.width / 2;
  const centerY = obs.y + obs.height / 2;

  return (
    Math.abs(centerX - OVAL.cx) <= THRESHOLDS.holdCenterTol &&
    Math.abs(centerY - OVAL.cy) <= THRESHOLDS.holdCenterTol &&
    obs.width >= THRESHOLDS.holdMinWidth &&
    obs.width <= THRESHOLDS.holdMaxWidth
  );
}
