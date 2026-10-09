import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pickSurpriseActivity } from "@/lib/algorithms/surprise";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body is fine
    }

    const { category, maxDurationMinutes, excludedSlugs } = body;

    const activity = await pickSurpriseActivity({
      userId,
      category,
      maxDurationMinutes,
      excludedSlugs,
    });

    if (!activity) {
      return NextResponse.json(
        { error: "No activities available" },
        { status: 404 }
      );
    }

    // Determine target URL based on category/type
    let targetUrl = `/play/${activity.slug}`;
    if (activity.category === "QUIZ" || activity.type === "TRIVIA") {
      targetUrl = `/quiz/${activity.slug}`;
    }

    return NextResponse.json({
      activity,
      targetUrl,
    });
  } catch (error: any) {
    console.error("Surprise error:", error);
    return NextResponse.json(
      { error: "Failed to pick surprise activity" },
      { status: 500 }
    );
  }
}
