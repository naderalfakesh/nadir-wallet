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

export function biometryIcon(kind: BiometryKind = current): "faceid" | "fingerprint" {
  return kind === "faceId" || kind === "face" ? "faceid" : "fingerprint";
}

apply(biometryKindFor(Platform.OS, null));

export async function loadBiometryKind(): Promise<BiometryKind> {
  let types: LocalAuthentication.AuthenticationType[] | null = null;
  try {
    types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  } catch {}
  return apply(biometryKindFor(Platform.OS, types));
}
