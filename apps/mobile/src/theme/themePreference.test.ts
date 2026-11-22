import { describe, expect, it } from "vitest";
import { parseThemePreference, resolveScheme } from "./themePreference";

describe("resolveScheme", () => {
  it("honours an explicit preference regardless of the device", () => {
    expect(resolveScheme("dark", "light")).toBe("dark");
    expect(resolveScheme("light", "dark")).toBe("light");
    expect(resolveScheme("light", null)).toBe("light");
  });

  it("follows the device when the preference is system", () => {
    expect(resolveScheme("system", "light")).toBe("light");
    expect(resolveScheme("system", "dark")).toBe("dark");
  });

  it("falls back to dark when the device reports nothing usable", () => {
    expect(resolveScheme("system", null)).toBe("dark");
    expect(resolveScheme("system", undefined)).toBe("dark");
    expect(resolveScheme("system", "unspecified")).toBe("dark");
  });
});

describe("parseThemePreference", () => {
  it("keeps previously stored dark and light values", () => {
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("light")).toBe("light");
    expect(parseThemePreference("system")).toBe("system");
  });

  it("defaults to system when nothing valid is stored", () => {
    expect(parseThemePreference(null)).toBe("system");
    expect(parseThemePreference("")).toBe("system");
    expect(parseThemePreference("sepia")).toBe("system");
  });
});
