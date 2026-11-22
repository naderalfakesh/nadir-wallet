/**
 * Flips one network on or off. The last enabled network can't be switched off,
 * so the list is returned unchanged in that case.
 */
export function toggleNetwork(enabled: readonly string[], id: string): string[] {
  if (!enabled.includes(id)) return [...enabled, id];
  if (enabled.length <= 1) return [...enabled];
  return enabled.filter((x) => x !== id);
}

/** How many of the known networks are enabled (stale ids in storage are ignored). */
export function countEnabled(enabled: readonly string[], known: readonly string[]): number {
  return known.filter((id) => enabled.includes(id)).length;
}
