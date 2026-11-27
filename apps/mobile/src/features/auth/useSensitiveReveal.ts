import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { isOsAuthInProgress } from "@/services/auth/osAuth";
import { handleSensitiveAppState } from "./sensitiveState";
import { createStaleGuard, type StaleGuard } from "./staleGuard";

export function useSensitiveReveal(clear: () => void): StaleGuard {
  const [guard] = useState(createStaleGuard);

  useEffect(() => () => guard.invalidate(), [guard]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) =>
      handleSensitiveAppState(next, isOsAuthInProgress(), guard, clear),
    );
    return () => sub.remove();
  }, [clear, guard]);

  return guard;
}
