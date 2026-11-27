import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { haptics } from "@/services/device/haptics";

export async function copyText(text: string): Promise<void> {
  if (await Clipboard.setStringAsync(text)) haptics.success();
}

export async function readClipboardText(): Promise<string> {
  try {
    return (await Clipboard.getStringAsync()).trim();
  } catch {
    return "";
  }
}

export async function shareText(message: string): Promise<void> {
  try {
    await Share.share({ message });
  } catch {}
}
