import type { Frame } from "react-native-vision-camera";
import type { HybridObject } from "react-native-nitro-modules";

export interface CodeScanner
  extends HybridObject<{ ios: "swift"; android: "kotlin" }> {
  /**
   * Runs ML Kit barcode/QR detection on the frame and returns the raw string
   * values of every code found (most commonly one QR). Synchronous — call from
   * a frame-output worklet only.
   */
  scan(frame: Frame): string[];
}
