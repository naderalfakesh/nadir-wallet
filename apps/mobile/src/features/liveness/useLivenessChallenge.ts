import { useCallback, useRef, useState } from "react";
import type { FaceObservation } from "@nadir-wallet/face-liveness";
import { CHALLENGES_PER_RUN, OVAL, THRESHOLDS, YAW_USER_LEFT_SIGN } from "./config";

export type ChallengeId = "blink" | "turnLeft" | "turnRight";
export type LivenessPhase = "align" | "challenge" | "passed" | "failed";
export type FaceFit = "none" | "outside" | "ok";

export interface LivenessSnapshot {
  phase: LivenessPhase;
  faceFit: FaceFit;
  challenges: ChallengeId[];
  /** Completed challenge count; also the index of the active challenge. */
  index: number;
}

const ALL_CHALLENGES: ChallengeId[] = ["blink", "turnLeft", "turnRight"];

function pickChallenges(): ChallengeId[] {
  const pool = [...ALL_CHALLENGES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, CHALLENGES_PER_RUN);
}

function fitOf(obs: FaceObservation): FaceFit {
  if (!obs.hasFace) return "none";
  const cx = obs.x + obs.width / 2;
  const cy = obs.y + obs.height / 2;
  const inOval =
    Math.abs(cx - OVAL.cx) <= THRESHOLDS.centerTolX &&
    Math.abs(cy - OVAL.cy) <= THRESHOLDS.centerTolY &&
    obs.width >= THRESHOLDS.faceMinWidth &&
    obs.width <= THRESHOLDS.faceMaxWidth;
  return inOval ? "ok" : "outside";
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
  const faceLastSeenAtRef = useRef(0);
  const challengeStartRef = useRef(0);
  const blinkClosedSeenRef = useRef(false);
  const turnReachedRef = useRef(false);

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
    blinkClosedSeenRef.current = false;
    turnReachedRef.current = false;
    const next: LivenessSnapshot = {
      phase: "align",
      faceFit: "none",
      challenges: pickChallenges(),
      index: 0,
    };
    snapRef.current = next;
    setSnap(next);
  }, []);

  const process = useCallback(
    (obs: FaceObservation) => {
      const s = snapRef.current;
      if (s.phase === "passed" || s.phase === "failed") return;
      const now = Date.now();
      const fit = fitOf(obs);
      if (obs.hasFace) faceLastSeenAtRef.current = now;

      if (s.phase === "align") {
        if (fit === "ok") {
          alignedSinceRef.current ??= now;
          if (now - alignedSinceRef.current >= THRESHOLDS.alignHoldMs) {
            challengeStartRef.current = now;
            blinkClosedSeenRef.current = false;
            turnReachedRef.current = false;
            commit({ ...s, phase: "challenge", faceFit: fit });
            return;
          }
        } else {
          alignedSinceRef.current = null;
        }
        commit({ ...s, faceFit: fit });
        return;
      }

      // phase === "challenge". While turning, the face box may leave the oval
      // — only a fully lost face (beyond the grace window) resets to align.
      if (!obs.hasFace) {
        if (now - faceLastSeenAtRef.current > THRESHOLDS.faceLostGraceMs) {
          alignedSinceRef.current = null;
          commit({ ...s, phase: "align", faceFit: "none" });
        }
        return;
      }

      if (now - challengeStartRef.current > THRESHOLDS.challengeTimeoutMs) {
        commit({ ...s, phase: "failed", faceFit: fit });
        return;
      }

      const challenge = s.challenges[s.index];
      let completed = false;

      if (challenge === "blink") {
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
      } else {
        const towardUserLeft = obs.yaw * YAW_USER_LEFT_SIGN;
        const towardTarget = challenge === "turnLeft" ? towardUserLeft : -towardUserLeft;
        if (!turnReachedRef.current && towardTarget >= THRESHOLDS.turnYawDeg) {
          turnReachedRef.current = true;
        } else if (turnReachedRef.current && Math.abs(obs.yaw) <= THRESHOLDS.turnReturnDeg) {
          completed = true;
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
      blinkClosedSeenRef.current = false;
      turnReachedRef.current = false;
      commit({ ...s, index: nextIndex, faceFit: "ok" });
    },
    [commit],
  );

  return { state: snap, process, reset };
}
