"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, Flame, Clock, Play, Heart, Sparkles, Gamepad2, BrainCircuit } from "lucide-react";
import { getActivityImage } from "@/lib/activityImages";
import { formatNumber } from "@/lib/utils";
import { sound } from "@/lib/audio";

export interface ActivityCardProps {
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
  isFavorite?: boolean;
  onFavoriteToggle?: (slug: string, e: React.MouseEvent) => void;
  className?: string;
  onClick?: () => void;
}

export function ActivityCard({
  activity,
  featured = false,
  isFavorite = false,
  onFavoriteToggle,
  className = "",
  onClick,
}: ActivityCardProps) {
  const MASTER_PLAY_GAMES = [
    "dots-and-boxes",
    "nine-mens-morris",
    "whack-a-mole",
    "sudoku",
    "daily-word-guess",
    "hangman",
    "general-knowledge-quiz",
    "flag-country-quiz",
    "science-quiz",
    "guess-the-country",
    "true-or-false",
  ];
  const isQuiz =
    (activity.category === "QUIZ" || activity.type === "TRIVIA") &&
    !MASTER_PLAY_GAMES.includes(activity.slug);
  const targetUrl = isQuiz ? `/quiz/${activity.slug}` : `/play/${activity.slug}`;
  const initialImage = getActivityImage(activity);
  const [imageSrc, setImageSrc] = useState(initialImage);

  const handleClick = () => {
    sound.playClick();
    if (onClick) onClick();
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toUpperCase()) {
      case "HARD":
        return {
          label: "Hard",
          bg: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900/50 dark:text-rose-400",
          dot: "bg-rose-500",
        };
      case "MEDIUM":
        return {
          label: "Medium",
          bg: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50 dark:text-amber-400",
          dot: "bg-amber-500",
        };
      default:
        return {
          label: "Easy",
          bg: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50 dark:text-emerald-400",
          dot: "bg-emerald-500",
        };
    }
  };

  const diffStyle = getDifficultyBadge(activity.difficulty || "EASY");

  return (
    <Link
      href={targetUrl}
      onClick={handleClick}
      className={`group relative rounded-[22px] overflow-hidden bg-white border border-[#E8E8E5] shadow-xs hover:border-[#F97316]/50 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none ${
        featured ? "ring-2 ring-[#F97316] shadow-md" : ""
      } ${className}`}
    >
      {/* ============================================================== */}
      {/* 1. TOP GAME COVER SHOWCASE (Vivid artwork + Gaming Overlays)     */}
      {/* ============================================================== */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        {/* Full-Color Vivid Artwork */}
        <img
          src={imageSrc}
          alt={activity.title}
          onError={() => setImageSrc("/images/hero-mascot.jpg")}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Subtle Vignette for Badge Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Category Chip */}
          <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-1.5 pointer-events-auto">
            {isQuiz ? (
              <BrainCircuit className="w-3 h-3 text-cyan-400" />
            ) : (
              <Gamepad2 className="w-3 h-3 text-amber-400" />
            )}
            <span>{activity.category}</span>
          </span>

          {/* Right: XP Reward Chip + Favorite Button */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] shadow-sm flex items-center gap-1 tracking-wider">
              <span>+{activity.points} XP</span>
            </span>

            {onFavoriteToggle && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFavoriteToggle(activity.slug, e);
                }}
                aria-label={isFavorite ? "Remove favorite" : "Add to favorite"}
                className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-rose-400 hover:bg-black/70 transition-all cursor-pointer shadow-sm active:scale-90"
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    isFavorite ? "fill-rose-500 text-rose-500" : "text-white"
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Center Hover Play Action (Arcade Launch Trigger) */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] text-white shadow-xl shadow-orange-500/40 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 ease-out border border-white/30">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CARD BODY & METADATA (High Readability & Game Stats)        */}
      {/* ============================================================== */}
      <div className="p-4 sm:p-4.5 flex flex-col justify-between flex-1 space-y-3 bg-white">
        <div>
          {/* Game Title */}
          <h3 className="text-base sm:text-[17px] font-black text-[#202124] tracking-tight line-clamp-1 group-hover:text-[#F97316] transition-colors">
            {activity.title}
          </h3>

          {/* Game Hook Description */}
          <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed mt-1">
            {activity.description}
          </p>
        </div>

        <div>
          {/* Game Stats Row */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F0F0ED]">
            <div className="flex items-center gap-2.5">
              {/* Rating */}
              <div className="flex items-center gap-1 font-bold text-[#202124]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{activity.rating.toFixed(1)}</span>
              </div>

              {/* Play Count */}
              <div className="flex items-center gap-1 font-semibold text-[#6B7280]">
                <Flame className="w-3.5 h-3.5 text-[#F97316]" />
                <span>{formatNumber(activity.playCount)}</span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1 font-medium text-[#6B7280]">
                <Clock className="w-3.5 h-3.5" />
                <span>{activity.estimatedTime}</span>
              </div>
            </div>

            {/* Difficulty Badge */}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${diffStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
              <span>{diffStyle.label}</span>
            </span>
          </div>

          {/* ============================================================== */}
          {/* 3. TACTILE GAMING ACTION BUTTON (Morphs to arcade orange)      */}
          {/* ============================================================== */}
          <div className="mt-3 w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 bg-[#F0F0ED] text-[#202124] group-hover:bg-[#F97316] group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/25 transition-all duration-200">
            <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
            <span>{isQuiz ? "Start Quiz" : "Play Game"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
