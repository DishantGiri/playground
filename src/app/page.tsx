import { prisma } from "@/lib/prisma";
import { GamingDashboard } from "@/components/home/GamingDashboard";
import { AdSlot } from "@/components/ads/AdSlot";

export default async function HomePage() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [allActivities, topUsers, dailyChallenge] = await Promise.all([
    prisma.activity.findMany({
      where: { active: true },
      orderBy: { playCount: "desc" },
    }),
    prisma.user.findMany({
      take: 3,
      orderBy: { points: "desc" },
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        level: true,
        streak: true,
      },
    }),
    prisma.dailyChallenge.findFirst({
      where: { dateStr: todayStr },
    }),
  ]);

  return (
    <div className="w-full min-w-0 bg-[#F7F7F5] px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      <GamingDashboard
        activities={allActivities}
        topUsers={topUsers.map((u) => ({
          id: u.id,
          name: u.name || "Anonymous Gamer",
          image: u.image || undefined,
          points: u.points,
          level: u.level,
          streak: u.streak,
        }))}
        dailyChallenge={dailyChallenge}
      />

      {/* Sponsored Ad Slot */}
      <div className="w-full pt-2">
        <AdSlot placement="banner" />
      </div>
    </div>
  );
}
