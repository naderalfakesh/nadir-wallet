import { describe, expect, it } from "vitest";
import { getSecurityTier } from "./security.utils";

describe("getSecurityTier", () => {
  it("is excellent only at a full score", () => {
    expect(getSecurityTier(1)).toBe("excellent");
    expect(getSecurityTier(0.99)).toBe("actionNeeded");
  });

  it("needs action from 70% up", () => {
    expect(getSecurityTier(0.7)).toBe("actionNeeded");
    expect(getSecurityTier(0.8)).toBe("actionNeeded");
  });

  it("is at risk below 70%", () => {
    expect(getSecurityTier(0.69)).toBe("atRisk");
    expect(getSecurityTier(0.2)).toBe("atRisk");
    expect(getSecurityTier(0)).toBe("atRisk");
  });
});
