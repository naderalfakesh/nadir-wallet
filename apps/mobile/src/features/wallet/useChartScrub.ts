import { useCallback, useMemo, useState } from "react";
import {
  changeAtPoint,
  formatChartTime,
  getChartTimestamps,
  getDemoChart,
  valueAtPoint,
  type Range,
} from "./chart";

interface ScrubSample {
  range: Range;
  index: number;
  now: number;
}

export interface ScrubbedPoint {
  value: number;
  price?: number;
  change: number;
  timeLabel: string;
}

interface UseChartScrubOptions {
  seriesId: string;
  range: Range;
  change24h: number;
  totalValue: number;
  unitPrice?: number;
  disabled?: boolean;
}

export function useChartScrub({
  seriesId,
  range,
  change24h,
  totalValue,
  unitPrice,
  disabled = false,
}: UseChartScrubOptions) {
  const chart = useMemo(
    () => getDemoChart(seriesId, range, change24h),
    [seriesId, range, change24h],
  );
  const [scrub, setScrub] = useState<ScrubSample | null>(null);

  const onScrub = useCallback(
    (index: number | null) => {
      setScrub(index === null ? null : { range, index, now: Date.now() });
    },
    [range],
  );

  const active = !disabled && scrub && scrub.range === range ? scrub : null;
  const scrubbed: ScrubbedPoint | null = useMemo(() => {
    if (!active) return null;
    const timestamps = getChartTimestamps(range, chart.data.length, active.now);
    return {
      value: valueAtPoint(totalValue, chart.data, active.index),
      price:
        unitPrice !== undefined ? valueAtPoint(unitPrice, chart.data, active.index) : undefined,
      change: changeAtPoint(chart.data, active.index),
      timeLabel: formatChartTime(timestamps[active.index], range, new Date(active.now)),
    };
  }, [active, chart.data, range, totalValue, unitPrice]);

  return { chart, scrubbed, onScrub };
}
