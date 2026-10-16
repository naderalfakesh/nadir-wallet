import { describe, expect, it } from "vitest";
import { t } from "@/i18n";
import { parseLivenessTarget } from "@/features/liveness/livenessGate";
import { cameraPanelCopy, cameraStatus, tryCreateNative, type CameraInputs } from "./cameraStatus";

const READY: CameraInputs = {
  nativeReady: true,
  failed: false,
  hasPermission: true,
  canRequestPermission: false,
  hasDevice: true,
};

describe("cameraStatus", () => {
  it("is ready only when everything is in place", () => {
    expect(cameraStatus(READY)).toBe("ready");
  });

  it("asks for permission while it is still undetermined", () => {
    expect(cameraStatus({ ...READY, hasPermission: false, canRequestPermission: true })).toBe("request");
  });

  it("sends a denied or restricted permission to Settings", () => {
    expect(cameraStatus({ ...READY, hasPermission: false, canRequestPermission: false })).toBe("settings");
  });

  it("reports a missing camera (e.g. simulator) after permission", () => {
    expect(cameraStatus({ ...READY, hasDevice: false })).toBe("noDevice");
  });

  it("is unavailable when the native module is missing, before touching permission", () => {
    expect(cameraStatus({ ...READY, nativeReady: false, hasPermission: false, canRequestPermission: true })).toBe(
      "unavailable",
    );
  });

  it("stays unavailable after a camera or frame-worklet error, whatever else holds", () => {
    expect(cameraStatus({ ...READY, failed: true })).toBe("unavailable");
    expect(cameraStatus({ ...READY, failed: true, hasDevice: false })).toBe("unavailable");
  });
});

describe("tryCreateNative", () => {
  it("returns the object when the hybrid object exists", () => {
    const obj = { detect: () => null };
    expect(tryCreateNative(() => obj)).toBe(obj);
  });

  it("returns null when Nitro can't find the hybrid object", () => {
    expect(
      tryCreateNative(() => {
        throw new Error("HybridObject \"FaceLiveness\" has not been registered");
      }),
    ).toBeNull();
  });
});

describe("cameraPanelCopy", () => {
  const statuses = ["request", "settings", "noDevice", "unavailable"] as const;

  it.each(["scan", "liveness"] as const)("every %s panel string exists", (feature) => {
    for (const status of statuses) {
      const copy = cameraPanelCopy(feature, status);
      for (const key of [copy.titleKey, copy.bodyKey, copy.actionKey].filter(Boolean) as string[]) {
        expect(t(key)).not.toBe(key);
      }
    }
  });

  it("offers an action only where the user can fix it", () => {
    expect(cameraPanelCopy("scan", "request").action).toBe("request");
    expect(cameraPanelCopy("scan", "settings").action).toBe("settings");
    expect(cameraPanelCopy("scan", "noDevice").action).toBeNull();
    expect(cameraPanelCopy("liveness", "unavailable").action).toBeNull();
  });

  it("liveness failures say nothing was approved", () => {
    for (const status of ["settings", "noDevice", "unavailable"] as const) {
      expect(t(cameraPanelCopy("liveness", status).bodyKey)).toMatch(/Nothing was approved/);
    }
  });
});

describe("parseLivenessTarget", () => {
  it("accepts only routes that enforce a pass on themselves", () => {
    expect(parseLivenessTarget("/reveal")).toBe("/reveal");
  });

  it.each(["/send", "/home", "https://example.com", "//reveal", "", undefined, ["/reveal"]])(
    "ignores %o from the URL",
    (next) => {
      expect(parseLivenessTarget(next)).toBeNull();
    },
  );
});
