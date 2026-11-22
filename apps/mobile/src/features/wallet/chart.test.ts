import { describe, expect, it } from "vitest";
import {
  CHART_POINTS,
  RANGES,
  changeAtPoint,
  formatChartTime,
  getChartTimestamps,
  getDemoChart,
  valueAtPoint,
} from "./chart";

describe("getDemoChart", () => {
  it("is deterministic and has CHART_POINTS points ending at 100", () => {
    const a = getDemoChart("portfolio", "1W", 2.4);
    const b = getDemoChart("portfolio", "1W", 2.4);
    expect(a).toEqual(b);
    expect(a.data).toHaveLength(CHART_POINTS);
    expect(a.data.at(-1)).toBeCloseTo(100, 6);
  });

  it("starts where the change implies", () => {
    const { change, data } = getDemoChart("eth", "1M", -3);
    expect(data[0]).toBeCloseTo(100 / (1 + change / 100), 6);
  });
});

describe("getChartTimestamps", () => {
  const now = Date.UTC(2026, 10, 20, 12);
  it("spaces points evenly and ends now", () => {
    for (const range of RANGES) {
      const ts = getChartTimestamps(range, CHART_POINTS, now);
      expect(ts).toHaveLength(CHART_POINTS);
      expect(ts.at(-1)).toBe(now);
      const step = ts[1] - ts[0];
      expect(ts[CHART_POINTS - 1] - ts[CHART_POINTS - 2]).toBeCloseTo(step, 3);
    }
    const hour = getChartTimestamps("1H", 61, now);
    expect(now - hour[0]).toBe(3_600_000);
  });
});

describe("formatChartTime", () => {
  const now = new Date(2026, 10, 20, 15, 0);
  it("shows the time for 1H and day plus time for 1D", () => {
    expect(formatChartTime(new Date(2026, 10, 20, 14, 5).getTime(), "1H", now)).toBe("2:05 PM");
    expect(formatChartTime(new Date(2026, 10, 19, 9, 30).getTime(), "1D", now)).toBe(
      "Yesterday · 9:30 AM",
    );
  });

  it("shows dates for longer ranges, with the year for 1Y and All", () => {
    const ts = new Date(2026, 10, 14, 8).getTime();
    expect(formatChartTime(ts, "1W", now)).toBe("Nov 14");
    expect(formatChartTime(ts, "1M", now)).toBe("Nov 14");
    expect(formatChartTime(ts, "1Y", now)).toBe("Nov 14, 2026");
    expect(formatChartTime(ts, "All", now)).toBe("Nov 14, 2026");
  });
});

describe("scrub values", () => {
  const data = [80, 90, 100];
  it("scales the total by the point relative to the last", () => {
    expect(valueAtPoint(1000, data, 2)).toBe(1000);
    expect(valueAtPoint(1000, data, 0)).toBe(800);
  });
  it("measures change from the range start", () => {
    expect(changeAtPoint(data, 0)).toBe(0);
    expect(changeAtPoint(data, 2)).toBeCloseTo(25, 6);
  });
});
