import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardUserPointsAndCheckAchievements, POINTS_CONFIG } from "@/lib/gamification";

const GameResultSchema = z.object({
  activitySlug: z.string(),
  score: z.number().int().nonnegative().max(100000),
  wpm: z.number().optional(),
  accuracy: z.number().min(0).max(100).optional(),
  moves: z.number().int().positive().optional(),
  timeMs: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body = await req.json();
    const parsed = GameResultSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid game result payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { activitySlug, score, wpm, accuracy, moves, timeMs } = parsed.data;

    // Fetch activity
    const activity = await prisma.activity.findUnique({
      where: { slug: activitySlug },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // Increment activity play count
    await prisma.activity.update({
      where: { id: activity.id },
      data: { playCount: { increment: 1 } },
    });

    // Record game result
    await prisma.gameResult.create({
      data: {
        userId: userId || null,
        activityId: activity.id,
        score,
        wpm: wpm || null,
        accuracy: accuracy || null,
        moves: moves || null,
        timeMs: timeMs || null,
      },
    });

    const basePoints = activity.points || POINTS_CONFIG.COMPLETE_GAME;

    // Handle authenticated user gamification
    if (userId) {
      // Upsert UserActivity
      await prisma.userActivity.upsert({
        where: {
          userId_activityId: {
            userId,
            activityId: activity.id,
          },
        },
        create: {
          userId,
          activityId: activity.id,
          completed: true,
          playCount: 1,
          lastPlayedAt: new Date(),
        },
        update: {
          completed: true,
          playCount: { increment: 1 },
          lastPlayedAt: new Date(),
        },
      });

      const gamificationResult = await awardUserPointsAndCheckAchievements(
        userId,
        basePoints,
        {
          activityId: activity.id,
          reactionTimeMs: timeMs,
          memoryMoves: moves,
        }
      );

      return NextResponse.json({
        success: true,
        pointsEarned: basePoints,
        user: gamificationResult?.user,
        newUnlockedAchievements: gamificationResult?.newUnlockedAchievements || [],
        dailyChallengeCompleted: gamificationResult?.dailyChallengeCompleted || false,
        isGuest: false,
      });
    }

    // Guest response
    return NextResponse.json({
      success: true,
      pointsEarned: basePoints,
      isGuest: true,
      message: `You earned ${basePoints} XP! Sign up now to save your progress, unlock achievements, and hit the leaderboard.`,
    });
  } catch (error: any) {
    console.error("Game result submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
