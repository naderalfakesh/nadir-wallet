import React from "react";
import Svg, { Rect } from "react-native-svg";

const N = 25;

// Pure module generation kept out of the component body so the seed mutation
// never happens during render.
function buildModules(): [number, number][] {
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);

  const modules: [number, number][] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (isFinder(r, c)) continue;
      if (rnd() > 0.52) modules.push([r, c]);
    }
  }
  return modules;
}

const MODULES = buildModules();

// Deterministic faux QR — a visual placeholder, not a scannable code.
export function QRCode({ size = 188, fg = "#0c0e12", bg = "#fff" }: { size?: number; fg?: string; bg?: string }) {
  const cell = size / N;

  const finder = (x: number, y: number, i: number) => (
    <React.Fragment key={`f-${i}`}>
      <Rect x={x * cell} y={y * cell} width={cell * 7} height={cell * 7} rx={cell} fill={fg} />
      <Rect x={(x + 1) * cell} y={(y + 1) * cell} width={cell * 5} height={cell * 5} rx={cell * 0.7} fill={bg} />
      <Rect x={(x + 2) * cell} y={(y + 2) * cell} width={cell * 3} height={cell * 3} rx={cell * 0.5} fill={fg} />
    </React.Fragment>
  );

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect width={size} height={size} fill={bg} />
      {MODULES.map(([r, c], i) => (
        <Rect key={i} x={c * cell + 0.5} y={r * cell + 0.5} width={cell - 1} height={cell - 1} rx={cell * 0.28} fill={fg} />
      ))}
      {finder(0, 0, 0)}
      {finder(N - 7, 0, 1)}
      {finder(0, N - 7, 2)}
    </Svg>
  );
}
