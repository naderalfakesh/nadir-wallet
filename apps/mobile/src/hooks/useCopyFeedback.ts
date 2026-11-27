import { useCallback, useState } from "react";
import { copyText } from "@/services/device";
import { useTimeout } from "./useTimeout";

const DEFAULT_RESET_MS = 1500;

/**
 * Copies text to the clipboard and exposes transient `copied` feedback that
 * resets safely without leaking timers across unmounts or rapid taps.
 */
export function useCopyFeedback(resetMs = DEFAULT_RESET_MS) {
  const [copied, setCopied] = useState(false);
  const { schedule } = useTimeout();

  const copy = useCallback(
    (value: string) => {
      void copyText(value);
      setCopied(true);
      schedule(() => setCopied(false), resetMs);
    },
    [resetMs, schedule],
  );

  return { copied, copy };
}
