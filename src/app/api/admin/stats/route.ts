import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    // Allow admin role
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const totalUsers = await prisma.user.count();
    const totalActivities = await prisma.activity.count();
    const totalQuizzes = await prisma.quiz.count();
    const totalGamePlays = await prisma.gameResult.count();
    const totalQuizPlays = await prisma.quizResult.count();

    const topActivities = await prisma.activity.findMany({
      take: 5,
      orderBy: { playCount: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        playCount: true,
        rating: true,
      },
    });

    const recentUsers = await prisma.user.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        level: true,
        createdAt: true,
      },
    });

    // Simulated / aggregated analytics
    const totalPlays = totalGamePlays + totalQuizPlays;
    const estimatedAdImpressions = totalPlays * 3 + totalUsers * 5;
    const estimatedAdRevenue = (estimatedAdImpressions * 0.0035).toFixed(2); // $3.50 CPM

    return NextResponse.json({
      analytics: {
        totalUsers,
        totalActivities,
        totalQuizzes,
        totalPlays,
        averageSessionMinutes: 6.4,
        returningUsersRate: "68%",
        estimatedAdImpressions,
        estimatedAdRevenue: `$${estimatedAdRevenue}`,
      },
      topActivities,
      recentUsers,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
