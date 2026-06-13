import { NitroModules } from "react-native-nitro-modules";
import type { CodeScanner } from "./specs/CodeScanner.nitro";

export type { CodeScanner };

/**
 * Creates the native CodeScanner hybrid object. Create it once on the JS thread
 * and call `scan(frame)` from inside a frame-output worklet.
 */
export function createCodeScanner(): CodeScanner {
  return NitroModules.createHybridObject<CodeScanner>("CodeScanner");
}
