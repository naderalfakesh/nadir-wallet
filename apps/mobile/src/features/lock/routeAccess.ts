export interface SessionAccess {
  onboarded: boolean;
  /** In memory only, so every cold start begins locked. */
  unlocked: boolean;
}

export type RouteGroup = "onboarding" | "lock" | "wallet";

/**
 * Top-level routes by who may open them. `public` routes only redirect; every
 * other route is registered under exactly one Stack.Protected group in the
 * root layout, so a deep link can't mount it while its group is closed.
 */
export const ROUTE_GROUPS = {
  public: ["index", "+not-found"],
  onboarding: ["onboarding"],
  lock: ["lock"],
  wallet: ["(tabs)", "send", "token/[id]", "backup", "reveal", "change-passcode", "liveness", "scan"],
} as const satisfies Record<RouteGroup | "public", readonly string[]>;

/** The single group that is open for this session state. */
export function openGroup({ onboarded, unlocked }: SessionAccess): RouteGroup {
  if (!onboarded) return "onboarding";
  return unlocked ? "wallet" : "lock";
}

export function groupGuards(access: SessionAccess): Record<RouteGroup, boolean> {
  const open = openGroup(access);
  return { onboarding: open === "onboarding", lock: open === "lock", wallet: open === "wallet" };
}

export function entryHref(access: SessionAccess): "/onboarding" | "/lock" | "/home" {
  const open = openGroup(access);
  return open === "onboarding" ? "/onboarding" : open === "lock" ? "/lock" : "/home";
}
