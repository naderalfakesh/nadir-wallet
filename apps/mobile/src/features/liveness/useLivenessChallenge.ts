import { useCallback, useRef, useState } from "react";
import type { FaceObservation } from "@nadir-wallet/face-liveness";
import { createLivenessMachine, reduceLiveness } from "./livenessChallenge.machine";
import type { LivenessSnapshot } from "./livenessChallenge.types";

function sameSnapshot(a: LivenessSnapshot, b: LivenessSnapshot): boolean {
  return a.phase === b.phase && a.faceFit === b.faceFit && a.index === b.index && a.challenges === b.challenges;
}

export function useLivenessChallenge() {
  const [initialMachine] = useState(createLivenessMachine);
  const machineRef = useRef(initialMachine);
  const [snapshot, setSnapshot] = useState<LivenessSnapshot>(initialMachine.snapshot);

  // Driven from the camera worklet at ~30 fps; only publishes to React when the
  // user-visible snapshot actually changes.
  const process = useCallback((obs: FaceObservation) => {
    const previous = machineRef.current.snapshot;
    const next = reduceLiveness(machineRef.current, obs, Date.now());
    machineRef.current = next;
    if (!sameSnapshot(previous, next.snapshot)) {
      setSnapshot(next.snapshot);
    }
  }, []);

  const reset = useCallback(() => {
    const machine = createLivenessMachine();
    machineRef.current = machine;
    setSnapshot(machine.snapshot);
  }, []);

  return { state: snapshot, process, reset };
}
