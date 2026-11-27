import { describe, expect, it } from "vitest";
import { buildSeedQuizRounds, QUIZ_POSITIONS } from "./seedQuiz";

const SAMPLE_WORDS = [
  "abandon",
  "ability",
  "able",
  "about",
  "above",
  "absent",
  "absorb",
  "abstract",
  "absurd",
  "abuse",
  "access",
  "accident",
];

describe("buildSeedQuizRounds", () => {
  it("creates one round per quiz position with three distinct options containing the answer", () => {
    const rounds = buildSeedQuizRounds(SAMPLE_WORDS);
    expect(rounds).toHaveLength(QUIZ_POSITIONS.length);
    for (const round of rounds) {
      expect(round.correct).toBe(SAMPLE_WORDS[round.pos]);
      expect(round.options).toHaveLength(3);
      expect(new Set(round.options).size).toBe(3);
      expect(round.options).toContain(round.correct);
    }
  });

  it("deduplicates distractors when a valid BIP39 phrase repeats words", () => {
    const repeated = [...SAMPLE_WORDS];
    repeated[6] = repeated[2]; // pos 2 + offset 4 = index 6 collides with correct
    repeated[9] = repeated[2]; // pos 2 + offset 7 = index 9 also collides with correct
    const rounds = buildSeedQuizRounds(repeated);

    for (const round of rounds) {
      expect(new Set(round.options).size).toBe(round.options.length);
      expect(round.options).toHaveLength(3);
      expect(round.options).toContain(round.correct);
    }
  });

  it("handles an empty word list gracefully", () => {
    expect(buildSeedQuizRounds([])).toEqual([]);
  });
});
