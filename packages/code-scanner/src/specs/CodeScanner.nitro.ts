import type { Frame } from "react-native-vision-camera";
import type { HybridObject } from "react-native-nitro-modules";

export interface CodeScanner extends HybridObject<{ ios: "swift"; android: "kotlin" }> {
  // Synchronous: call from a frame-output worklet only.
  scan(frame: Frame): string[];
}
