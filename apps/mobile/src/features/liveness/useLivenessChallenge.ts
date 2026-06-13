import { useCallback, useRef, useState } from "react";
import type { FaceObservation } from "@nadir-wallet/face-liveness";
import { CHALLENGES_PER_RUN, OVAL, THRESHOLDS, YAW_USER_LEFT_SIGN } from "./config";

export type ChallengeId = "blink" | "turnLeft" | "turnRight" | "nod" | "smile";
export type LivenessPhase = "align" | "challenge" | "passed" | "failed";
export type FaceFit = "none" | "outside" | "ok";

export interface LivenessSnapshot {
  phase: LivenessPhase;
  faceFit: FaceFit;
  challenges: ChallengeId[];
  /** Completed challenge count; also the index of the active challenge. */
  index: number;
}

const ALL_CHALLENGES: ChallengeId[] = ["blink", "turnLeft", "turnRight", "nod", "smile"];

function pickChallenges(): ChallengeId[] {
  const pool = [...ALL_CHALLENGES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(CHALLENGES_PER_RUN, pool.length));
}

// Bounding rect of the oval, in the same normalized space as the face box.
const OVAL_LEFT = OVAL.cx - OVAL.rx;
const OVAL_RIGHT = OVAL.cx + OVAL.rx;
const OVAL_TOP = OVAL.cy - OVAL.ry;
const OVAL_BOTTOM = OVAL.cy + OVAL.ry;

/**
 * A face fits when its whole box sits inside the oval (modulo a little slack)
 * and is large enough not to be far away. Containment is what makes this
 * strict: a too-close face overflows the oval, and a partial/off-center face
 * pushes a box edge past the boundary — both correctly read as "outside".
 *
 * Note: the face box is normalized to the camera frame while the oval is in
 * screen space; this assumes the full-bleed preview maps the two ~1:1. A
 * future refinement would route the box through the preview's crop transform.
 */
function fitOf(obs: FaceObservation): FaceFit {
  if (!obs.hasFace) return "none";
  const s = THRESHOLDS.ovalSlack;
  const contained =
    obs.x >= OVAL_LEFT - s &&
    obs.x + obs.width <= OVAL_RIGHT + s &&
    obs.y >= OVAL_TOP - s &&
    obs.y + obs.height <= OVAL_BOTTOM + s;
  const bigEnough = obs.width >= THRESHOLDS.faceMinWidth;
  return contained && bigEnough ? "ok" : "outside";
}

/**
 * Looser "still aligned" test used *during* challenges. A blink or in-place
 * head turn keeps the head centered and roughly the same size, so this passes
 * throughout; only a gross move (very close/far/off-center) fails it.
 */
function holdOk(obs: FaceObservation): boolean {
  if (!obs.hasFace) return false;
  const cx = obs.x + obs.width / 2;
  const cy = obs.y + obs.height / 2;
  return (
    Math.abs(cx - OVAL.cx) <= THRESHOLDS.holdCenterTol &&
    Math.abs(cy - OVAL.cy) <= THRESHOLDS.holdCenterTol &&
    obs.width >= THRESHOLDS.holdMinWidth &&
    obs.width <= THRESHOLDS.holdMaxWidth
  );
}

/**
 * The challenge state machine. `process` is called with ~30 observations per
 * second from the camera worklet (via scheduleOnRN); it mutates refs and only
 * commits a React state update when something user-visible changes.
 */
