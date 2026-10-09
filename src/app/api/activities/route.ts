import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateTrendingScore } from "@/lib/algorithms/trending";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const duration = searchParams.get("duration");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "trending";
    const limit = parseInt(searchParams.get("limit") || "24");
    const page = parseInt(searchParams.get("page") || "1");

    const where: any = { active: true };

    if (category && category !== "ALL") {
      if (category === "MULTIPLAYER") {
        where.slug = { in: ["number-guess", "reaction-test", "memory-game"] };
      } else {
        where.category = category;
      }
    }

    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty;
    }

    if (duration === "quick") {
      where.OR = [
        { estimatedTime: { contains: "sec" } },
        { estimatedTime: { contains: "1 min" } },
        { estimatedTime: { contains: "2 min" } },
      ];
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    let orderBy: any = undefined;

    if (sort === "most_played") {
      orderBy = { playCount: "desc" };
    } else if (sort === "highest_rated") {
      orderBy = { rating: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    let activities = await prisma.activity.findMany({
      where,
      orderBy,
      take: sort === "trending" ? 50 : limit,
      skip: sort === "trending" ? 0 : (page - 1) * limit,
    });

    // If sorting by trending, calculate trending score dynamically
    if (sort === "trending") {
      activities = activities
        .map((act) => ({
          ...act,
          trendingScore: calculateTrendingScore({
            playCount: act.playCount,
            rating: act.rating,
            createdAt: act.createdAt,
          }),
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice((page - 1) * limit, page * limit);
    }

    const totalCount = await prisma.activity.count({ where });

    return NextResponse.json({
      activities,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error: any) {
    console.error("Activities fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
