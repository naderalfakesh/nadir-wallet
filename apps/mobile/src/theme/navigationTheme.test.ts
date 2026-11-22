import { describe, expect, it } from "vitest";
import { darkColors, lightColors } from "./colors";
import { navigationColors } from "./navigationTheme";

describe("navigationColors", () => {
  it("paints the navigator with the dark app background on the dark theme", () => {
    const nav = navigationColors(darkColors, "dark");
    expect(nav.dark).toBe(true);
    expect(nav.colors.background).toBe(darkColors.bg);
    expect(nav.colors.card).toBe(darkColors.surface);
    expect(nav.colors.text).toBe(darkColors.text);
  });

  it("paints the navigator with the light app background on the light theme", () => {
    const nav = navigationColors(lightColors, "light");
    expect(nav.dark).toBe(false);
    expect(nav.colors.background).toBe(lightColors.bg);
    expect(nav.colors.primary).toBe(lightColors.accent);
  });
});
