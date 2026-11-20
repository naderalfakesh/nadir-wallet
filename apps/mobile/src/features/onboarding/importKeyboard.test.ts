/// <reference types="node" />
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The test runner has no native renderer, so these pin the layout props that
// keep the Import button reachable while the autofocused keyboard is up.
const source = readFileSync(join(__dirname, "ImportScreen.tsx"), "utf8");
const flow = readFileSync(join(__dirname, "OnboardingFlow.tsx"), "utf8");

describe("Import wallet keyboard handling", () => {
  it("uses the shared keyboard-avoiding layout for the import step", () => {
    expect(flow).toMatch(/<Screen avoidKeyboard>\s*<ImportScreen/);
  });

  it("scrolls, and lets the first tap reach the Import button while the keyboard is open", () => {
    expect(source).toMatch(/<ScrollView[\s\S]*?keyboardShouldPersistTaps="handled"/);
    const scroll = source.slice(source.indexOf("<ScrollView"), source.indexOf("</ScrollView>"));
    expect(scroll).toMatch(/onDone\(normalized\)/);
  });

  it("closes the keyboard on Return without submitting the phrase", () => {
    expect(source).toMatch(/submitBehavior="blurAndSubmit"/);
    expect(source).not.toMatch(/onSubmitEditing=/);
  });
});
