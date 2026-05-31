// Approximates the design's `color-mix(in oklab, <color> N%, transparent)` tints,
// which behave like the color at N% opacity over the background.
export function alpha(color: string, amount: number): string {
  const a = Math.max(0, Math.min(1, amount));

  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  const match = color.match(/rgba?\(([^)]+)\)/);
  if (match) {
    const [r, g, b] = match[1].split(",").map((v) => v.trim());
    return `rgba(${r},${g},${b},${a})`;
  }

  return color;
}
