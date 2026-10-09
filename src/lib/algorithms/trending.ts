export interface TrendingParams {
  playCount: number;
  rating: number;
  createdAt: Date;
  completionRate?: number; // 0 to 1
  recentPlays?: number;
}

export function calculateTrendingScore(params: TrendingParams): number {
  const { playCount, rating, createdAt, completionRate = 0.85, recentPlays } = params;

  // Estimate recent plays from playCount or explicit recent plays
  const estimatedRecentPlays = recentPlays !== undefined ? recentPlays : Math.min(1000, playCount * 0.15);

  // Normalized score components
  // 1. Recent plays weight: 0.5 (scaled down)
  const playsComponent = Math.min(100, estimatedRecentPlays * 0.1) * 0.5;

  // 2. Completion rate: 0.2 (0-100 scale)
  const completionComponent = (completionRate * 100) * 0.2;

  // 3. Ratings: 0.2 (scale rating 0-5 to 0-100)
  const ratingNormalized = (rating / 5) * 100;
  const ratingComponent = ratingNormalized * 0.2;

  // 4. Newness: 0.1 (decay over 30 days)
  const daysOld = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const newnessFactor = Math.max(0, 100 - daysOld * 3);
  const newnessComponent = newnessFactor * 0.1;

  const totalScore = playsComponent + completionComponent + ratingComponent + newnessComponent;
  return Math.round(totalScore * 10) / 10;
}
