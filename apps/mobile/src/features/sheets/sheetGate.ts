/**
 * Sheets are opened only from wallet screens but render in a root-level modal,
 * outside the protected route groups. When the wallet group closes (lock,
 * auto-lock, reset), any open sheet must disappear at once and be dropped, so
 * it neither covers the lock screen nor comes back after the next unlock.
 */
export function gateSheet<T>(
  walletOpen: boolean,
  active: T | null,
): { shown: T | null; mustClose: boolean } {
  return { shown: walletOpen ? active : null, mustClose: !walletOpen && active !== null };
}
