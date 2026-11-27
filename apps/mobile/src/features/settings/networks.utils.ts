export function toggleNetwork(enabled: readonly string[], id: string): string[] {
  if (!enabled.includes(id)) return [...enabled, id];
  if (enabled.length <= 1) return [...enabled];
  return enabled.filter((x) => x !== id);
}

export function countEnabled(enabled: readonly string[], known: readonly string[]): number {
  return known.filter((id) => enabled.includes(id)).length;
}
