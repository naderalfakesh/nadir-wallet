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

/** True while the OS prompt is up; the prompt itself makes iOS report the app as inactive. */
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

/**
 * Picks prompt options for the enrolled level. AndroidX BiometricPrompt throws
 * on BIOMETRIC_STRONG | DEVICE_CREDENTIAL on API 28-29, so there the strong
 * biometric and the device credential are offered separately instead of
 * dropping to Class 2 biometrics.
 */
export function planOsAuth(
  level: LocalAuthentication.SecurityLevel,
  os: string,
  version: number | string,
  cancelLabel: string,
): OsAuthPlan {
  const { SecurityLevel } = LocalAuthentication;
  if (level === SecurityLevel.NONE) return { refuse: "unavailable" };
  const api = Number(version);
  if (os !== "android" || api < 28 || api > 29) {
    return { prompt: { disableDeviceFallback: false, biometricsSecurityLevel: "strong" } };
  }
  if (level === SecurityLevel.BIOMETRIC_STRONG) {
    // Biometric-only prompts need a negative button or PromptInfo.build() throws.
    return {
      prompt: { disableDeviceFallback: true, biometricsSecurityLevel: "strong", cancelLabel },
    };
  }
  // No biometric is enrolled, so only the device credential can satisfy this prompt.
  if (level === SecurityLevel.SECRET) {
    return { prompt: { disableDeviceFallback: false, biometricsSecurityLevel: "weak" } };
  }
  return { refuse: "needsStrongBiometric" };
}

/**
 * Asks the OS to verify the device owner: Face ID / Touch ID or the device
 * passcode on iOS, Class 3 biometrics or the device PIN/pattern/password on
 * Android. Fails closed when the device has no enrolled credential at all.
 * The app PIN is deliberately not accepted here.
 */
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
