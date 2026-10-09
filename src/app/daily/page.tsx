"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Trophy, Calendar, CheckCircle2, ArrowRight, Loader2, Zap, Circle } from "lucide-react";

export default function DailyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDaily();
  }, []);

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/daily");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
        <p className="text-xs text-[#6B7280]">Loading daily challenge & streaks...</p>
      </div>
    );
  }

  const challenge = data?.challenge;
  const userProgress = data?.userProgress || 0;
  const targetCount = challenge?.targetCount || 3;
  const isCompleted = data?.completed || userProgress >= targetCount;
  const progressPercent = Math.min(100, Math.round((userProgress / targetCount) * 100));

  return (
    <div className="w-full min-w-0 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] text-xs font-bold">
          <Flame className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" />
          <span>Daily Habit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
          Daily Challenge & Streaks
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          Complete your daily mission before midnight to preserve your streak and score bonus XP.
        </p>
      </div>

      {/* Streak Tracker (Mon - Sun) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E8E5] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#F97316] fill-[#F97316]" />
            <h3 className="text-sm sm:text-base font-bold text-[#202124]">
              {data?.userStreak || 1} Day Streak
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#6B7280]">
            Streak multiplier: <span className="text-[#C2410C] font-bold">1.2x XP</span>
          </span>
        </div>

        {/* 7 Day Pills */}
        <div className="grid grid-cols-7 gap-2">
          {data?.weekProgress?.map((day: any, i: number) => (
            <div
              key={i}
              className={`p-2.5 sm:p-3 rounded-xl border text-center transition-all ${
                day.isDone
                  ? "bg-[#FFF7ED] border-[#FFEDD5] text-[#C2410C]"
                  : day.isToday
                  ? "bg-[#EEF2FF] border-[#C7D2FE] text-[#6366F1] ring-2 ring-[#6366F1]"
                  : "bg-[#F7F7F5] border-[#E8E8E5] text-[#9CA3AF]"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider">{day.day}</div>
              <div className="mt-1 flex items-center justify-center">
                {day.isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                ) : day.isToday ? (
                  <Zap className="w-4 h-4 text-[#6366F1]" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[#D1D5DB]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Challenge Box */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E8E8E5] shadow-2xs space-y-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#6366F1] bg-[#EEF2FF] px-2.5 py-1 rounded-lg border border-[#C7D2FE]">
            Today&apos;s Mission
          </span>
          <span className="text-[#C2410C] font-bold bg-[#FFF7ED] px-2.5 py-1 rounded-lg border border-[#FFEDD5]">
            Reward: +{challenge?.xpReward || 150} XP
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#202124]">
            {challenge?.title || "Boredom Destroyer"}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            {challenge?.description || "Complete 3 different activities on the platform today."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#6B7280]">Progress</span>
            <span className="text-[#F97316] font-mono">
              {userProgress} / {targetCount} ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-[#F0F0ED] rounded-full h-2.5 overflow-hidden border border-[#E8E8E5]">
            <div
              className="bg-[#F97316] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#16A34A] bg-[#F0FDF4] px-3 py-1.5 rounded-xl border border-[#DCFCE7]">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
              <span>Completed! +{challenge?.xpReward} XP awarded</span>
            </div>
          ) : (
            <span className="text-xs text-[#6B7280]">
              Complete {Math.max(0, targetCount - userProgress)} more activity to finish today&apos;s goal.
            </span>
          )}

          <Link
            href="/explore"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#F97316] hover:bg-[#EA580C] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>{isCompleted ? "Play More Activities" : "Continue Challenge"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
