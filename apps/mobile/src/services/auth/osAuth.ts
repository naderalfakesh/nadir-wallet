import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { t } from "@/i18n";

export type OsAuthFailure =
  | "unavailable"
  | "needsStrongBiometric"
  | "cancelled"
  | "failed"
  | "lockout";
export type OsAuthResult = { ok: true } | { ok: false; reason: OsAuthFailure };

type PromptOptions = Pick<
  LocalAuthentication.LocalAuthenticationOptions,
  "disableDeviceFallback" | "biometricsSecurityLevel" | "cancelLabel"
>;
export type OsAuthPlan = { prompt: PromptOptions } | { refuse: OsAuthFailure };

let inFlight = false;

export function isOsAuthInProgress(): boolean {
  return inFlight;
}

export function mapAuthError(error: string | undefined): OsAuthFailure {
  switch (error) {
    case "user_cancel":
    case "app_cancel":
    case "system_cancel":
    case "user_fallback":
      return "cancelled";
    case "not_enrolled":
    case "not_available":
    case "passcode_not_set":
    case "missing_usage_description":
      return "unavailable";
    case "lockout":
      return "lockout";
    default:
      return "failed";
  }
}

export function planOsAuth(
  level: LocalAuthentication.SecurityLevel,
  os: string,
  version: number | string,
  cancelLabel: string,
): OsAuthPlan {
  const { SecurityLevel } = LocalAuthentication;
  if (level === SecurityLevel.NONE) return { refuse: "unavailable" };
  const api = Number(version);
  // AndroidX BiometricPrompt throws on BIOMETRIC_STRONG | DEVICE_CREDENTIAL on API 28-29.
  if (os !== "android" || api < 28 || api > 29) {
    return { prompt: { disableDeviceFallback: false, biometricsSecurityLevel: "strong" } };
  }
  if (level === SecurityLevel.BIOMETRIC_STRONG) {
    // Biometric-only prompts require a negative button or PromptInfo.build() throws.
    return {
      prompt: { disableDeviceFallback: true, biometricsSecurityLevel: "strong", cancelLabel },
    };
  }
  if (level === SecurityLevel.SECRET) {
    return { prompt: { disableDeviceFallback: false, biometricsSecurityLevel: "weak" } };
  }
  return { refuse: "needsStrongBiometric" };
}

export async function requireOsAuth(promptMessage: string): Promise<OsAuthResult> {
  if (inFlight) return { ok: false, reason: "cancelled" };
  inFlight = true;
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    const plan = planOsAuth(level, Platform.OS, Platform.Version, t("lock.osAuth.cancel"));
    if ("refuse" in plan) return { ok: false, reason: plan.refuse };
    const res = await LocalAuthentication.authenticateAsync({ promptMessage, ...plan.prompt });
    return res.success ? { ok: true } : { ok: false, reason: mapAuthError(res.error) };
  } catch {
    return { ok: false, reason: "failed" };
  } finally {
    inFlight = false;
  }
}
