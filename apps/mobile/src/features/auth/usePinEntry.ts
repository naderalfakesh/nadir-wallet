import { useCallback, useEffect, useRef, useState } from "react";
import { haptics } from "@/services/device/haptics";

const PIN_LENGTH = 6;
const SUBMIT_DELAY_MS = 120;
const ERROR_FLASH_MS = 600;

export interface PinEntryHelpers {
  clear: () => void;
  fail: (after?: () => void) => void;
}

interface UsePinEntryOptions {
  length?: number;
  onComplete: (pin: string, helpers: PinEntryHelpers) => void;
}

export function usePinEntry({ length = PIN_LENGTH, onComplete }: UsePinEntryOptions) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const schedule = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const clear = useCallback(() => {
    setPin("");
    setError(false);
  }, []);

  const fail = useCallback(
    (after?: () => void) => {
      haptics.error();
      setError(true);
      setShake(true);
      schedule(() => {
        setShake(false);
        setPin("");
        after?.();
      }, ERROR_FLASH_MS);
    },
    [schedule],
  );

  const press = useCallback(
    (key: string) => {
      setError(false);
      if (key === "del") {
        setPin((p) => p.slice(0, -1));
        return;
      }
      setPin((p) => {
        if (p.length >= length) return p;
        const next = p + key;
        if (next.length === length) {
          schedule(() => onComplete(next, { clear, fail }), SUBMIT_DELAY_MS);
        }
        return next;
      });
    },
    [length, onComplete, schedule, clear, fail],
  );

  return { pin, error, shake, press, clear, fail };
}
