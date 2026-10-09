export const ACTIVITY_IMAGES: Record<string, string> = {
  "connect-4": "/images/connect-4.png",
  "reaction-test": "/images/reaction-test.svg",
  "click-frenzy": "/images/activities/click-frenzy.jpg",
  "would-you-rather": "/images/would-you-rather.svg",
  "shower-thoughts": "/images/activities/shower-thoughts.jpg",
  "impossible-quiz": "/images/activities/impossible-quiz.jpg",
  "personality-archetype": "/images/activities/personality-archetype.jpg",
  "general-knowledge-blitz": "/images/activities/general-knowledge-blitz.jpg",
  "typing-test": "/images/typing-sprint.png",
  "memory-game": "/images/fox-card.png",
  "dad-jokes": "/images/activities/dad-jokes.jpg",
  "guess-the-country": "/images/activities/guess-the-country.png",
  "soundboard": "/images/activities/soundboard.jpg",
  "nostalgia-quiz": "/images/activities/nostalgia-quiz.jpg",
  "number-guess": "/images/number-guess.png",
  "pixel-art": "/images/activities/pixel-art.png",
  "random-wheel": "/images/activities/random-wheel.jpg",
  "dots-and-boxes": "/images/connect-4.png",
  "nine-mens-morris": "/images/activities/connect-4.png",
  "whack-a-mole": "/images/activities/click-frenzy.jpg",
  "sudoku": "/images/number-guess.png",
  "daily-word-guess": "/images/typing-sprint.png",
  "hangman": "/images/activities/impossible-quiz.jpg",
  "general-knowledge-quiz": "/images/activities/general-knowledge-blitz.jpg",
  "flag-country-quiz": "/images/activities/guess-the-country.png",
  "science-quiz": "/images/activities/impossible-quiz.jpg",
  "true-or-false": "/images/activities/reaction-test.jpg",
};

export function getActivityImage(activity: { slug: string; thumbnail?: string | null }): string {
  if (activity.thumbnail && (activity.thumbnail.startsWith("/") || activity.thumbnail.startsWith("http"))) {
    return activity.thumbnail;
  }
  return ACTIVITY_IMAGES[activity.slug] || "/images/hero-mascot.jpg";
}
