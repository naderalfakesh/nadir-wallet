import { describe, expect, it, vi } from "vitest";
import { createStaleGuard } from "@/features/auth/staleGuard";
import type { RevealResult } from "@/services/storage/mnemonic";
import { revealWhileCurrent } from "./revealPhrase";

const PHRASE = "test test test test test test test test test test test junk";

function deferred() {
  let resolve: (v: RevealResult) => void = () => undefined;
  const promise = new Promise<RevealResult>((r) => (resolve = r));
  return { promise, resolve };
}

describe("revealWhileCurrent", () => {
  it("commits the words when nothing intervened", async () => {
    const commit = vi.fn();
    const res = await revealWhileCurrent(
      createStaleGuard(),
      async () => ({ ok: true, mnemonic: PHRASE }),
      commit,
    );
    expect(res).toEqual({ ok: true });
    expect(commit).toHaveBeenCalledWith(PHRASE.split(" "));
  });

  it("drops a reveal that completes after a background clear", async () => {
    const guard = createStaleGuard();
    const commit = vi.fn();
    const read = deferred();
    const pending = revealWhileCurrent(guard, () => read.promise, commit);
    guard.invalidate();
    read.resolve({ ok: true, mnemonic: PHRASE });
    await expect(pending).resolves.toEqual({ ok: false, reason: "cancelled" });
    expect(commit).not.toHaveBeenCalled();
  });

  it("drops a reveal that completes after unmount, even if invalidated twice", async () => {
    const guard = createStaleGuard();
    const commit = vi.fn();
    const read = deferred();
    const pending = revealWhileCurrent(guard, () => read.promise, commit);
    guard.invalidate();
    guard.invalidate();
    read.resolve({ ok: true, mnemonic: PHRASE });
    await expect(pending).resolves.toEqual({ ok: false, reason: "cancelled" });
    expect(commit).not.toHaveBeenCalled();
  });

  it("allows a fresh reveal started after an earlier clear", async () => {
    const guard = createStaleGuard();
    guard.invalidate();
    const commit = vi.fn();
    await expect(
      revealWhileCurrent(guard, async () => ({ ok: true, mnemonic: PHRASE }), commit),
    ).resolves.toEqual({ ok: true });
    expect(commit).toHaveBeenCalledTimes(1);
  });

  it("only the reveal started after the clear wins when two overlap", async () => {
    const guard = createStaleGuard();
    const commit = vi.fn();
    const first = deferred();
    const stale = revealWhileCurrent(guard, () => first.promise, commit);
    guard.invalidate();
    const fresh = revealWhileCurrent(guard, async () => ({ ok: true, mnemonic: PHRASE }), commit);
    await expect(fresh).resolves.toEqual({ ok: true });
    first.resolve({ ok: true, mnemonic: "stale words" });
    await expect(stale).resolves.toEqual({ ok: false, reason: "cancelled" });
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(PHRASE.split(" "));
  });

  it("passes failures through without committing", async () => {
    const commit = vi.fn();
    await expect(
      revealWhileCurrent(
        createStaleGuard(),
        async () => ({ ok: false, reason: "lockout" }),
        commit,
      ),
    ).resolves.toEqual({ ok: false, reason: "lockout" });
    expect(commit).not.toHaveBeenCalled();
  });

  it("propagates a rejected read so the gate can fail closed", async () => {
    const commit = vi.fn();
    await expect(
      revealWhileCurrent(createStaleGuard(), () => Promise.reject(new Error("x")), commit),
    ).rejects.toThrow("x");
    expect(commit).not.toHaveBeenCalled();
  });
});
