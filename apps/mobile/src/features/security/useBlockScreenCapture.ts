import { useEffect, useId } from "react";
import { holdScreenCaptureBlock } from "@/services/device/screenCapture";

/**
 * Blocks screenshots, screen recording and the app-switcher preview while the
 * calling screen is mounted and `active` is true. Capture is allowed again on
 * unmount or when `active` turns false.
 */
export function useBlockScreenCapture(active: boolean = true): void {
  const key = `phrase-${useId()}`;
  useEffect(() => {
    if (!active) return undefined;
    return holdScreenCaptureBlock(key);
  }, [active, key]);
}
