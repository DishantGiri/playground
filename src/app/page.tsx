import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeGameExplorer } from "@/components/home/HomeGameExplorer";
import { AdSlot } from "@/components/ads/AdSlot";
import { Trophy, ArrowRight, Flame } from "lucide-react";

export default async function HomePage() {
  const allActivities = await prisma.activity.findMany({
    where: { active: true },
    orderBy: { playCount: "desc" },
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const dailyChallenge = await prisma.dailyChallenge.findFirst({
    where: { dateStr: todayStr },
  });

  return (
    <div className="w-full min-w-0 bg-[#F7F7F5] px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6 sm:space-y-8">
      
      {/* 1. Compact Hero Section */}
      <HomeHero />

      {/* 2. Interactive Search, Categories, & Responsive Game Grid */}
      <HomeGameExplorer activities={allActivities} />

      {/* 3. Daily Challenge Highlight (Soft Play Card) */}
      <section className="w-full rounded-2xl bg-white border border-[#E8E8E5] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Daily Challenge</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#202124]">
              {dailyChallenge?.title || "Daily Boredom Buster"}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              {dailyChallenge?.description || "Play 3 quick games today to keep your daily streak alive and earn reward XP."}
            </p>
            <div className="text-xs font-bold text-[#F97316] pt-0.5">
              Reward: +{dailyChallenge?.xpReward || 150} XP • Resets every 24 hours
            </div>
          </div>

          <Link
            href="/daily"
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#F97316] hover:bg-[#EA580C] active:scale-95 transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <span>Play Daily Challenge</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. Advertisement Slot */}
      <div className="w-full pt-2">
        <AdSlot placement="banner" />
      </div>

    </div>
  );
}
