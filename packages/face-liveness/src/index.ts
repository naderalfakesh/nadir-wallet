import { NitroModules } from "react-native-nitro-modules";
import type { FaceLiveness, FaceObservation } from "./specs/FaceLiveness.nitro";

export type { FaceLiveness, FaceObservation };

export function createFaceLiveness(): FaceLiveness {
  return NitroModules.createHybridObject<FaceLiveness>("FaceLiveness");
}
