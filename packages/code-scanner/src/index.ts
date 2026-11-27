import { NitroModules } from "react-native-nitro-modules";
import type { CodeScanner } from "./specs/CodeScanner.nitro";

export type { CodeScanner };

export function createCodeScanner(): CodeScanner {
  return NitroModules.createHybridObject<CodeScanner>("CodeScanner");
}
