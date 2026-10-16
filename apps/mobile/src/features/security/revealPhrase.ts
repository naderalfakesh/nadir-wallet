import type { GateOutcome } from "@/features/auth/DeviceAuthGate";
import type { StaleGuard } from "@/features/auth/staleGuard";
import type { RevealResult } from "@/services/storage/mnemonic";

/** Commits the revealed words only if nothing cleared the screen while the prompt and read ran. */
export async function revealWhileCurrent(
  guard: StaleGuard,
  reveal: () => Promise<RevealResult>,
  commit: (words: string[]) => void,
): Promise<GateOutcome> {
  const { current, value } = await guard.run(reveal);
  if (!current) return { ok: false, reason: "cancelled" };
  if (!value.ok) return value;
  commit(value.mnemonic.split(" "));
  return { ok: true };
}
