import { requireOsAuth, type OsAuthFailure } from "@/services/auth/osAuth";
import type { SendOutcome } from "@/types/status";

export type ConfirmResult =
  | { ok: true; next: "pending" | "failed" }
  | { ok: false; reason: OsAuthFailure };

export function nextSendPhase(outcome: SendOutcome): "pending" | "failed" {
  return outcome === "failed" ? "failed" : "pending";
}

export async function confirmSimulatedSend(
  promptMessage: string,
  outcome: SendOutcome,
): Promise<ConfirmResult> {
  const res = await requireOsAuth(promptMessage);
  if (!res.ok) return res;
  return { ok: true, next: nextSendPhase(outcome) };
}
