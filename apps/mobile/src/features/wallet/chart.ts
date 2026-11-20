import type { Range } from "./data";

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
  const data = Array.from({ length: 30 }, (_, index) => {
    const progress = index / 29;
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    const noise = (seed / 2 ** 32 - 0.5) * Math.sqrt(scale) * 2;
    return start + (100 - start) * progress + Math.sin(Math.PI * progress) * noise;
  });
  return { change, data };
}
