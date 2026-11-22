export const CHART_WIDTH = 320;
export const CHART_PAD = 4;

export type ChartPoint = readonly [number, number];

/** Curve points in chart units: x spans CHART_WIDTH, y spans `height`, both inset by CHART_PAD. */
export function chartPoints(data: number[], height: number): ChartPoint[] {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const last = Math.max(data.length - 1, 1);
  return data.map((v, i) => {
    const x = CHART_PAD + (i / last) * (CHART_WIDTH - CHART_PAD * 2);
    const y = CHART_PAD + (1 - (v - min) / range) * (height - CHART_PAD * 2);
    return [x, y] as const;
  });
}

/** Smooth line through the points, one cubic segment per pair. */
export function linePath(pts: ChartPoint[]): string {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

/** Index of the data point closest to a touch at `x` pixels inside a chart that is `width` pixels wide. */
export function nearestIndex(x: number, count: number, width: number): number {
  if (count <= 1 || width <= 0) return 0;
  const chartX = (x / width) * CHART_WIDTH;
  const progress = (chartX - CHART_PAD) / (CHART_WIDTH - CHART_PAD * 2);
  const index = Math.round(progress * (count - 1));
  return Math.min(count - 1, Math.max(0, index));
}

/** Pixel position of a point when the chart is drawn `width` pixels wide. */
export function pointToPixels(point: ChartPoint, width: number): { x: number; y: number } {
  return { x: (point[0] / CHART_WIDTH) * width, y: point[1] };
}
