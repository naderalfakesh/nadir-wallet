import { useEffect, useId } from "react";
import { holdScreenCaptureBlock } from "@/services/device/screenCapture";

export function useBlockScreenCapture(active: boolean = true): void {
  const key = `phrase-${useId()}`;
  useEffect(() => {
    if (!active) return undefined;
    return holdScreenCaptureBlock(key);
  }, [active, key]);
}
