import { Platform } from "react-native";
import * as ScreenCapture from "expo-screen-capture";

const APP_SWITCHER_BLUR = 1;

// Serialize native calls so a quick unmount release cannot overtake the block it undoes.
let queue: Promise<void> = Promise.resolve();
const holders = new Set<string>();

function enqueue(task: () => Promise<void>): Promise<void> {
  queue = queue.then(task).catch((error: unknown) => {
    console.warn(`Screen capture protection failed: ${String(error)}`);
  });
  return queue;
}

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

export function screenCaptureIdle(): Promise<void> {
  return queue;
}
