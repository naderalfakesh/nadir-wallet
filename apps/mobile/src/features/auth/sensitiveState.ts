import type { StaleGuard } from "./staleGuard";

export type AppStateLike = "active" | "background" | "inactive" | "unknown" | "extension";

/**
 * Revealed secrets are dropped whenever the app leaves the foreground, so they
 * don't survive in the app-switcher snapshot or behind the auto-lock window.
 * The OS prompt itself makes iOS report "inactive" and, for Android device
 * credentials shown in a separate activity, "background"; neither may cancel
 * the reveal it is about to authorize. Nothing is on screen during the prompt,
 * and the keychain read after it is still covered because the prompt is over.
 */
export function shouldClearSensitive(next: AppStateLike, authInProgress: boolean): boolean {
  if (authInProgress) return false;
  return next === "background" || next === "inactive";
}

export function handleSensitiveAppState(
  next: AppStateLike,
  authInProgress: boolean,
  guard: Pick<StaleGuard, "invalidate">,
  clear: () => void,
): void {
  if (!shouldClearSensitive(next, authInProgress)) return;
  guard.invalidate();
  clear();
}
