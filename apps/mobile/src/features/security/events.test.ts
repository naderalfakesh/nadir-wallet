import { describe, expect, it } from "vitest";
import { demoSecurityEvents, initialSecurityEvents } from "./data";
import { eventWhen, formatEventWhen, makeSecurityEvent } from "./events";

// 3:35 AM, the time the future-dated demo entries were seen on a device.
const NOW = new Date(2026, 9, 23, 3, 35);

describe("formatEventWhen", () => {
  it("labels today, yesterday and older days relative to now", () => {
    expect(formatEventWhen(new Date(2026, 9, 23, 3, 17), NOW)).toBe("Today · 3:17 AM");
    expect(formatEventWhen(new Date(2026, 9, 22, 18, 30), NOW)).toBe("Yesterday · 6:30 PM");
    expect(formatEventWhen(new Date(2026, 9, 20, 12, 5), NOW)).toBe("Oct 20 · 12:05 PM");
  });

  it("moves an event from today to yesterday as days pass", () => {
    const event = makeSecurityEvent("x", "backup", new Date(2026, 9, 22, 21, 0));
    expect(event.when).toBe("Today · 9:00 PM");
    expect(eventWhen(event, NOW)).toBe("Yesterday · 9:00 PM");
  });

  it("keeps the stored label of an event saved without a timestamp", () => {
    const legacy = {
      ...makeSecurityEvent("x", "backup", NOW),
      at: undefined,
      when: "May 28 · 4:00 PM",
    };
    expect(eventWhen(legacy, NOW)).toBe("May 28 · 4:00 PM");
  });
});

describe("demo security events", () => {
  it("are all in the past and newest first", () => {
    const events = demoSecurityEvents(NOW);
    expect(events.length).toBeGreaterThan(0);
    let previous = NOW.getTime();
    for (const event of events) {
      expect(event.at).toBeDefined();
      expect(event.at!).toBeLessThan(previous);
      previous = event.at!;
    }
  });

  it("never show a time later today than now", () => {
    for (const event of demoSecurityEvents(NOW)) {
      const label = eventWhen(event, NOW);
      if (label.startsWith("Today")) expect(event.at!).toBeLessThanOrEqual(NOW.getTime());
      expect(label).not.toBe("Today · 2:14 PM");
    }
  });

  it("seed a fresh install", () => {
    expect(initialSecurityEvents([], NOW).map((e) => e.id)).toEqual(
      demoSecurityEvents(NOW).map((e) => e.id),
    );
  });

  it("replace the old fixed-label demo entries but keep real events", () => {
    const real = makeSecurityEvent("e-1", "backup", new Date(2026, 9, 22, 9, 0));
    const legacy = {
      id: "e1",
      type: "unlock",
      severity: "info",
      title: "Unlocked with Face ID",
      detail: "This device",
      when: "Today · 2:14 PM",
    } as const;
    expect(initialSecurityEvents([real, legacy], NOW)).toEqual([real]);
    expect(initialSecurityEvents([legacy], NOW).map((e) => e.id)).toEqual(
      demoSecurityEvents(NOW).map((e) => e.id),
    );
  });
});
