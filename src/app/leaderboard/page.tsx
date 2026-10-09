"use client";

import { useState, useEffect } from "react";
import { Trophy, Flame, Crown, Medal, Award, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<"global" | "weekly" | "monthly">("global");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leaderboard?period=${period}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316] shadow-2xs">
          <Crown className="w-4 h-4 fill-[#F97316] text-[#F97316]" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] flex items-center justify-center text-[#6B7280] shadow-2xs">
          <Medal className="w-4 h-4 text-[#6B7280]" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center text-[#D97706] shadow-2xs">
          <Award className="w-4 h-4 text-[#D97706]" />
        </div>
      );
    }
    return (
      <span className="text-xs font-black text-[#6B7280] font-mono">
        #{rank}
      </span>
    );
  };

  return (
    <div className="w-full min-w-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Hall of Fame</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
          Global Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          Compete against players worldwide by playing mini-games, acing quizzes, and maintaining daily streaks.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#E8E8E5] max-w-sm">
        <button
          onClick={() => setPeriod("global")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            period === "global"
              ? "bg-[#6366F1] text-white border-[#6366F1] shadow-xs"
              : "bg-white text-[#6B7280] border-transparent hover:text-[#202124] hover:bg-[#F0F0ED]"
          }`}
        >
          All-Time
        </button>
        <button
          onClick={() => setPeriod("weekly")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            period === "weekly"
              ? "bg-[#6366F1] text-white border-[#6366F1] shadow-xs"
              : "bg-white text-[#6B7280] border-transparent hover:text-[#202124] hover:bg-[#F0F0ED]"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setPeriod("monthly")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            period === "monthly"
              ? "bg-[#6366F1] text-white border-[#6366F1] shadow-xs"
              : "bg-white text-[#6B7280] border-transparent hover:text-[#202124] hover:bg-[#F0F0ED]"
          }`}
        >
          This Month
        </button>
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
          <p className="text-xs text-[#6B7280]">Loading rankings...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.leaderboard?.map((entry: any) => (
            <div
              key={entry.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 bg-white ${
                entry.isCurrentUser
                  ? "border-[#6366F1] ring-2 ring-[#6366F1]/30 shadow-xs"
                  : "border-[#E8E8E5] hover:border-[#D1D5DB]"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-8 text-center flex items-center justify-center shrink-0">
                  {getRankBadge(entry.rank)}
                </div>

                <div className="w-9 h-9 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] flex items-center justify-center text-xs font-bold text-[#202124] shrink-0">
                  {entry.name?.slice(0, 2).toUpperCase() || "US"}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#202124] truncate">
                      {entry.name}
                    </span>
                    {entry.isCurrentUser && (
                      <span className="text-[10px] font-bold text-[#6366F1] bg-[#EEF2FF] px-1.5 py-0.5 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-0.5">
                    <span className="text-[#6366F1] font-semibold">Lv. {entry.level}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#C2410C] font-semibold">
                      <Flame className="w-3 h-3 fill-[#F97316] text-[#F97316]" />
                      {entry.streak}d streak
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm sm:text-base font-black text-[#202124] font-mono">
                  {formatNumber(entry.points)} <span className="text-xs font-sans text-[#F97316] font-bold">XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