export function useLivenessChallenge() {
  const [snap, setSnap] = useState<LivenessSnapshot>(() => ({
    phase: "align",
    faceFit: "none",
    challenges: pickChallenges(),
    index: 0,
  }));

  const snapRef = useRef(snap);
  const alignedSinceRef = useRef<number | null>(null);
  const heldLastAtRef = useRef(0);
  const challengeStartRef = useRef(0);
  // Per-challenge progress, all cleared together between challenges:
  const blinkClosedSeenRef = useRef(false); // blink: eyes-closed seen
  const reachedRef = useRef(false); // turn/nod: extreme reached, awaiting return
  const nodBaselineRef = useRef<number | null>(null); // nod: neutral pitch baseline
  const smileSinceRef = useRef<number | null>(null); // smile: when the hold began

  const resetProgress = useCallback(() => {
    blinkClosedSeenRef.current = false;
    reachedRef.current = false;
    nodBaselineRef.current = null;
    smileSinceRef.current = null;
  }, []);

  const commit = useCallback((next: LivenessSnapshot) => {
    const prev = snapRef.current;
    if (
      prev.phase === next.phase &&
      prev.faceFit === next.faceFit &&
      prev.index === next.index &&
      prev.challenges === next.challenges
    ) {
      return;
    }
    snapRef.current = next;
    setSnap(next);
  }, []);

  const reset = useCallback(() => {
    alignedSinceRef.current = null;
    resetProgress();
    const next: LivenessSnapshot = {
      phase: "align",
      faceFit: "none",
      challenges: pickChallenges(),
      index: 0,
    };
    snapRef.current = next;
    setSnap(next);
  }, [resetProgress]);

  const process = useCallback(
    (obs: FaceObservation) => {
      const s = snapRef.current;
      if (s.phase === "passed" || s.phase === "failed") return;
      const now = Date.now();

      if (s.phase === "align") {
        const fit = fitOf(obs);
        if (fit === "ok") {
          alignedSinceRef.current ??= now;
          if (now - alignedSinceRef.current >= THRESHOLDS.alignHoldMs) {
            challengeStartRef.current = now;
            heldLastAtRef.current = now;
            resetProgress();
            commit({ ...s, phase: "challenge", faceFit: "ok" });
            return;
          }
        } else {
          alignedSinceRef.current = null;
        }
        commit({ ...s, faceFit: fit });
        return;
      }

      // phase === "challenge" — alignment is enforced LIVE via the looser hold.
      // A blink or in-place turn keeps the hold; getting very close, very far,
      // or off-center drops it: amber immediately, and a restart if sustained.
      const held = holdOk(obs);
      if (held) heldLastAtRef.current = now;
      if (!held) {
        if (now - heldLastAtRef.current > THRESHOLDS.faceLostGraceMs) {
          // Sustained loss of alignment — restart from the alignment step so a
          // partial run can't be stitched together across positions.
          alignedSinceRef.current = null;
          resetProgress();
          commit({ ...s, phase: "align", index: 0, faceFit: obs.hasFace ? "outside" : "none" });
        } else {
          // Brief drift — keep the challenge alive but reflect it live (amber).
          commit({ ...s, faceFit: obs.hasFace ? "outside" : "none" });
        }
        return;
      }

      if (now - challengeStartRef.current > THRESHOLDS.challengeTimeoutMs) {
        commit({ ...s, phase: "failed", faceFit: "ok" });
        return;
      }

      const challenge = s.challenges[s.index];
      let completed = false;

      if (challenge === "blink") {
        // Eyes must close then re-open (a -1 means ML Kit had no estimate).
        const left = obs.leftEyeOpen;
        const right = obs.rightEyeOpen;
        if (left >= 0 && right >= 0) {
          const eyes = Math.min(left, right);
          if (!blinkClosedSeenRef.current && eyes <= THRESHOLDS.eyeClosedBelow) {
            blinkClosedSeenRef.current = true;
          } else if (blinkClosedSeenRef.current && eyes >= THRESHOLDS.eyeOpenAbove) {
            completed = true;
          }
        }
      } else if (challenge === "turnLeft" || challenge === "turnRight") {
        // Yaw must reach the turn angle then return toward center.
        const towardUserLeft = obs.yaw * YAW_USER_LEFT_SIGN;
        const towardTarget = challenge === "turnLeft" ? towardUserLeft : -towardUserLeft;
        if (!reachedRef.current && towardTarget >= THRESHOLDS.turnYawDeg) {
          reachedRef.current = true;
        } else if (reachedRef.current && Math.abs(obs.yaw) <= THRESHOLDS.turnReturnDeg) {
          completed = true;
        }
      } else if (challenge === "nod") {
        // Baseline-relative: capture the neutral pitch on the first frame, then
        // require a swing away from it and back — so a per-pose pitch bias
        // doesn't make it finicky.
        if (nodBaselineRef.current === null) {
          nodBaselineRef.current = obs.pitch;
        } else {
          const delta = Math.abs(obs.pitch - nodBaselineRef.current);
          if (!reachedRef.current && delta >= THRESHOLDS.nodDeltaDeg) {
            reachedRef.current = true;
          } else if (reachedRef.current && delta <= THRESHOLDS.nodReturnDeltaDeg) {
            completed = true;
          }
        }
      } else if (challenge === "smile") {
        // Must hold a smile briefly (not just one frame) to be deliberate
        // (-1 means ML Kit had no estimate this frame).
        if (obs.smile >= 0 && obs.smile >= THRESHOLDS.smileAbove) {
          smileSinceRef.current ??= now;
          if (now - smileSinceRef.current >= THRESHOLDS.smileHoldMs) {
            completed = true;
          }
        } else {
          smileSinceRef.current = null;
        }
      }

      if (!completed) {
        commit({ ...s, faceFit: "ok" });
        return;
      }

      const nextIndex = s.index + 1;
      if (nextIndex >= s.challenges.length) {
        commit({ ...s, phase: "passed", faceFit: "ok", index: nextIndex });
        return;
      }
      challengeStartRef.current = now;
      resetProgress();
      commit({ ...s, index: nextIndex, faceFit: "ok" });
    },
    [commit, resetProgress],
  );

  return { state: snap, process, reset };
}
