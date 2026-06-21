import { describe, expect, it } from "vitest";
import type { FaceObservation } from "@nadir-wallet/face-liveness";
import { createLivenessMachine, reduceLiveness } from "./livenessChallenge.machine";
import type { ChallengeId, LivenessMachine } from "./livenessChallenge.types";

// A centered face box that both aligns and holds inside the oval.
function face(overrides: Partial<FaceObservation> = {}): FaceObservation {
  return {
    hasFace: true,
    yaw: 0,
    pitch: 0,
    roll: 0,
    leftEyeOpen: 1,
    rightEyeOpen: 1,
    smile: 0,
    x: 0.3,
    y: 0.17,
    width: 0.4,
    height: 0.5,
    timestampMs: 0,
    ...overrides,
  };
}

function challengeMachine(challenges: ChallengeId[]): LivenessMachine {
  return {
    snapshot: { phase: "challenge", faceFit: "ok", challenges, index: 0 },
    alignedSince: 0,
    heldLastAt: 0,
    challengeStart: 0,
    blinkClosedSeen: false,
    reachedTarget: false,
    nodBaseline: null,
    smileSince: null,
  };
}

describe("createLivenessMachine", () => {
  it("starts in alignment with a full set of unique challenges", () => {
    const machine = createLivenessMachine();
    expect(machine.snapshot.phase).toBe("align");
    expect(machine.snapshot.index).toBe(0);
    expect(machine.snapshot.challenges).toHaveLength(5);
    expect(new Set(machine.snapshot.challenges).size).toBe(5);
  });
});

describe("alignment", () => {
  it("starts challenges only after the face is held long enough", () => {
    const aligning = reduceLiveness(createLivenessMachine(), face(), 1000);
    expect(aligning.snapshot.phase).toBe("align");
    expect(aligning.snapshot.faceFit).toBe("ok");

    expect(reduceLiveness(aligning, face(), 1899).snapshot.phase).toBe("align");
    expect(reduceLiveness(aligning, face(), 1900).snapshot.phase).toBe("challenge");
  });

  it("resets the alignment timer when the face leaves the oval", () => {
    const aligning = reduceLiveness(createLivenessMachine(), face(), 1000);
    const lost = reduceLiveness(aligning, face({ hasFace: false }), 1100);
    expect(lost.snapshot.faceFit).toBe("none");
    expect(lost.alignedSince).toBeNull();
  });
});

describe("challenges", () => {
  it("completes a blink (eyes close then open)", () => {
    const closed = reduceLiveness(challengeMachine(["blink"]), face({ leftEyeOpen: 0.1, rightEyeOpen: 0.1 }), 100);
    expect(closed.blinkClosedSeen).toBe(true);
    expect(reduceLiveness(closed, face(), 200).snapshot.phase).toBe("passed");
  });

  it("completes a left turn (reach then return)", () => {
    const turned = reduceLiveness(challengeMachine(["turnLeft"]), face({ yaw: 25 }), 100);
    expect(turned.reachedTarget).toBe(true);
    expect(reduceLiveness(turned, face({ yaw: 0 }), 200).snapshot.phase).toBe("passed");
  });

  it("completes a nod relative to the captured baseline", () => {
    const base = reduceLiveness(challengeMachine(["nod"]), face({ pitch: 5 }), 100);
    expect(base.nodBaseline).toBe(5);
    const down = reduceLiveness(base, face({ pitch: 20 }), 200);
    expect(down.reachedTarget).toBe(true);
    expect(reduceLiveness(down, face({ pitch: 6 }), 300).snapshot.phase).toBe("passed");
  });

  it("requires the smile to be held", () => {
    const grin = reduceLiveness(challengeMachine(["smile"]), face({ smile: 0.9 }), 1000);
    expect(grin.snapshot.phase).toBe("challenge");
    expect(reduceLiveness(grin, face({ smile: 0.9 }), 1500).snapshot.phase).toBe("passed");
  });

  it("advances through multiple challenges before passing", () => {
    const closed = reduceLiveness(challengeMachine(["blink", "smile"]), face({ leftEyeOpen: 0.1, rightEyeOpen: 0.1 }), 100);
    const blinked = reduceLiveness(closed, face(), 200);
    expect(blinked.snapshot.phase).toBe("challenge");
    expect(blinked.snapshot.index).toBe(1);
  });

  it("fails when a challenge exceeds the time limit", () => {
    expect(reduceLiveness(challengeMachine(["blink"]), face(), 10_001).snapshot.phase).toBe("failed");
  });

  it("restarts alignment when the face is lost past the grace window", () => {
    const lost = reduceLiveness(challengeMachine(["blink"]), face({ hasFace: false }), 1000);
    expect(lost.snapshot.phase).toBe("align");
    expect(lost.snapshot.index).toBe(0);
  });

  it("does not change once passed", () => {
    const passed: LivenessMachine = {
      ...challengeMachine(["blink"]),
      snapshot: { phase: "passed", faceFit: "ok", challenges: ["blink"], index: 1 },
    };
    expect(reduceLiveness(passed, face(), 100)).toBe(passed);
  });
});
