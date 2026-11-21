// How the "first-run intro was seen" flag is encoded on disk. Stored on its own
// key (not in wallet prefs) so a wallet reset doesn't replay the intro.
export const INTRO_SEEN_VALUE = "1";

export function parseIntroSeen(raw: string | null | undefined): boolean {
  return raw === INTRO_SEEN_VALUE;
}
