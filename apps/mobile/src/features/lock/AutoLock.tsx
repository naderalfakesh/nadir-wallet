import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useApp } from "@/providers/AppProvider";

// Locks the wallet when it returns to the foreground after being backgrounded
// longer than the persisted auto-lock window.
export function AutoLock() {
  const router = useRouter();
  const segments = useSegments();
  const { prefs, logEvent } = useApp();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const prev = appState.current;
      appState.current = next;

      if (next === "inactive" || next === "background") {
        backgroundedAt.current = Date.now();
        return;
      }
      if (next === "active" && prev !== "active" && backgroundedAt.current != null) {
        const elapsedMs = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        const thresholdMs = prefs.autoLockMinutes * 60 * 1000;
        const onLockOrOnboarding = segments[0] === "lock" || segments[0] === "onboarding";
        if (prefs.onboardingCompleted && !onLockOrOnboarding && elapsedMs >= thresholdMs) {
          logEvent("autolock_triggered");
          router.replace("/lock");
        }
      }
    });
    return () => sub.remove();
  }, [prefs.autoLockMinutes, prefs.onboardingCompleted, segments, router, logEvent]);

  return null;
}
