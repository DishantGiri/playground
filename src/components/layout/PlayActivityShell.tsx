"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Clock, Trophy, HelpCircle, ChevronDown, ChevronUp, X } from "lucide-react";
import { getActivityIcon } from "@/lib/icons";

interface Props {
  activity: {
    slug: string;
    title: string;
    description?: string;
    category: string;
    difficulty: string;
    rating: number;
    estimatedTime: string;
    points: number;
  };
  children: React.ReactNode;
}

export function PlayActivityShell({ activity, children }: Props) {
  const [showHelp, setShowHelp] = useState(false);

  // Save last played game for the Home Page "Continue playing" feature
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "bored_last_game",
          JSON.stringify({ slug: activity.slug, title: activity.title })
        );
      } catch (e) {
        // ignore
      }
    }
  }, [activity.slug, activity.title]);

  return (
    <div className="w-full min-w-0 flex flex-col flex-1 px-2 sm:px-4 py-2 sm:py-3 min-h-[calc(100dvh-3rem)]">
      
      {/* Compact Top Header Bar */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-xl px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shadow-2xs mb-2 sm:mb-3">
        
        {/* Left: Back & Game Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/explore"
            className="flex items-center gap-1 text-xs font-semibold text-[#6B7280] hover:text-[#202124] p-1 rounded-lg hover:bg-[#F0F0ED] transition-colors shrink-0"
            title="Back to games"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Games</span>
          </Link>

          <div className="h-4 w-px bg-[#E8E8E5] shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#F0F0ED] flex items-center justify-center shrink-0">
              {getActivityIcon(activity.slug, "w-4 h-4 text-[#202124]")}
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-[#202124] truncate">
                {activity.title}
              </h1>
            </div>
            <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-md shrink-0">
              {activity.category}
            </span>
          </div>
        </div>

        {/* Right: Stats & Help Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs">
          <div className="hidden sm:flex items-center gap-2 text-[#6B7280] bg-[#F7F7F5] px-2.5 py-1 rounded-lg border border-[#E8E8E5]">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="w-3 h-3 fill-[#F97316] text-[#F97316]" />
              <span className="text-[#202124]">{activity.rating.toFixed(1)}</span>
            </span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#6B7280]" />
              <span>{activity.estimatedTime}</span>
            </span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="flex items-center gap-1 font-bold text-[#F97316]">
              <Trophy className="w-3 h-3" />
              <span>+{activity.points} XP</span>
            </span>
          </div>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              showHelp
                ? "bg-[#EEF2FF] text-[#6366F1] border-[#C7D2FE]"
                : "bg-white text-[#6B7280] border-[#E8E8E5] hover:text-[#202124] hover:bg-[#F0F0ED]"
            }`}
            title="How to play"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">How to play</span>
          </button>
        </div>

      </div>

      {/* Expandable Help Modal/Drawer */}
      {showHelp && (
        <div className="w-full bg-white border border-[#C7D2FE] bg-gradient-to-r from-[#EEF2FF]/40 to-white rounded-xl p-3 sm:p-4 mb-3 text-xs text-[#202124] shadow-xs animate-in fade-in flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-bold text-[#6366F1] text-xs">How to Play & Objective</h3>
            <p className="text-[#6B7280] leading-relaxed">
              {activity.description || "Follow on-screen instructions, test your speed and intuition, and complete the game to record your score and win XP."}
            </p>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className="p-1 rounded-md text-[#6B7280] hover:text-[#202124] hover:bg-white transition-colors cursor-pointer shrink-0"
            aria-label="Close instructions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Interactive Gameplay Area */}
      <div className="w-full min-w-0 flex-1 flex flex-col items-center justify-center min-h-0">
        {children}
      </div>

    </div>
  );
}
