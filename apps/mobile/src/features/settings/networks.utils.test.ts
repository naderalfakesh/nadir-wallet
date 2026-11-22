import { describe, expect, it } from "vitest";
import { countEnabled, toggleNetwork } from "./networks.utils";

describe("toggleNetwork", () => {
  it("adds a disabled network and removes an enabled one", () => {
    expect(toggleNetwork(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleNetwork(["a", "b"], "a")).toEqual(["b"]);
  });

  it("keeps the last enabled network on", () => {
    expect(toggleNetwork(["a"], "a")).toEqual(["a"]);
  });
});

describe("countEnabled", () => {
  it("counts only known networks", () => {
    expect(countEnabled(["a", "b", "gone"], ["a", "b", "c"])).toBe(2);
  });
});
