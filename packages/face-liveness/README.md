# @nadir-wallet/face-liveness

A custom **react-native-vision-camera V5 frame-processor plugin**, built as a
[Nitro Module](https://nitro.margelo.com), wrapping **Google ML Kit Face
Detection** in hand-written Swift and Kotlin. It powers Nadir Wallet's active
face-liveness check and exists to demonstrate native-module authorship under
the React Native New Architecture — it is not an installed wrapper.

## What it does

```ts
import { createFaceLiveness } from "@nadir-wallet/face-liveness";

const liveness = createFaceLiveness(); // create once on the JS thread

const frameOutput = useFrameOutput({
  pixelFormat: "yuv",
  onFrame(frame) {
    "worklet"; // runs on the camera thread — zero JS-thread work per frame
    const obs = liveness.detect(frame);
    // obs: { hasFace, yaw, pitch, roll, leftEyeOpen, rightEyeOpen,
    //        x, y, width, height, timestampMs }
    frame.dispose();
  },
});
```

`detect()` is a synchronous native call (Nitro HybridObject — no bridge, no
serialization). It runs ML Kit in fast mode with eye-open classification and
returns the most prominent face with:

- **Head Euler angles** (yaw/pitch/roll, degrees) — drive turn challenges
- **Eye-open probabilities** (0..1) — drive the blink challenge
- **Normalized bounding box** (0..1) in upright, selfie-mirrored display
  space, so the JS overlay can check "face inside the oval" without knowing
  anything about sensor rotation

## Architecture

```
src/specs/FaceLiveness.nitro.ts     TypeScript spec (single source of truth)
        │  npx nitrogen
        ▼
nitrogen/generated/…                C++/Swift/Kotlin bridges (committed)
        │
ios/HybridFaceLiveness.swift        CMSampleBuffer → MLKitVision, orientation
                                    mapping + buffer→upright coord transform
android/…/HybridFaceLiveness.kt     ImageProxy → InputImage(rotationDegrees),
                                    upright-space normalization + mirroring
```

Platform notes:

- **iOS** frames arrive rotated and mirrored; the Swift side maps VisionCamera's
  `CameraOrientation` + `isMirrored` to a `UIImage.Orientation` and transforms
  ML Kit's buffer-space rect into the normalized display space.
- **Android** ML Kit already works in upright space given `rotationDegrees`;
  the Kotlin side swaps dimensions for 90°/270° and mirrors X to match the
  selfie preview.
- The yaw **sign convention differs per platform** (mirrored vs unmirrored
  buffers); the consuming app owns that mapping (`features/liveness/config.ts`).

## Regenerating bindings

After changing `src/specs/*.nitro.ts`:

```sh
pnpm --filter @nadir-wallet/face-liveness specs   # runs nitrogen
```

Generated files are committed by design (Nitro convention) so the package
builds without consumers running codegen.

## Dependencies

| Layer | iOS | Android |
| --- | --- | --- |
| Camera frames | VisionCamera 5 (`NativeFrame`) | VisionCamera 5 (`ImageProxy`) |
| Face engine | `GoogleMLKit/FaceDetection` 8.0.0 | `com.google.mlkit:face-detection:16.1.7` |
| Bridge | `react-native-nitro-modules` ≥ 0.35 | same |

Everything runs on-device; the plugin performs no I/O and stores nothing.
