import { requireOsAuth, type OsAuthFailure } from "@/services/auth/osAuth";
import type { SendOutcome } from "@/providers/DemoStateProvider";

export type ConfirmResult =
  | { ok: true; next: "pending" | "failed" }
  | { ok: false; reason: OsAuthFailure };

/** OS authentication gates the demo outcome; there is no key use, signing or broadcast behind it. */
export async function confirmSimulatedSend(
  promptMessage: string,
  outcome: SendOutcome,
): Promise<ConfirmResult> {
  const res = await requireOsAuth(promptMessage);
  if (!res.ok) return res;
  return { ok: true, next: outcome === "failed" ? "failed" : "pending" };
}
