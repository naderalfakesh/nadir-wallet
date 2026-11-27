import type { TranslationKey } from "@/i18n";

export type CameraStatus = "ready" | "request" | "settings" | "noDevice" | "unavailable";

export interface CameraInputs {
  nativeReady: boolean;
  failed: boolean;
  hasPermission: boolean;
  canRequestPermission: boolean;
  hasDevice: boolean;
}

export function cameraStatus(input: CameraInputs): CameraStatus {
  if (!input.nativeReady || input.failed) return "unavailable";
  if (!input.hasPermission) return input.canRequestPermission ? "request" : "settings";
  if (!input.hasDevice) return "noDevice";
  return "ready";
}

export type CameraPanelAction = "request" | "settings" | null;

export interface CameraPanelCopy {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  action: CameraPanelAction;
  actionKey: TranslationKey | null;
}

export function cameraPanelCopy(
  feature: "scan" | "liveness",
  status: Exclude<CameraStatus, "ready">,
): CameraPanelCopy {
  switch (status) {
    case "request":
      return {
        titleKey: "common.camera.permissionTitle",
        bodyKey: `${feature}.camera.permissionBody`,
        action: "request",
        actionKey: "common.camera.allow",
      };
    case "settings":
      return {
        titleKey: "common.camera.deniedTitle",
        bodyKey: `${feature}.camera.deniedBody`,
        action: "settings",
        actionKey: "common.camera.openSettings",
      };
    case "noDevice":
      return {
        titleKey: "common.camera.noDeviceTitle",
        bodyKey: `${feature}.camera.noDeviceBody`,
        action: null,
        actionKey: null,
      };
    case "unavailable":
      return {
        titleKey: "common.camera.unavailableTitle",
        bodyKey: `${feature}.camera.unavailableBody`,
        action: null,
        actionKey: null,
      };
  }
}

/** Nitro throws when a hybrid object isn't registered (Expo Go, web, a build without the plugin). */
export function tryCreateNative<T>(create: () => T): T | null {
  try {
    return create();
  } catch {
    return null;
  }
}
