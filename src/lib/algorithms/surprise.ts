import { prisma } from "@/lib/prisma";
import { calculateTrendingScore } from "./trending";

export interface SurpriseOptions {
  userId?: string;
  category?: string;
  maxDurationMinutes?: number;
  excludedSlugs?: string[];
}

export async function pickSurpriseActivity(options: SurpriseOptions = {}) {
  const { userId, category, maxDurationMinutes, excludedSlugs = [] } = options;

  // 1. Fetch active activities
  const whereClause: any = { active: true };
  if (category) {
    whereClause.category = category;
  }

  const activities = await prisma.activity.findMany({
    where: whereClause,
  });

  if (!activities || activities.length === 0) {
    return null;
  }

  // 2. Fetch completed activity IDs for the user if logged in
  let completedActivityIds = new Set<string>();
  if (userId) {
    const userCompleted = await prisma.userActivity.findMany({
      where: { userId, completed: true },
      select: { activityId: true },
    });
    completedActivityIds = new Set(userCompleted.map((u) => u.activityId));
  }

  const excludedSet = new Set(excludedSlugs);

  // 3. Score each activity
  const scoredActivities = activities.map((act) => {
    let weight = 100;

    // Favor trending / popular activities
    const trendingScore = calculateTrendingScore({
      playCount: act.playCount,
      rating: act.rating,
      createdAt: act.createdAt,
    });
    weight += Math.min(200, trendingScore * 0.1);

    // Heavily penalize recently excluded slugs (e.g. from session history)
    if (excludedSet.has(act.slug)) {
      weight *= 0.1;
    }

    // Penalize already completed activities so new ones are explored first
    if (completedActivityIds.has(act.id)) {
      weight *= 0.3;
    }

    // Filter or adjust for duration preference
    if (maxDurationMinutes) {
      const isQuick = act.estimatedTime.includes("sec") || act.estimatedTime.includes("1 min");
      if (isQuick) weight *= 1.5;
    }

    // Add mild random variance for serendipity
    const randomness = 0.8 + Math.random() * 0.4;
    const finalWeight = Math.max(1, weight * randomness);

    return {
      activity: act,
      weight: finalWeight,
    };
  });

  // 4. Weighted random selection
  const totalWeight = scoredActivities.reduce((acc, curr) => acc + curr.weight, 0);
  let randomPick = Math.random() * totalWeight;

  for (const item of scoredActivities) {
    randomPick -= item.weight;
    if (randomPick <= 0) {
      return item.activity;
    }
  }

  return scoredActivities[0]?.activity || activities[0];
}
