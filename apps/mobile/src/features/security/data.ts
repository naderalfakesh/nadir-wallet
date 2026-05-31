import type { SecurityEvent } from "@/types/status";

export interface SecurityState {
  backedUp: boolean;
  biometricOn: boolean;
  autoLockMin: number;
  pinOn: boolean;
  txSigning: boolean;
  deviceSecure: boolean;
  txProtection: boolean;
}

export const DEFAULT_SECURITY: SecurityState = {
  backedUp: false,
  biometricOn: true,
  autoLockMin: 1,
  pinOn: true,
  txSigning: true,
  deviceSecure: true,
  txProtection: true,
};

export const DEVICE_CHECK_KEYS = [
  "screenLock",
  "notRooted",
  "latestVersion",
  "secureEnclave",
] as const;

export const SECURITY_EVENTS: SecurityEvent[] = [
  { id: "e1", type: "unlock", severity: "info", title: "Unlocked with Face ID", detail: "This device", when: "Today · 2:14 PM" },
  { id: "e2", type: "risk_block", severity: "critical", title: "High-risk recipient blocked", detail: "Send to a reported address prevented", when: "Today · 1:58 PM" },
  { id: "e3", type: "sim_fail", severity: "warning", title: "Transaction simulation failed", detail: "Insufficient gas — not submitted", when: "Yesterday · 6:30 PM" },
  { id: "e4", type: "risk_check", severity: "success", title: "Address risk check completed", detail: "demo.eth — low risk", when: "Yesterday · 6:28 PM" },
  { id: "e5", type: "backup", severity: "success", title: "Recovery phrase backup confirmed", detail: "Verified on-device", when: "May 28 · 4:00 PM" },
  { id: "e6", type: "autolock", severity: "info", title: "Auto-lock enabled", detail: "Locks after 1 minute", when: "May 27 · 9:12 AM" },
];
