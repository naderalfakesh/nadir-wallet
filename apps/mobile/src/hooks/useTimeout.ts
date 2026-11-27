import { useCallback, useEffect, useRef } from "react";

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
