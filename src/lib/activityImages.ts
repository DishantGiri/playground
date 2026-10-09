export const ACTIVITY_IMAGES: Record<string, string> = {
  "connect-4": "/images/activities/connect-4.png",
  "reaction-test": "/images/activities/reaction-test.jpg",
  "click-frenzy": "/images/activities/click-frenzy.jpg",
  "would-you-rather": "/images/activities/would-you-rather.jpg",
  "shower-thoughts": "/images/activities/shower-thoughts.jpg",
  "impossible-quiz": "/images/activities/impossible-quiz.jpg",
  "personality-archetype": "/images/activities/personality-archetype.jpg",
  "general-knowledge-blitz": "/images/activities/general-knowledge-blitz.jpg",
  "typing-test": "/images/activities/typing-test.jpg",
  "memory-game": "/images/activities/memory-game.jpg",
  "dad-jokes": "/images/activities/dad-jokes.jpg",
  "guess-the-country": "/images/activities/guess-the-country.png",
  "soundboard": "/images/activities/soundboard.jpg",
  "nostalgia-quiz": "/images/activities/nostalgia-quiz.jpg",
  "number-guess": "/images/activities/number-guess.jpg",
  "pixel-art": "/images/activities/pixel-art.png",
  "random-wheel": "/images/activities/random-wheel.jpg",
};

export function getActivityImage(activity: { slug: string; thumbnail?: string | null }): string {
  if (activity.thumbnail && (activity.thumbnail.startsWith("/") || activity.thumbnail.startsWith("http"))) {
    return activity.thumbnail;
  }
  return ACTIVITY_IMAGES[activity.slug] || "/images/hero-mascot.jpg";
}
