import type { DemoToken } from "@/features/wallet/data";
import type { AddressRisk } from "@/features/wallet/risk";
import type { SimulationStatus, RecipientValidation, RiskCopy, RiskTranslator } from "./send.types";

const EVM_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{6,}$/;
const ENS_PATTERN = /\.(eth|sol)$/i;

export function getRecipientValidation(to: string): RecipientValidation {
  const trimmedTo = to.trim();
  const looksAddr = EVM_ADDRESS_PATTERN.test(trimmedTo);
  const looksEns = ENS_PATTERN.test(trimmedTo);
  const toValid = looksAddr || looksEns;
  const toError = trimmedTo.length > 3 && !toValid;

  return { trimmedTo, looksAddr, looksEns, toValid, toError };
}

export function getRiskCopy(risk: AddressRisk, t: RiskTranslator): RiskCopy {
  const message = {
    reported: { title: t("send.risk.reportedTitle"), detail: t("send.risk.reportedDetail") },
    known: { title: t("send.risk.knownTitle"), detail: t("send.risk.knownDetail") },
    firstTime: { title: t("send.risk.firstTimeTitle"), detail: t("send.risk.firstTimeDetail") },
  }[risk.reason];

  const levelLabel = t(
    risk.level === "low"
      ? "send.risk.levelLow"
      : risk.level === "medium"
        ? "send.risk.levelMedium"
        : "send.risk.levelHigh",
  );

  return { ...message, levelLabel };
}

export function getLocalSimulationStatus({
  checksAvailable,
  sendSim,
}: {
  checksAvailable: boolean;
  sendSim: "pass" | "fail";
}): SimulationStatus {
  if (!checksAvailable) return "unavailable";
  return sendSim === "fail" ? "failed" : "passed";
}

export function getLiveSimulationStatus(status: "idle" | "passed" | "failed" | "unavailable"): SimulationStatus {
  return status === "passed" || status === "failed" ? status : "unavailable";
}

export function getInitialToken(tokens: DemoToken[], tokenId: string | undefined, fallback: DemoToken): DemoToken {
  const selected = tokens.find((token) => token.id === tokenId);
  if (selected) return selected;
  return tokens[0] ?? fallback;
}
