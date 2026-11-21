import { useEffect, useState } from "react";
import { AppState } from "react-native";
import {
  generateMnemonic,
  suggestBip39Words,
  validateMnemonicPhrase,
} from "@nadir-wallet/crypto-core";
import { createStaleGuard } from "@/features/auth/staleGuard";
import { readClipboardText } from "@/services/device";

export function useMnemonicInput() {
  const [value, setValue] = useState("");
  const [clipboardEmpty, setClipboardEmpty] = useState(false);
  const [pasteGuard] = useState(createStaleGuard);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        pasteGuard.invalidate();
        setValue("");
        setClipboardEmpty(false);
      }
    });
    return () => {
      subscription.remove();
      pasteGuard.invalidate();
    };
  }, [pasteGuard]);

  const editValue = (text: string) => {
    pasteGuard.invalidate();
    setClipboardEmpty(false);
    setValue(text);
  };
  const paste = async () => {
    pasteGuard.invalidate();
    const { current, value: text } = await pasteGuard.run(readClipboardText);
    if (!current) return;
    if (text) editValue(text);
    else setClipboardEmpty(true);
  };

  const result = validateMnemonicPhrase(value);
  const prefix = value.match(/(?:^|\s)([a-z]+)$/i)?.[1] ?? "";
  const suggestions = result.valid ? [] : suggestBip39Words(prefix);
  const normalized = value.trim().toLowerCase().split(/\s+/).filter(Boolean).join(" ");

  const applySuggestion = (word: string) => {
    editValue(value.slice(0, -prefix.length) + word + " ");
  };
  const fillSample = () => {
    editValue(generateMnemonic());
  };

  return {
    value,
    clipboardEmpty,
    editValue,
    paste,
    result,
    prefix,
    suggestions,
    normalized,
    applySuggestion,
    fillSample,
  };
}
