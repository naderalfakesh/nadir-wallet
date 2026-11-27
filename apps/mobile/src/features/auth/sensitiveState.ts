import type { StaleGuard } from "./staleGuard";

export type AppStateLike = "active" | "background" | "inactive" | "unknown" | "extension";

// Keep revealed secrets alive while the OS auth prompt causes iOS "inactive" or Android "background".
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
