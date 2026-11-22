import { describe, expect, it } from "vitest";
import {
  formatVerifiedDate,
  getSecurityScore,
  getSecurityTier,
  latestEvents,
} from "./security.utils";

describe("getSecurityTier", () => {
  it("is excellent only at a full score", () => {
    expect(getSecurityTier(1)).toBe("excellent");
    expect(getSecurityTier(0.99)).toBe("actionNeeded");
  });

  it("needs action from 60% up", () => {
    expect(getSecurityTier(3 / 4)).toBe("actionNeeded");
    expect(getSecurityTier(0.6)).toBe("actionNeeded");
    expect(getSecurityTier(0.8)).toBe("actionNeeded");
  });

  it("is at risk below 60%", () => {
    expect(getSecurityTier(0.59)).toBe("atRisk");
    expect(getSecurityTier(2 / 4)).toBe("atRisk");
    expect(getSecurityTier(0)).toBe("atRisk");
  });
});

describe("getSecurityScore", () => {
  const none = {
    backupConfirmed: false,
    identityVerifiedAt: 0,
    biometricEnabled: false,
    txProtection: false,
  };

  it("counts the four user-changeable protections", () => {
    expect(getSecurityScore(none)).toEqual({ score: 0, total: 4 });
    expect(
      getSecurityScore({
        backupConfirmed: true,
        identityVerifiedAt: 1700000000000,
        biometricEnabled: true,
        txProtection: true,
      }),
    ).toEqual({ score: 4, total: 4 });
  });

  it("treats a zero timestamp as not verified", () => {
    expect(getSecurityScore({ ...none, txProtection: true }).score).toBe(1);
    expect(getSecurityScore({ ...none, identityVerifiedAt: 5 }).score).toBe(1);
  });
});

describe("formatVerifiedDate", () => {
  it("formats a short month, day and year", () => {
    expect(formatVerifiedDate(new Date(2026, 10, 22, 12).getTime())).toBe("Nov 22, 2026");
  });
});

describe("latestEvents", () => {
  it("caps the list at five by default", () => {
    const events = [1, 2, 3, 4, 5, 6, 7];
    expect(latestEvents(events)).toEqual([1, 2, 3, 4, 5]);
    expect(latestEvents([1, 2])).toEqual([1, 2]);
  });
});
