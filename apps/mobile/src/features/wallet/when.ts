import { calendarDaysBetween, formatShortMonthDay, formatTime12h } from "@/utils/date";

/** "Today" / "Yesterday" / "May 28", plus the same label with the time, relative to `now`. */
export function formatWhenDay(ts: number, now: Date): { day: string; when: string } {
  const d = new Date(ts);
  const days = calendarDaysBetween(d, now);
  const day = days === 0 ? "Today" : days === 1 ? "Yesterday" : formatShortMonthDay(d);
  return { day, when: `${day} · ${formatTime12h(d)}` };
}
