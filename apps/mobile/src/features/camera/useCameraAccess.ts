import { useCallback, useEffect, useState } from "react";
import { useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { cameraStatus } from "./cameraStatus";

export function useCameraAccess(position: "front" | "back", nativeReady: boolean) {
  const { hasPermission, canRequestPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(position);
  const [failed, setFailed] = useState(false);
  const markFailed = useCallback(() => setFailed(true), []);
  const status = cameraStatus({
    nativeReady,
    failed,
    hasPermission,
    canRequestPermission,
    hasDevice: device != null,
  });

  const askPermission = useCallback(() => {
    requestPermission().catch(markFailed);
  }, [requestPermission, markFailed]);

  // Only a not-yet-asked permission prompts on its own; a denied one waits for the user.
  useEffect(() => {
    if (status === "request") askPermission();
  }, [status, askPermission]);

  return { device, status, askPermission, markFailed };
}
