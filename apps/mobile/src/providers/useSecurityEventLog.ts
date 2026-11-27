import { useCallback, useRef, useState } from "react";
import { initialSecurityEvents } from "@/features/security/data";
import { makeSecurityEvent } from "@/features/security/events";
import { storage } from "@/services/storage";
import type { SecurityEvent, SecurityEventType } from "@/types/status";

const MAX_EVENTS = 40;

export type LogSecurityEvent = (
  type: SecurityEventType,
  opts?: { detail?: string; detailVars?: Record<string, string | number> },
) => void;

/** The security activity log, newest first, capped and persisted on every entry. */
export function useSecurityEventLog(stored: SecurityEvent[]) {
  // Seed the log with demo history on first launch so the screen isn't empty.
  const [events, setEvents] = useState<SecurityEvent[]>(() =>
    initialSecurityEvents(stored, new Date()),
  );
  const counter = useRef(0);

  const logEvent = useCallback<LogSecurityEvent>((type, opts) => {
    counter.current += 1;
    const id = `e-${Date.now()}-${counter.current}`;
    const event = makeSecurityEvent(id, type, new Date(), opts);
    setEvents((prev) => {
      const next = [event, ...prev].slice(0, MAX_EVENTS);
      void storage.saveEvents(next).catch(() => undefined);
      return next;
    });
  }, []);

  /** Empties the log in memory only; a wallet reset has already cleared storage. */
  const clearEvents = useCallback(() => setEvents([]), []);

  return { events, logEvent, clearEvents };
}
