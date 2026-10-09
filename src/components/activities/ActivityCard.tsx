"use client";

import Link from "next/link";
import { Star, Clock, Flame, ArrowRight, Play } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { getActivityIcon, GAME_CARD_IMAGES } from "@/lib/icons";

interface ActivityCardProps {
  activity: {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    type: string;
    thumbnail: string;
    difficulty: string;
    estimatedTime: string;
    points: number;
    playCount: number;
    rating: number;
  };
  featured?: boolean;
}

export function ActivityCard({ activity, featured = false }: ActivityCardProps) {
  const isQuiz = activity.category === "QUIZ" || activity.type === "TRIVIA";
  const targetUrl = isQuiz ? `/quiz/${activity.slug}` : `/play/${activity.slug}`;

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toUpperCase()) {
      case "HARD":
        return "text-[#DC2626] bg-[#FEF2F2] border-[#FEE2E2]";
      case "MEDIUM":
        return "text-[#D97706] bg-[#FFFBEB] border-[#FEF3C7]";
      default:
        return "text-[#16A34A] bg-[#F0FDF4] border-[#DCFCE7]";
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat.toUpperCase()) {
      case "GAME":
        return "text-[#F97316] bg-[#FFF7ED] border-[#FFEDD5]";
      case "QUIZ":
        return "text-[#6366F1] bg-[#EEF2FF] border-[#E0E7FF]";
      case "FUN":
        return "text-[#D97706] bg-[#FFFBEB] border-[#FEF3C7]";
      case "CREATIVE":
        return "text-[#DB2777] bg-[#FDF2F8] border-[#FCE7F3]";
      case "RANDOM":
        return "text-[#4F46E5] bg-[#EEF2FF] border-[#E0E7FF]";
      default:
        return "text-[#6B7280] bg-[#F0F0ED] border-[#E8E8E5]";
    }
  };

  return (
    <Link
      href={targetUrl}
      className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between bg-white border cursor-pointer ${
        featured
          ? "border-[#F97316]/50 shadow-sm hover:shadow-md hover:border-[#F97316]"
          : "border-[#E8E8E5] shadow-xs hover:border-[#D1D5DB] hover:shadow-sm"
      } hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]`}
    >
      <div>
        {/* Top Badges & Rating */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getCategoryBadge(
                activity.category
              )}`}
            >
              {activity.category}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getDifficultyBadge(
                activity.difficulty
              )}`}
            >
              {activity.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-[#202124] bg-[#F0F0ED] px-2 py-0.5 rounded-lg border border-[#E8E8E5]">
            <Star className="w-3 h-3 fill-[#F97316] text-[#F97316]" />
            <span>{activity.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3 my-2">
          <div className="w-11 h-11 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#FFF7ED] group-hover:border-[#FFEDD5] transition-all overflow-hidden p-1">
            {GAME_CARD_IMAGES[activity.slug] ? (
              <img
                src={GAME_CARD_IMAGES[activity.slug]}
                alt={activity.title}
                className="w-full h-full object-contain"
              />
            ) : (
              getActivityIcon(activity.slug, "w-6 h-6 text-[#202124]")
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-[#202124] group-hover:text-[#F97316] transition-colors line-clamp-1">
              {activity.title}
            </h3>
            <p className="text-xs text-[#6B7280] mt-1 line-clamp-2 leading-relaxed">
              {activity.description}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Meta & Action */}
      <div className="pt-3 mt-3 border-t border-[#E8E8E5] flex items-center justify-between text-xs text-[#6B7280]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>{activity.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#F97316]" />
            <span>{formatNumber(activity.playCount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[#F97316] group-hover:translate-x-0.5 transition-transform">
          <span>{isQuiz ? "Quiz" : "Play"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
