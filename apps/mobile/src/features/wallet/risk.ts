import type { RiskLevel } from "@/types/status";
import { RECIPIENTS, type ChainId } from "./data";

export type RiskReason = "reported" | "known" | "firstTime";

export interface AddressRisk {
  level: RiskLevel;
  blocked: boolean;
  reason: RiskReason;
}

function findRecipient(address: string) {
  const a = address.trim().toLowerCase();
  return RECIPIENTS.find(
    (r) => r.addr.toLowerCase() === a || (r.label != null && r.label.toLowerCase() === a),
  );
}

// Demo risk service — the on-device equivalent of the backend address check.
// It only ever inspects a public address.
export function assessRecipient(address: string): AddressRisk | null {
  const a = address.trim().toLowerCase();
  if (a.length < 4) return null;
  const hit = findRecipient(address);
  if ((hit && hit.flagged) || /dead|scam|drain/.test(a)) {
    return { level: "high", blocked: true, reason: "reported" };
  }
  if (hit && hit.known) return { level: "low", blocked: false, reason: "known" };
  return { level: "medium", blocked: false, reason: "firstTime" };
}

// Infers the network a recipient is known on, to flag network mismatches.
export function recipientNetwork(address: string): ChainId | null {
  const hit = findRecipient(address);
  if (hit) return hit.network;
  if (/\.eth$/i.test(address.trim())) return "ethereum";
  return null;
}
