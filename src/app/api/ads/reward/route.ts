import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { awardUserPointsAndCheckAchievements, POINTS_CONFIG } from "@/lib/gamification";

// Simple in-memory cooldown cache per user (or token)
const lastClaimMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body
    }

    const { adVerificationToken } = body;
    if (!adVerificationToken || typeof adVerificationToken !== "string") {
      return NextResponse.json(
        { error: "Invalid ad verification token" },
        { status: 400 }
      );
    }

    const key = userId || adVerificationToken;
    const now = Date.now();
    const lastClaim = lastClaimMap.get(key) || 0;

    // Enforce minimum 15 seconds cooldown between rewarded ad claims
    if (now - lastClaim < 15000) {
      return NextResponse.json(
        { error: "Ad reward cooldown active. Please wait a moment." },
        { status: 429 }
      );
    }

    lastClaimMap.set(key, now);

    const bonusPoints = POINTS_CONFIG.REWARDED_AD; // Strictly 50 points, hardcoded on server

    if (userId) {
      const gamificationResult = await awardUserPointsAndCheckAchievements(
        userId,
        bonusPoints
      );

      return NextResponse.json({
        success: true,
        pointsEarned: bonusPoints,
        user: gamificationResult?.user,
        message: `+${bonusPoints} Bonus XP successfully added!`,
      });
    }

    return NextResponse.json({
      success: true,
      pointsEarned: bonusPoints,
      isGuest: true,
      message: `You earned +${bonusPoints} Bonus XP! Sign up to save and climb the leaderboard.`,
    });
  } catch (error: any) {
    console.error("Rewarded ad verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
