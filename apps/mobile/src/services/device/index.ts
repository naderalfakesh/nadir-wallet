import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";

export async function copyText(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

export async function shareText(message: string): Promise<void> {
  try {
    await Share.share({ message });
  } catch {
    // User dismissed the share sheet - nothing to do.
  }
}
