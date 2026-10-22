import { Platform } from "react-native";
import * as ScreenCapture from "expo-screen-capture";

/**
 * Screens that show the recovery phrase hold a capture block while mounted.
 * Android: FLAG_SECURE blocks screenshots, recordings and the recents thumbnail.
 * iOS: screenshots and recordings come out blank, and a full blur covers the
 * window whenever the app resigns active, so the app-switcher snapshot is blurred.
 *
 * Native calls run one after another so a release can never overtake the
 * block it undoes (a quick mount/unmount would otherwise leave capture blocked).
 */
const APP_SWITCHER_BLUR = 1;

let queue: Promise<void> = Promise.resolve();
const holders = new Set<string>();

function enqueue(task: () => Promise<void>): Promise<void> {
  queue = queue.then(task).catch((error: unknown) => {
    console.warn(`Screen capture protection failed: ${String(error)}`);
  });
  return queue;
}

/** Blocks capture under `key` and returns an idempotent release. */
export function holdScreenCaptureBlock(key: string): () => void {
  enqueue(async () => {
    holders.add(key);
    await ScreenCapture.preventScreenCaptureAsync(key);
  });
  if (Platform.OS === "ios") {
    enqueue(async () => {
      if (holders.size > 0) await ScreenCapture.enableAppSwitcherProtectionAsync(APP_SWITCHER_BLUR);
    });
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    enqueue(async () => {
      holders.delete(key);
      await ScreenCapture.allowScreenCaptureAsync(key);
    });
    if (Platform.OS === "ios") {
      enqueue(async () => {
        if (holders.size === 0) await ScreenCapture.disableAppSwitcherProtectionAsync();
      });
    }
  };
}

/** Resolves once every queued native call has settled. For tests. */
export function screenCaptureIdle(): Promise<void> {
  return queue;
}
