export type SendStep = "to" | "amount" | "review";

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

export type SendPhase = "liveness" | "auth" | "pending" | "success" | "failed";
