export const TIME_MS = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
} as const;

export const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Local midnight timestamp for calendar-day comparisons. */
export function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole calendar days elapsed from `earlier` to `later` in local time. */
export function calendarDaysBetween(earlier: Date, later: Date): number {
  return Math.round((startOfLocalDay(later) - startOfLocalDay(earlier)) / TIME_MS.day);
}

/** "2:14 PM" in 12-hour local time. */
export function formatTime12h(date: Date): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${minutes} ${meridiem}`;
}

/** "May 28" */
export function formatShortMonthDay(date: Date): string {
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** "Nov 22, 2026" */
export function formatShortDate(date: Date): string {
  return `${formatShortMonthDay(date)}, ${date.getFullYear()}`;
}
