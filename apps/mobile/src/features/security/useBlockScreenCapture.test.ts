import { beforeEach, describe, expect, it, vi } from "vitest";

// A minimal effect runner: records each effect so the test can mount and unmount it.
const effects = vi.hoisted(
  () => [] as { run: () => void | (() => void); cleanup?: void | (() => void) }[],
);
const release = vi.hoisted(() => vi.fn());
const hold = vi.hoisted(() => vi.fn(() => release));

vi.mock("react", () => ({
  useId: () => ":r1:",
  useEffect: (run: () => void | (() => void)) => void effects.push({ run }),
}));
vi.mock("@/services/device/screenCapture", () => ({ holdScreenCaptureBlock: hold }));

const { useBlockScreenCapture } = await import("./useBlockScreenCapture");

function mount() {
  for (const effect of effects) effect.cleanup = effect.run();
}
function unmount() {
  for (const effect of effects) if (typeof effect.cleanup === "function") effect.cleanup();
}

beforeEach(() => {
  effects.length = 0;
  vi.clearAllMocks();
});

describe("useBlockScreenCapture", () => {
  it("blocks capture on mount and allows it again on unmount", () => {
    useBlockScreenCapture();
    mount();
    expect(hold).toHaveBeenCalledExactlyOnceWith("phrase-:r1:");
    expect(release).not.toHaveBeenCalled();
    unmount();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it("does nothing while inactive", () => {
    useBlockScreenCapture(false);
    mount();
    unmount();
    expect(hold).not.toHaveBeenCalled();
  });
});

describe("screens that show the recovery phrase", () => {
  it.each([
    "../security/RevealScreen.tsx",
    "../security/BackupScreen.tsx",
    "../onboarding/OnboardingFlow.tsx",
  ])("%s blocks screen capture", async (file) => {
    const { readFileSync } = await vi.importActual<typeof import("node:fs")>("node:fs");
    const source = readFileSync(new URL(file, import.meta.url), "utf8");
    expect(source).toMatch(/useBlockScreenCapture\(/);
  });
});
