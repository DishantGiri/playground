import { prisma } from "@/lib/prisma";

export const POINTS_CONFIG = {
  COMPLETE_GAME: 20,
  COMPLETE_QUIZ: 30,
  DAILY_CHALLENGE: 100,
  FIRST_ACTIVITY: 50,
  PERFECT_QUIZ: 100,
  NEW_ACTIVITY: 10,
  REWARDED_AD: 50,
};

export const XP_PER_LEVEL = 700;

export function calculateLevel(points: number): {
  level: number;
  currentLevelXp: number;
  xpUntilNextLevel: number;
  progressPercent: number;
} {
  const level = Math.floor(points / XP_PER_LEVEL) + 1;
  const currentLevelXp = points % XP_PER_LEVEL;
  const xpUntilNextLevel = XP_PER_LEVEL - currentLevelXp;
  const progressPercent = Math.min(
    100,
    Math.round((currentLevelXp / XP_PER_LEVEL) * 100)
  );

  return {
    level,
    currentLevelXp,
    xpUntilNextLevel,
    progressPercent,
  };
}

export function calculateNewStreak(lastActiveDate: string | null | undefined, currentStreak: number): {
  newStreak: number;
  isToday: boolean;
  todayStr: string;
} {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (!lastActiveDate) {
    return { newStreak: 1, isToday: false, todayStr };
  }

  if (lastActiveDate === todayStr) {
    return { newStreak: currentStreak, isToday: true, todayStr };
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (lastActiveDate === yesterdayStr) {
    return { newStreak: currentStreak + 1, isToday: false, todayStr };
  }

  // Broken streak, restart at 1
  return { newStreak: 1, isToday: false, todayStr };
}

export async function awardUserPointsAndCheckAchievements(
  userId: string,
  pointsToAdd: number,
  context?: {
    activityId?: string;
    isPerfectQuiz?: boolean;
    reactionTimeMs?: number;
    memoryMoves?: number;
    isSurpriseExplorer?: boolean;
  }
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      achievements: {
        include: { achievement: true },
      },
    },
  });

  if (!user) return null;

  const newTotalPoints = user.points + pointsToAdd;
  const { level: newLevel } = calculateLevel(newTotalPoints);
  const { newStreak, todayStr } = calculateNewStreak(user.lastActiveDate, user.streak);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      points: newTotalPoints,
      level: newLevel,
      streak: newStreak,
      lastActiveDate: todayStr,
    },
  });

  // Check achievements to unlock
  const alreadyUnlockedKeys = new Set(
    user.achievements.map((ua) => ua.achievement.key)
  );

  const newUnlockedAchievements = [];

  // 1. FIRST_GAME
  if (context?.activityId && !alreadyUnlockedKeys.has("FIRST_GAME")) {
    const ach = await prisma.achievement.findUnique({ where: { key: "FIRST_GAME" } });
    if (ach) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });
      newUnlockedAchievements.push(ach);
    }
  }

  // 2. PERFECT_SCORE
  if (context?.isPerfectQuiz && !alreadyUnlockedKeys.has("PERFECT_SCORE")) {
    const ach = await prisma.achievement.findUnique({ where: { key: "PERFECT_SCORE" } });
    if (ach) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });
      newUnlockedAchievements.push(ach);
    }
  }

  // 3. SPEED_DEMON
  if (
    context?.reactionTimeMs &&
    context.reactionTimeMs > 0 &&
    context.reactionTimeMs <= 220 &&
    !alreadyUnlockedKeys.has("SPEED_DEMON")
  ) {
    const ach = await prisma.achievement.findUnique({ where: { key: "SPEED_DEMON" } });
    if (ach) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });
      newUnlockedAchievements.push(ach);
    }
  }

  // 4. MEMORY_MASTER
  if (
    context?.memoryMoves &&
    context.memoryMoves <= 12 &&
    !alreadyUnlockedKeys.has("MEMORY_MASTER")
  ) {
    const ach = await prisma.achievement.findUnique({ where: { key: "MEMORY_MASTER" } });
    if (ach) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });
      newUnlockedAchievements.push(ach);
    }
  }

  // 5. STREAK_7_DAYS
  if (newStreak >= 7 && !alreadyUnlockedKeys.has("STREAK_7_DAYS")) {
    const ach = await prisma.achievement.findUnique({ where: { key: "STREAK_7_DAYS" } });
    if (ach) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });
      newUnlockedAchievements.push(ach);
    }
  }

  // Check Daily Challenge progress
  const todayChallenge = await prisma.dailyChallenge.findFirst({
    where: { dateStr: todayStr },
  });

  let dailyChallengeCompleted = false;
  if (todayChallenge) {
    const userChallenge = await prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId: todayChallenge.id,
        },
      },
    });

    if (!userChallenge) {
      await prisma.userChallenge.create({
        data: {
          userId,
          challengeId: todayChallenge.id,
          progress: 1,
          completed: todayChallenge.targetCount <= 1,
        },
      });
    } else if (!userChallenge.completed) {
      const nextProgress = userChallenge.progress + 1;
      const isDone = nextProgress >= todayChallenge.targetCount;
      dailyChallengeCompleted = isDone;

      await prisma.userChallenge.update({
        where: { id: userChallenge.id },
        data: {
          progress: nextProgress,
          completed: isDone,
          completedAt: isDone ? new Date() : null,
        },
      });

      if (isDone) {
        await prisma.user.update({
          where: { id: userId },
          data: { points: { increment: todayChallenge.xpReward } },
        });
      }
    }
  }

  return {
    user: updatedUser,
    newUnlockedAchievements,
    dailyChallengeCompleted,
  };
}
