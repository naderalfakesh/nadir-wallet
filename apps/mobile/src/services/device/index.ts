import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";

export async function copyText(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

export async function shareText(message: string): Promise<void> {
  try {
    await Share.share({ message });
  } catch {
    // User dismissed the share sheet — nothing to do.
  }
}

// Builds a testnet explorer URL and opens it in an in-app browser.
export async function openExplorer(host: string, path: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(`https://${host}/${path}`);
  } catch {
    // Ignore browser-open failures (e.g. no handler available).
  }
}
