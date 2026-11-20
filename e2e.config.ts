import { mobile } from "@e2e-dev/mobile";
import type { E2EConfig } from "e2e";

export default {
  workers: 1,
  targets: [
    {
      name: "android",
      engine: mobile({ platform: "android", device: process.env.NADIR_E2E_DEVICE ?? "Pixel 9" }),
      app: { bundleId: "com.nadiralfakesh.nadirwallet.qa" },
    },
  ],
} satisfies E2EConfig;
