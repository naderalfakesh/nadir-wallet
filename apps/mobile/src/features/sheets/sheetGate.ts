// Sheets render in a root modal outside Stack.Protected groups and must drop immediately on lock.
export function gateSheet<T>(
  walletOpen: boolean,
  active: T | null,
): { shown: T | null; mustClose: boolean } {
  return { shown: walletOpen ? active : null, mustClose: !walletOpen && active !== null };
}
