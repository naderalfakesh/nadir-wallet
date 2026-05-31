// Small deterministic hash so mock data stays stable per address without randomness.
export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function pseudoHex(seed: string, bytes: number): string {
  let result = "0x";
  let hash = hashString(seed);
  while (result.length < 2 + bytes * 2) {
    hash = (Math.imul(hash ^ (hash >>> 15), 2246822519) >>> 0) >>> 0;
    result += hash.toString(16).padStart(8, "0");
  }
  return result.slice(0, 2 + bytes * 2);
}
