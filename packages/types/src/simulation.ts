import type { NetworkId } from "./network";
import type { AddressRiskLevel } from "./security";
import type { TransactionType } from "./transaction";

export interface TransactionSimulationRequest {
  networkId: NetworkId;
  from: string;
  to: string;
  value?: string;
  data?: string;
  tokenAddress?: string;
}

export interface EstimatedNetworkFee {
  gasLimit: string;
  maxFeePerGasGwei: string;
  feeNative: string;
  symbol: string;
}

export interface TransactionPreview {
  networkId: NetworkId;
  from: string;
  to: string;
  valueFormatted: string;
  symbol: string;
  type: TransactionType;
}

export interface TransactionSimulationResponse {
  isValid: boolean;
  riskLevel: AddressRiskLevel;
  estimatedFee: EstimatedNetworkFee;
  warnings: string[];
  preview: TransactionPreview;
}
