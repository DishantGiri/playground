import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const todayStr = new Date().toISOString().split("T")[0];

    // Find or auto-create today's challenge
    let challenge = await prisma.dailyChallenge.findFirst({
      where: { dateStr: todayStr },
    });

    if (!challenge) {
      challenge = await prisma.dailyChallenge.create({
        data: {
          title: "Boredom Destroyer",
          description: "Complete any 3 activities or quizzes today to maintain your momentum!",
          dateStr: todayStr,
          targetType: "ACTIVITIES_PLAYED",
          targetCount: 3,
          xpReward: 150,
        },
      });
    }

    let userProgress = 0;
    let completed = false;
    let userStreak = 0;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true, lastActiveDate: true },
      });
      userStreak = user?.streak || 0;

      const userChallenge = await prisma.userChallenge.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: challenge.id,
          },
        },
      });

      if (userChallenge) {
        userProgress = userChallenge.progress;
        completed = userChallenge.completed;
      }
    }

    // Generate 7-day streak visual tracker (Monday to Sunday)
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6

    const weekProgress = daysOfWeek.map((day, idx) => {
      const isPast = idx < todayIndex;
      const isToday = idx === todayIndex;
      const isDone = isPast && userStreak >= (todayIndex - idx) || (isToday && userProgress > 0);
      return {
        day,
        isToday,
        isDone,
      };
    });

    return NextResponse.json({
      challenge,
      userProgress,
      completed,
      userStreak,
      weekProgress,
      isGuest: !userId,
    });
  } catch (error: any) {
    console.error("Daily challenge fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily challenge" },
      { status: 500 }
    );
  }
}
