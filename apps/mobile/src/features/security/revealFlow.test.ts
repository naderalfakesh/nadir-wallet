import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleSensitiveAppState, type AppStateLike } from "@/features/auth/sensitiveState";
import { createStaleGuard } from "@/features/auth/staleGuard";
import { isOsAuthInProgress } from "@/services/auth/osAuth";
import { revealMnemonic } from "@/services/storage/mnemonic";
import { revealWhileCurrent } from "./revealPhrase";

const la = vi.hoisted(() => ({
  getEnrolledLevelAsync: vi.fn(),
  authenticateAsync: vi.fn(),
}));
const secure = vi.hoisted(() => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock("react-native", () => ({ Platform: { OS: "android", Version: 28 } }));
vi.mock("expo-local-authentication", () => ({
  ...la,
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
}));
vi.mock("expo-secure-store", () => secure);

const PHRASE = "test test test test test test test test test test test junk";

function deferred<T>() {
  let resolve: (v: T) => void = () => undefined;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

// Mirrors one screen: the words it holds, its guard, and its AppState listener.
function screen() {
  const guard = createStaleGuard();
  let words: string[] | null = null;
  const clear = vi.fn(() => {
    words = null;
  });
  return {
    clear,
    words: () => words,
    appState: (next: AppStateLike) =>
      handleSensitiveAppState(next, isOsAuthInProgress(), guard, clear),
    reveal: () =>
      revealWhileCurrent(
        guard,
        () => revealMnemonic("Reveal"),
        (w) => (words = w),
      ),
  };
}

beforeEach(() => {
  la.getEnrolledLevelAsync.mockReset().mockResolvedValue(1);
  la.authenticateAsync.mockReset().mockResolvedValue({ success: true });
  secure.getItemAsync.mockReset().mockResolvedValue(PHRASE);
});

describe("reveal flow with AppState changes", () => {
  it("keeps a successful device-credential prompt that backgrounded the app", async () => {
    const prompt = deferred<{ success: boolean }>();
    la.authenticateAsync.mockReturnValue(prompt.promise);
    const s = screen();
    const pending = s.reveal();
    await vi.waitFor(() => expect(la.authenticateAsync).toHaveBeenCalled());

    s.appState("background");
    s.appState("active");
    prompt.resolve({ success: true });

    await expect(pending).resolves.toEqual({ ok: true });
    expect(s.words()).toEqual(PHRASE.split(" "));
    expect(s.clear).not.toHaveBeenCalled();
  });

  it("keeps a successful iOS prompt that made the app inactive", async () => {
    const prompt = deferred<{ success: boolean }>();
    la.authenticateAsync.mockReturnValue(prompt.promise);
    const s = screen();
    const pending = s.reveal();
    await vi.waitFor(() => expect(la.authenticateAsync).toHaveBeenCalled());

    s.appState("inactive");
    prompt.resolve({ success: true });

    await expect(pending).resolves.toEqual({ ok: true });
    expect(s.words()).toEqual(PHRASE.split(" "));
  });

  it("drops the phrase when the app really backgrounds during the keychain read", async () => {
    const read = deferred<string | null>();
    secure.getItemAsync.mockReturnValue(read.promise);
    const s = screen();
    const pending = s.reveal();
    await vi.waitFor(() => expect(secure.getItemAsync).toHaveBeenCalled());
    expect(isOsAuthInProgress()).toBe(false);

    s.appState("background");
    read.resolve(PHRASE);

    await expect(pending).resolves.toEqual({ ok: false, reason: "cancelled" });
    expect(s.words()).toBeNull();
    expect(s.clear).toHaveBeenCalledTimes(1);
  });

  it("clears the shown phrase when the app backgrounds after the reveal", async () => {
    const s = screen();
    await expect(s.reveal()).resolves.toEqual({ ok: true });
    expect(s.words()).toEqual(PHRASE.split(" "));

    s.appState("background");
    expect(s.words()).toBeNull();
  });

  it("still fails closed when the prompt that backgrounded the app is cancelled", async () => {
    const prompt = deferred<{ success: boolean; error?: string }>();
    la.authenticateAsync.mockReturnValue(prompt.promise);
    const s = screen();
    const pending = s.reveal();
    await vi.waitFor(() => expect(la.authenticateAsync).toHaveBeenCalled());

    s.appState("background");
    prompt.resolve({ success: false, error: "user_cancel" });

    await expect(pending).resolves.toEqual({ ok: false, reason: "cancelled" });
    expect(secure.getItemAsync).not.toHaveBeenCalled();
    expect(s.words()).toBeNull();
  });
});
