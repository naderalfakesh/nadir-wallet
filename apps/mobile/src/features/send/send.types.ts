import type { AddressRisk } from "@/features/wallet/risk";

export type SendStep = "to" | "amount" | "review";

export type SimulationStatus = "passed" | "failed" | "unavailable";

export interface RecipientValidation {
  trimmedTo: string;
  looksAddr: boolean;
  looksEns: boolean;
  toValid: boolean;
  toError: boolean;
}

export interface RiskCopy {
  title: string;
  detail: string;
  levelLabel: string;
}

export type RiskTranslator = (key: string, values?: Record<string, string | number>) => string;

export interface SendRiskState {
  risk: AddressRisk | null;
  checksAvailable: boolean;
  riskLoading: boolean;
  blocked: boolean;
}
