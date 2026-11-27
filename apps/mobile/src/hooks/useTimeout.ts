import { useCallback, useEffect, useRef } from "react";

/**
 * Schedules a single cancellable timeout that automatically cleans up on unmount
 * and cancels any previous pending timer when rescheduled.
 */
export function useTimeout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        fn();
      }, ms);
    },
    [cancel],
  );

  useEffect(() => cancel, [cancel]);

  return { schedule, cancel };
}
