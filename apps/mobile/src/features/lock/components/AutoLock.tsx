import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useApp } from "@/providers/AppProvider";
import { createAutoLockTracker } from "../autoLockTracker";

export function AutoLock() {
  const { prefs, sessionUnlocked, lockSession, logEvent } = useApp();
  const [tracker] = useState(createAutoLockTracker);

  // The OS unlock prompt makes the app inactive while the session is still
  // locked; that time must not count against the session it just unlocked.
  useEffect(() => tracker.reset(), [tracker, sessionUnlocked]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      const thresholdMs = prefs.autoLockMinutes * 60 * 1000;
      if (!tracker.onAppState(next, Date.now(), thresholdMs)) return;
      if (prefs.onboardingCompleted && sessionUnlocked) {
        logEvent("autolock_triggered");
        lockSession();
      }
    });
    return () => sub.remove();
  }, [
    tracker,
    prefs.autoLockMinutes,
    prefs.onboardingCompleted,
    sessionUnlocked,
    lockSession,
    logEvent,
  ]);

  return null;
}
