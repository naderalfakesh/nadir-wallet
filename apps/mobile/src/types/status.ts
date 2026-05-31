import type { AddressRiskLevel } from "@nadir-wallet/types";

// UI-facing state taxonomy shared across screens. The backend health and
// price-cache age map onto these; the wallet itself is never "down" because
// keys are local.
export type DataAvailabilityState = "available" | "stale" | "unavailable";
export type BackendStatus = "online" | "api_unavailable" | "rpc_unavailable";
export type PriceStatus = "fresh" | "stale" | "unavailable";
export type SimulationStatus = "passed" | "failed" | "unavailable";

export type RiskLevel = AddressRiskLevel;

export type SecurityEventType =
  | "created"
  | "imported"
  | "unlock"
  | "backup"
  | "biometric_on"
  | "biometric_off"
  | "risk_check"
  | "risk_block"
  | "sim_fail"
  | "autolock"
  | "device_check";

export type SecurityEventSeverity = "info" | "success" | "warning" | "critical";

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  title: string;
  detail: string;
  when: string;
}
