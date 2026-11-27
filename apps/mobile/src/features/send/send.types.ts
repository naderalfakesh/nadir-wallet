import type { ScanRejectReason } from "@/features/scan/scanPayload";
import type { PortfolioToken } from "@/features/wallet/types";
import type { TranslationKey } from "@/i18n";

export type SendStep = "to" | "amount" | "review";

export type SendPhase = "liveness" | "auth" | "pending" | "success" | "failed";

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

export interface SendFee {
  amount: number;
  symbol: string;
}

export type ScanTokenPick =
  | { ok: true; token: PortfolioToken }
  | { ok: false; reason: ScanRejectReason };

export interface ReviewCtaState {
  labelKey: TranslationKey;
  disabled: boolean;
}
