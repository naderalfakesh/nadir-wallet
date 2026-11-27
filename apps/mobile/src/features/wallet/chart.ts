import { formatShortDate, formatShortMonthDay, formatTime12h, TIME_MS } from "@/utils/date";
import { formatWhenDay } from "./when";

export const RANGES = ["1H", "1D", "1W", "1M", "1Y", "All"] as const;
export type Range = (typeof RANGES)[number];

export const CHART_POINTS = 30;

const RANGE_SCALE: Record<Range, number> = {
  "1H": 0.18,
  "1D": 1,
  "1W": 1.8,
  "1M": 3.1,
  "1Y": 6.4,
  All: 9.2,
};

/** Deterministic sample history ending at the displayed value. */
export function getDemoChart(id: string, range: Range, change24h: number) {
  let seed = 0;
  for (const char of id + range) {
    seed = (Math.imul(31, seed) + char.charCodeAt(0)) | 0;
  }
  const scale = RANGE_SCALE[range];
  const change = Math.max(-99, change24h * scale);
  const start = 100 / (1 + change / 100);
  const data = Array.from({ length: CHART_POINTS }, (_, index) => {
    const progress = index / (CHART_POINTS - 1);
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    const noise = (seed / 2 ** 32 - 0.5) * Math.sqrt(scale) * 2;
    return start + (100 - start) * progress + Math.sin(Math.PI * progress) * noise;
  });
  return { change, data };
}

const RANGE_SPAN_MS: Record<Range, number> = {
  "1H": TIME_MS.hour,
  "1D": TIME_MS.day,
  "1W": 7 * TIME_MS.day,
  "1M": 30 * TIME_MS.day,
  "1Y": 365 * TIME_MS.day,
  All: 730 * TIME_MS.day,
};

/** Evenly spaced timestamps (epoch ms) for chart points, the last one being `now`. */
export function getChartTimestamps(range: Range, count: number, now: number): number[] {
  const span = RANGE_SPAN_MS[range];
  const last = Math.max(count - 1, 1);
  return Array.from({ length: count }, (_, index) => now - span + (span * index) / last);
}

/** Time of day for 1H, day and time for 1D, calendar date for longer ranges. */
export function formatChartTime(ts: number, range: Range, now: Date): string {
  const d = new Date(ts);
  if (range === "1H") return formatTime12h(d);
  if (range === "1D") return formatWhenDay(ts, now).when;
  return range === "1Y" || range === "All" ? formatShortDate(d) : formatShortMonthDay(d);
}

/** Value at a scrubbed point, given the series ends at the displayed `total`. */
export function valueAtPoint(total: number, data: number[], index: number): number {
  return total * (data[index] / data[data.length - 1]);
}

/** Percent change from the start of the series to a scrubbed point. */
export function changeAtPoint(data: number[], index: number): number {
  return (data[index] / data[0] - 1) * 100;
}
