export type LivenessMode = "standalone" | "gate";

export interface LivenessFlowProps {
  mode: LivenessMode;
  onPass: () => void;
  onCancel: () => void;
}

export type ChallengeId = "blink" | "turnLeft" | "turnRight" | "nod" | "smile";
export type LivenessPhase = "align" | "challenge" | "passed" | "failed";
export type FaceFit = "none" | "outside" | "ok";

export interface LivenessSnapshot {
  phase: LivenessPhase;
  faceFit: FaceFit;
  challenges: ChallengeId[];
  index: number;
}
