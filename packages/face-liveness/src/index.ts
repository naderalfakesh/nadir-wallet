import { NitroModules } from "react-native-nitro-modules";
import type { FaceLiveness } from "./specs/FaceLiveness.nitro";

export type { FaceLiveness };

/**
 * Creates the native FaceLiveness hybrid object. Create it once on the JS
 * thread and call its methods from inside a frame-output worklet.
 */
export function createFaceLiveness(): FaceLiveness {
  return NitroModules.createHybridObject<FaceLiveness>("FaceLiveness");
}
