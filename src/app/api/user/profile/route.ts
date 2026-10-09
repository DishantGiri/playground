import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          include: { achievement: true },
        },
        gameResults: {
          take: 8,
          orderBy: { createdAt: "desc" },
          include: { activity: true },
        },
        quizResults: {
          take: 8,
          orderBy: { createdAt: "desc" },
          include: { quiz: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Aggregate statistics
    const gamesPlayedCount = await prisma.gameResult.count({
      where: { userId },
    });

    const quizzesTakenCount = await prisma.quizResult.count({
      where: { userId },
    });

    const totalActivitiesCompleted = await prisma.userActivity.count({
      where: { userId, completed: true },
    });

    const allAchievements = await prisma.achievement.findMany();
    const unlockedIds = new Set(user.achievements.map((ua) => ua.achievementId));

    const achievementsWithStatus = allAchievements.map((ach) => ({
      ...ach,
      unlocked: unlockedIds.has(ach.id),
      unlockedAt: user.achievements.find((ua) => ua.achievementId === ach.id)?.unlockedAt || null,
    }));

    const levelDetails = calculateLevel(user.points);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        points: user.points,
        streak: user.streak,
        createdAt: user.createdAt,
      },
      levelDetails,
      stats: {
        gamesPlayed: gamesPlayedCount,
        quizzesTaken: quizzesTakenCount,
        totalCompleted: totalActivitiesCompleted,
      },
      achievements: achievementsWithStatus,
      recentGames: user.gameResults,
      recentQuizzes: user.quizResults,
    });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
