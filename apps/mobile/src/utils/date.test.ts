import { describe, expect, it } from "vitest";
import {
  calendarDaysBetween,
  formatShortDate,
  formatShortMonthDay,
  formatTime12h,
  TIME_MS,
} from "./date";

describe("date utilities", () => {
  it("formats 12-hour times including midnight and noon", () => {
    expect(formatTime12h(new Date(2026, 4, 28, 0, 5))).toBe("12:05 AM");
    expect(formatTime12h(new Date(2026, 4, 28, 12, 0))).toBe("12:00 PM");
    expect(formatTime12h(new Date(2026, 4, 28, 14, 14))).toBe("2:14 PM");
  });

  it("formats short month-day and full dates", () => {
    const date = new Date(2026, 10, 22, 9, 30);
    expect(formatShortMonthDay(date)).toBe("Nov 22");
    expect(formatShortDate(date)).toBe("Nov 22, 2026");
  });

  it("computes local calendar day differences across midnight", () => {
    const today = new Date(2026, 4, 28, 0, 10);
    const yesterdayLate = new Date(2026, 4, 27, 23, 50);
    const earlierToday = new Date(2026, 4, 28, 0, 1);

    expect(calendarDaysBetween(earlierToday, today)).toBe(0);
    expect(calendarDaysBetween(yesterdayLate, today)).toBe(1);
  });

  it("exposes consistent millisecond constants", () => {
    expect(TIME_MS.hour).toBe(60 * TIME_MS.minute);
    expect(TIME_MS.day).toBe(24 * TIME_MS.hour);
  });
});
