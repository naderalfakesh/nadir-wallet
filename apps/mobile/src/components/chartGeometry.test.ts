import { describe, expect, it } from "vitest";
import {
  CHART_PAD,
  CHART_WIDTH,
  chartPoints,
  linePath,
  nearestIndex,
  pointToPixels,
} from "./chartGeometry";

describe("chartPoints", () => {
  it("spans the padded width and maps the highest value to the top", () => {
    const pts = chartPoints([1, 3, 2], 100);
    expect(pts[0][0]).toBe(CHART_PAD);
    expect(pts[2][0]).toBe(CHART_WIDTH - CHART_PAD);
    expect(pts[1][1]).toBe(CHART_PAD);
    expect(pts[0][1]).toBe(100 - CHART_PAD);
  });

  it("handles a flat series", () => {
    const pts = chartPoints([5, 5, 5], 80);
    expect(new Set(pts.map((p) => p[1])).size).toBe(1);
  });
});

describe("linePath", () => {
  it("starts at the first point and has one curve per segment", () => {
    const d = linePath(chartPoints([1, 2, 3, 4], 90));
    expect(d.startsWith("M 4 ")).toBe(true);
    expect(d.match(/C/g)).toHaveLength(3);
  });
});

describe("nearestIndex", () => {
  it("maps the edges and clamps outside touches", () => {
    expect(nearestIndex(0, 60, 400)).toBe(0);
    expect(nearestIndex(-30, 60, 400)).toBe(0);
    expect(nearestIndex(400, 60, 400)).toBe(59);
    expect(nearestIndex(900, 60, 400)).toBe(59);
  });

  it("picks the middle point in the middle", () => {
    expect(nearestIndex(200, 61, 400)).toBe(30);
  });

  it("returns the point whose pixel position is closest", () => {
    const width = 350;
    const pts = chartPoints(
      Array.from({ length: 10 }, (_, i) => i),
      50,
    );
    for (let i = 0; i < 10; i++) {
      expect(nearestIndex(pointToPixels(pts[i], width).x, 10, width)).toBe(i);
    }
  });

  it("is safe with a single point or no width", () => {
    expect(nearestIndex(50, 1, 100)).toBe(0);
    expect(nearestIndex(50, 10, 0)).toBe(0);
  });
});

describe("pointToPixels", () => {
  it("scales x to the rendered width and keeps y", () => {
    expect(pointToPixels([160, 40], 640)).toEqual({ x: 320, y: 40 });
  });
});
