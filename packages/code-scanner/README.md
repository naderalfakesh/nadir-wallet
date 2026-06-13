# @nadir-wallet/code-scanner

A custom **react-native-vision-camera V5 frame-processor plugin**, built as a
[Nitro Module](https://nitro.margelo.com), wrapping **Google ML Kit Barcode
Scanning** in hand-written Swift and Kotlin. It powers Nadir Wallet's QR
address scanner.

It is the **second** native plugin in this repo (alongside
[`@nadir-wallet/face-liveness`](../face-liveness)) and deliberately reuses the
same scaffold — the point is to show the New-Architecture native-integration
pattern generalizes cleanly to a new ML Kit capability.

## What it does

```ts
import { createCodeScanner } from "@nadir-wallet/code-scanner";

const scanner = createCodeScanner(); // create once on the JS thread

const frameOutput = useFrameOutput({
  pixelFormat: "yuv",
  onFrame(frame) {
    "worklet"; // runs on the camera thread
    const codes = scanner.scan(frame); // string[] of QR raw values
    frame.dispose();
  },
});
```

`scan()` is a synchronous native call (Nitro HybridObject) that runs ML Kit
barcode detection restricted to QR codes and returns the raw string value of
every code in the frame. The app layer pulls the first EVM address out of those
strings (a raw `0x…` or an EIP-681 `ethereum:0x…` URI) and fills the send
recipient field.

## Architecture

```
src/specs/CodeScanner.nitro.ts      TypeScript spec (single source of truth)
        │  npx nitrogen
        ▼
nitrogen/generated/…                C++/Swift/Kotlin bridges (committed)
        │
ios/HybridCodeScanner.swift         CMSampleBuffer → MLKitVision → BarcodeScanner
android/…/HybridCodeScanner.kt      ImageProxy → InputImage → BarcodeScanning
```

QR codes are orientation-tolerant, so detection needs no coordinate transform —
the plugin just maps VisionCamera's orientation onto the ML Kit image and
returns raw values.

## Regenerating bindings

After changing `src/specs/*.nitro.ts`:

```sh
pnpm --filter @nadir-wallet/code-scanner specs   # runs nitrogen
```

Generated files are committed by design (Nitro convention) so the package
builds without consumers running codegen.

## Dependencies

| Layer          | iOS                                 | Android                                    |
| -------------- | ----------------------------------- | ------------------------------------------ |
| Camera frames  | VisionCamera 5 (`NativeFrame`)      | VisionCamera 5 (`ImageProxy`)              |
| Barcode engine | `GoogleMLKit/BarcodeScanning` 8.0.0 | `com.google.mlkit:barcode-scanning:17.3.0` |
| Bridge         | `react-native-nitro-modules` ≥ 0.35 | same                                       |

Everything runs on-device; the plugin performs no I/O and stores nothing.
