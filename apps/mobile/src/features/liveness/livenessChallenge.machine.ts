import type { FaceObservation } from "@nadir-wallet/face-liveness";
import { THRESHOLDS, YAW_USER_LEFT_SIGN } from "./config";
import { getFaceFit, isFaceHeldInFrame, pickChallenges } from "./livenessChallenge.utils";
import type { LivenessMachine } from "./livenessChallenge.types";

const CLEARED_PROGRESS = {
  blinkClosedSeen: false,
  reachedTarget: false,
  nodBaseline: null,
  smileSince: null,
} as const;

export function createLivenessMachine(): LivenessMachine {
  return {
    snapshot: { phase: "align", faceFit: "none", challenges: pickChallenges(), index: 0 },
    alignedSince: null,
    heldLastAt: 0,
    challengeStart: 0,
    ...CLEARED_PROGRESS,
  };
}

/**
 * Pure transition: given the current machine and one face observation at time
 * `now`, returns the next machine. Deterministic - the only randomness is the
 * challenge order chosen at creation/reset - so it can be unit-tested directly.
 */
export function reduceLiveness(machine: LivenessMachine, obs: FaceObservation, now: number): LivenessMachine {
  const snapshot = machine.snapshot;
  if (snapshot.phase === "passed" || snapshot.phase === "failed") return machine;

  if (snapshot.phase === "align") {
    const faceFit = getFaceFit(obs);
    if (faceFit !== "ok") {
      return { ...machine, alignedSince: null, snapshot: { ...snapshot, faceFit } };
    }
    const alignedSince = machine.alignedSince ?? now;
    if (now - alignedSince >= THRESHOLDS.alignHoldMs) {
      return {
        ...machine,
        ...CLEARED_PROGRESS,
        alignedSince,
        challengeStart: now,
        heldLastAt: now,
        snapshot: { ...snapshot, phase: "challenge", faceFit: "ok" },
      };
    }
    return { ...machine, alignedSince, snapshot: { ...snapshot, faceFit } };
  }

  // Challenge phase - alignment is enforced live via the looser hold test. A
  // blink or in-place turn keeps the hold; getting very close, far, or
  // off-center drops it: amber immediately, restart if sustained.
  if (!isFaceHeldInFrame(obs)) {
    const faceFit = obs.hasFace ? "outside" : "none";
    if (now - machine.heldLastAt > THRESHOLDS.faceLostGraceMs) {
      return {
        ...machine,
        ...CLEARED_PROGRESS,
        alignedSince: null,
        snapshot: { ...snapshot, phase: "align", index: 0, faceFit },
      };
    }
    return { ...machine, snapshot: { ...snapshot, faceFit } };
  }

  let next: LivenessMachine = { ...machine, heldLastAt: now };

  if (now - machine.challengeStart > THRESHOLDS.challengeTimeoutMs) {
    return { ...next, snapshot: { ...snapshot, phase: "failed", faceFit: "ok" } };
  }

  const challenge = snapshot.challenges[snapshot.index];
  let completed = false;

  if (challenge === "blink") {
    const left = obs.leftEyeOpen;
    const right = obs.rightEyeOpen;
    if (left >= 0 && right >= 0) {
      const eyes = Math.min(left, right);
      if (!machine.blinkClosedSeen && eyes <= THRESHOLDS.eyeClosedBelow) {
        next = { ...next, blinkClosedSeen: true };
      } else if (machine.blinkClosedSeen && eyes >= THRESHOLDS.eyeOpenAbove) {
        completed = true;
      }
    }
  } else if (challenge === "turnLeft" || challenge === "turnRight") {
    const towardUserLeft = obs.yaw * YAW_USER_LEFT_SIGN;
    const towardTarget = challenge === "turnLeft" ? towardUserLeft : -towardUserLeft;
    if (!machine.reachedTarget && towardTarget >= THRESHOLDS.turnYawDeg) {
      next = { ...next, reachedTarget: true };
    } else if (machine.reachedTarget && Math.abs(obs.yaw) <= THRESHOLDS.turnReturnDeg) {
      completed = true;
    }
  } else if (challenge === "nod") {
    // Baseline-relative so a per-pose pitch bias doesn't make it finicky.
    if (machine.nodBaseline === null) {
      next = { ...next, nodBaseline: obs.pitch };
    } else {
      const delta = Math.abs(obs.pitch - machine.nodBaseline);
      if (!machine.reachedTarget && delta >= THRESHOLDS.nodDeltaDeg) {
        next = { ...next, reachedTarget: true };
      } else if (machine.reachedTarget && delta <= THRESHOLDS.nodReturnDeltaDeg) {
        completed = true;
      }
    }
  } else if (challenge === "smile") {
    if (obs.smile >= 0 && obs.smile >= THRESHOLDS.smileAbove) {
      const smileSince = machine.smileSince ?? now;
      next = { ...next, smileSince };
      if (now - smileSince >= THRESHOLDS.smileHoldMs) {
        completed = true;
      }
    } else {
      next = { ...next, smileSince: null };
    }
  }

  if (!completed) {
    return { ...next, snapshot: { ...snapshot, faceFit: "ok" } };
  }

  const nextIndex = snapshot.index + 1;
  if (nextIndex >= snapshot.challenges.length) {
    return { ...next, snapshot: { ...snapshot, phase: "passed", faceFit: "ok", index: nextIndex } };
  }
  return {
    ...next,
    ...CLEARED_PROGRESS,
    challengeStart: now,
    snapshot: { ...snapshot, index: nextIndex, faceFit: "ok" },
  };
}
