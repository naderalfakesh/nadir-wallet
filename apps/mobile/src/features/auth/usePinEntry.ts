import { useCallback, useEffect, useRef, useState } from "react";

const PIN_LENGTH = 6;
// Brief beat after the last digit so the final dot fills before we react.
const SUBMIT_DELAY_MS = 120;
// How long the dots stay red on a wrong entry before clearing.
const ERROR_FLASH_MS = 600;

export interface PinEntryHelpers {
  /** Clear the entered digits (and any error) immediately — e.g. when advancing a stage. */
  clear: () => void;
  /** Flash the dots red, then clear; `after` runs once the flash ends. */
  fail: (after?: () => void) => void;
}

interface UsePinEntryOptions {
  length?: number;
  onComplete: (pin: string, helpers: PinEntryHelpers) => void;
}

/**
 * The keypad entry state machine shared by every passcode screen (create,
 * unlock, change). Owns the digit buffer plus the error/shake flash; callers
 * decide what a completed code means via `onComplete`, using the supplied
 * helpers to advance, finish, or reject.
 */
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
