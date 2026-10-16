/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { entryHref, groupGuards, openGroup, ROUTE_GROUPS, type RouteGroup } from "./routeAccess";

const APP_DIR = join(__dirname, "..", "..", "app");

// Top-level route names as expo-router registers them in the root Stack.
function topLevelRoutes(): string[] {
  const names = new Set<string>();
  for (const entry of readdirSync(APP_DIR)) {
    const full = join(APP_DIR, entry);
    if (statSync(full).isDirectory()) {
      if (entry.startsWith("(")) {
        names.add(entry);
      } else {
        for (const file of readdirSync(full)) {
          names.add(relative(APP_DIR, join(full, file)).replace(/\.tsx?$/, ""));
        }
      }
    } else if (entry !== "_layout.tsx") {
      names.add(entry.replace(/\.tsx?$/, ""));
    }
  }
  return [...names].sort();
}

describe("openGroup", () => {
  it("opens only onboarding before a wallet exists, whatever the session says", () => {
    expect(openGroup({ onboarded: false, unlocked: false })).toBe("onboarding");
    expect(openGroup({ onboarded: false, unlocked: true })).toBe("onboarding");
  });

  it("opens only the lock screen on a cold start (session starts locked)", () => {
    expect(openGroup({ onboarded: true, unlocked: false })).toBe("lock");
  });

  it("opens the wallet only after unlock", () => {
    expect(openGroup({ onboarded: true, unlocked: true })).toBe("wallet");
  });
});

describe("groupGuards", () => {
  it.each([
    [{ onboarded: false, unlocked: false }, "onboarding"],
    [{ onboarded: true, unlocked: false }, "lock"],
    [{ onboarded: true, unlocked: true }, "wallet"],
  ] as const)("opens exactly one group for %o", (access, open) => {
    const guards = groupGuards(access);
    const opened = (Object.keys(guards) as RouteGroup[]).filter((g) => guards[g]);
    expect(opened).toEqual([open]);
  });
});

describe("entryHref", () => {
  it("routes to the open group", () => {
    expect(entryHref({ onboarded: false, unlocked: false })).toBe("/onboarding");
    expect(entryHref({ onboarded: true, unlocked: false })).toBe("/lock");
    expect(entryHref({ onboarded: true, unlocked: true })).toBe("/home");
  });
});

describe("deep links into protected routes", () => {
  const wallet = ROUTE_GROUPS.wallet as readonly string[];

  it.each(["send", "scan", "reveal", "backup", "change-passcode", "liveness", "token/[id]", "(tabs)"])(
    "%s is closed on a cold start and while locked",
    (route) => {
      expect(wallet).toContain(route);
      expect(groupGuards({ onboarded: true, unlocked: false }).wallet).toBe(false);
      expect(groupGuards({ onboarded: false, unlocked: false }).wallet).toBe(false);
    },
  );

  it("onboarding can't be reopened over an existing wallet, locked or not", () => {
    expect(groupGuards({ onboarded: true, unlocked: false }).onboarding).toBe(false);
    expect(groupGuards({ onboarded: true, unlocked: true }).onboarding).toBe(false);
  });
});

describe("route registry matches src/app", () => {
  it("classifies every route file exactly once", () => {
    const classified = Object.values(ROUTE_GROUPS).flat();
    expect([...classified].sort()).toEqual(topLevelRoutes());
    expect(new Set(classified).size).toBe(classified.length);
  });

  it("registers each guarded group's screens inside its own Stack.Protected block", () => {
    const layout = readFileSync(join(APP_DIR, "_layout.tsx"), "utf8");
    const blocks = [...layout.matchAll(/<Stack\.Protected guard=\{guard\.(\w+)\}>([\s\S]*?)<\/Stack\.Protected>/g)];
    const registered: Record<string, string[]> = {};
    for (const [, group, body] of blocks) {
      registered[group] = [...body.matchAll(/<Stack\.Screen name="([^"]+)"/g)].map((m) => m[1]);
    }
    expect(registered).toEqual({
      onboarding: [...ROUTE_GROUPS.onboarding],
      lock: [...ROUTE_GROUPS.lock],
      wallet: [...ROUTE_GROUPS.wallet],
    });

    const outside = layout.replace(/<Stack\.Protected[\s\S]*?<\/Stack\.Protected>/g, "");
    const unguarded = [...outside.matchAll(/<Stack\.Screen name="([^"]+)"/g)].map((m) => m[1]);
    expect(unguarded.sort()).toEqual([...ROUTE_GROUPS.public].sort());
  });

  it("keeps public routes free of wallet content (they only redirect)", () => {
    for (const route of ROUTE_GROUPS.public) {
      const source = readFileSync(join(APP_DIR, `${route}.tsx`), "utf8");
      expect(source).toMatch(/<Redirect /);
      expect(source).not.toMatch(/features\/(send|scan|security|liveness|home|token)/);
    }
  });
});
