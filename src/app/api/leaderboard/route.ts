import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "global"; // global, weekly, monthly

    // Fetch top users sorted by points
    const topUsers = await prisma.user.findMany({
      take: 20,
      orderBy: { points: "desc" },
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        level: true,
        streak: true,
        createdAt: true,
      },
    });

    // Format leaderboard entries
    const leaderboard = topUsers.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name || "Anonymous Gamer",
      image: u.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`,
      points: u.points,
      level: u.level,
      streak: u.streak,
      isCurrentUser: currentUserId === u.id,
    }));

    // Find current user rank if not in top 20
    let currentUserRank = null;
    if (currentUserId) {
      const userIndex = leaderboard.findIndex((l) => l.isCurrentUser);
      if (userIndex !== -1) {
        currentUserRank = leaderboard[userIndex];
      } else {
        const user = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: {
            id: true,
            name: true,
            image: true,
            points: true,
            level: true,
            streak: true,
          },
        });
        if (user) {
          const higherCount = await prisma.user.count({
            where: { points: { gt: user.points } },
          });
          currentUserRank = {
            rank: higherCount + 1,
            id: user.id,
            name: user.name || "You",
            image: user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
            points: user.points,
            level: user.level,
            streak: user.streak,
            isCurrentUser: true,
          };
        }
      }
    }

    return NextResponse.json({
      period,
      leaderboard,
      currentUserRank,
    });
  } catch (error: any) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
