import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { setDefaultVars, t } from "@/i18n";

export type BiometryKind =
  | "faceId"
  | "touchId"
  | "fingerprint"
  | "face"
  | "iris"
  | "multiple"
  | "generic";

/**
 * The name to show for the device's biometric unlock: Face ID or Touch ID on
 * iOS, the one sensor an Android device has, "fingerprint or face" when it has
 * several, and plain "biometrics" when the device reports none.
 */
export function biometryKindFor(os: string, types: readonly number[] | null): BiometryKind {
  const { FINGERPRINT, FACIAL_RECOGNITION, IRIS } = LocalAuthentication.AuthenticationType;
  if (os === "ios") {
    if (types?.includes(FACIAL_RECOGNITION)) return "faceId";
    if (types?.includes(FINGERPRINT)) return "touchId";
    return "generic";
  }
  if (types && types.length > 1) return "multiple";
  if (types?.length === 1) {
    if (types[0] === FINGERPRINT) return "fingerprint";
    if (types[0] === FACIAL_RECOGNITION) return "face";
    if (types[0] === IRIS) return "iris";
  }
  return "generic";
}

/** `{{biometry}}` for mid-sentence use, `{{Biometry}}` to start a sentence or label. */
export function biometryVars(kind: BiometryKind): { biometry: string; Biometry: string } {
  const name = t(`lock.biometry.${kind}`);
  return { biometry: name, Biometry: name.charAt(0).toUpperCase() + name.slice(1) };
}

let current: BiometryKind = "generic";

function apply(kind: BiometryKind): BiometryKind {
  current = kind;
  setDefaultVars(biometryVars(kind));
  return kind;
}

/** The icon for biometric unlock: the face glyph only for Face ID. */
export function biometryIcon(kind: BiometryKind = current): "faceid" | "fingerprint" {
  return kind === "faceId" || kind === "face" ? "faceid" : "fingerprint";
}

// Neutral until the device has been asked (boot waits for that).
apply(biometryKindFor(Platform.OS, null));

/** Asks the device which biometrics it has and updates every string that names them. Never rejects. */
export async function loadBiometryKind(): Promise<BiometryKind> {
  let types: LocalAuthentication.AuthenticationType[] | null = null;
  try {
    types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  } catch {
    // Keep the platform default.
  }
  return apply(biometryKindFor(Platform.OS, types));
}
