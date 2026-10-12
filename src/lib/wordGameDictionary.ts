import englishWords from "an-array-of-english-words";
import { generate } from "random-words";

// Extract 5-letter words set for validation
const FIVE_LETTER_WORDS_SET = new Set<string>(
  englishWords
    .filter((w: string) => w.length === 5)
    .map((w: string) => w.toUpperCase())
);

// Curated backup targets in case generation produces anything unexpected
const FALLBACK_TARGETS = [
  "REACT", "GAMES", "PIXEL", "SWORD", "CLOUD", "BRAIN", "LOGIC", "POWER",
  "SPEED", "FLASH", "CHESS", "BLOCK", "STARS", "NIGHT", "DREAM", "FLAME",
  "WATER", "EARTH", "MAGIC", "GHOST", "TIGER", "EAGLE", "ROBOT", "SPACE",
  "SHINE", "TRACK", "POINT", "SCORE", "QUEST", "LEVEL", "CANDY", "FRUIT",
  "BEACH", "MONEY", "HOUSE", "LIGHT", "MUSIC", "SOUND", "COLOR", "RIVER",
  "OCEAN", "CLOCK", "TRAIN", "PLANE", "STORM", "HAPPY", "SMILE", "PEACE",
];

FALLBACK_TARGETS.forEach((w) => FIVE_LETTER_WORDS_SET.add(w));

/**
 * Check whether a 5-letter word is a valid English guess
 */
export function isValidWord(word: string): boolean {
  if (!word || word.length !== 5) return false;
  return FIVE_LETTER_WORDS_SET.has(word.toUpperCase());
}

/**
 * Generate a deterministic daily 5-letter word based on date
 */
export function getDailyTargetWord(date = new Date()): string {
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  try {
    const res = generate({
      exactly: 1,
      minLength: 5,
      maxLength: 5,
      seed: `bored-wordle-${dateKey}`,
    });
    const candidate = Array.isArray(res) ? res[0] : res;
    if (candidate && candidate.length === 5) {
      const upper = candidate.toUpperCase();
      FIVE_LETTER_WORDS_SET.add(upper);
      return upper;
    }
  } catch (err) {
    console.error("Failed to generate daily word from random-words library:", err);
  }

  // Deterministic fallback
  const daySeed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return FALLBACK_TARGETS[daySeed % FALLBACK_TARGETS.length];
}

/**
 * Generate a random 5-letter target word for unlimited / practice mode
 */
export function getRandomTargetWord(): string {
  try {
    const res = generate({
      exactly: 1,
      minLength: 5,
      maxLength: 5,
    });
    const candidate = Array.isArray(res) ? res[0] : res;
    if (candidate && candidate.length === 5) {
      const upper = candidate.toUpperCase();
      FIVE_LETTER_WORDS_SET.add(upper);
      return upper;
    }
  } catch (err) {
    console.error("Failed to generate random word from random-words library:", err);
  }

  return FALLBACK_TARGETS[Math.floor(Math.random() * FALLBACK_TARGETS.length)];
}
