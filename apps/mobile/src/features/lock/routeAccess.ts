export interface SessionAccess {
  onboarded: boolean;
  unlocked: boolean;
}

export type RouteGroup = "onboarding" | "lock" | "wallet";

export const ROUTE_GROUPS = {
  public: ["index", "+not-found"],
  onboarding: ["onboarding"],
  lock: ["lock"],
  wallet: [
    "(tabs)",
    "send",
    "token/[id]",
    "backup",
    "reveal",
    "change-passcode",
    "liveness",
    "scan",
  ],
} as const satisfies Record<RouteGroup | "public", readonly string[]>;

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
