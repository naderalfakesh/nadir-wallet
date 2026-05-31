export function fmtUSD(n: number, opts: { sign?: boolean; cents?: boolean } = {}): string {
  const { sign = false, cents = true } = opts;
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-US", {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
  const prefix = n < 0 ? "−" : sign ? "+" : "";
  return `${prefix}$${s}`;
}

export function fmtToken(n: number, symbol?: string): string {
  const dp = n >= 1000 ? 2 : n >= 1 ? 4 : 6;
  const s = Number(n).toLocaleString("en-US", { maximumFractionDigits: dp });
  return symbol ? `${s} ${symbol}` : s;
}

export function fmtPct(n: number): string {
  const s = Math.abs(n).toFixed(2);
  return `${n < 0 ? "−" : "+"}${s}%`;
}

export function shortAddr(a: string, head = 6, tail = 4): string {
  if (!a) return "";
  if (a.length <= head + tail + 1) return a;
  return `${a.slice(0, head)}…${a.slice(-tail)}`;
}
