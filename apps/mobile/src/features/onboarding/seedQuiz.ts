export const QUIZ_POSITIONS = [2, 6, 9] as const;

export interface SeedQuizRound {
  pos: number;
  correct: string;
  options: string[];
}

const PREFERRED_OFFSETS = [4, 7, 1, 2, 3, 5, 6, 8, 9, 10, 11];

// Deduplicates distractors because valid BIP39 phrases may contain repeated words.
export function buildSeedQuizRounds(words: readonly string[]): SeedQuizRound[] {
  if (words.length === 0) return [];
  return QUIZ_POSITIONS.filter((pos) => pos < words.length).map((pos) => {
    const correct = words[pos];
    const picked = [correct];
    for (const offset of PREFERRED_OFFSETS) {
      if (picked.length === 3) break;
      const candidate = words[(pos + offset) % words.length];
      if (!picked.includes(candidate)) picked.push(candidate);
    }
    const rot = pos % picked.length;
    return { pos, correct, options: [...picked.slice(rot), ...picked.slice(0, rot)] };
  });
}
