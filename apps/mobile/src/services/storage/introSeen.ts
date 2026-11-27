export const INTRO_SEEN_VALUE = "1";

export function parseIntroSeen(raw: string | null | undefined): boolean {
  return raw === INTRO_SEEN_VALUE;
}
