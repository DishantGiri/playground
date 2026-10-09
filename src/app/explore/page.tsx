"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { AdSlot } from "@/components/ads/AdSlot";
import {
  Search,
  Loader2,
  Sparkles,
  Gamepad2,
  BrainCircuit,
  Smile,
  Palette,
  Dices,
  Zap,
  Swords,
} from "lucide-react";

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
        <p className="text-xs text-[#6B7280]">Loading activity directory...</p>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";
  const initialDuration = searchParams.get("duration") || "ALL";
  const initialSort = searchParams.get("sort") || "trending";
  const initialSearch = searchParams.get("search") || "";

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState("ALL");
  const [duration, setDuration] = useState(initialDuration);
  const [sort, setSort] = useState(initialSort);

  useEffect(() => {
    fetchActivities();
  }, [category, difficulty, duration, sort, search]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== "ALL") params.append("category", category);
      if (difficulty !== "ALL") params.append("difficulty", difficulty);
      if (duration === "quick") params.append("duration", "quick");
      if (search.trim()) params.append("search", search.trim());
      if (sort) params.append("sort", sort);

      const res = await fetch(`/api/activities?${params.toString()}`);
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { label: "All Activities", value: "ALL", icon: Sparkles },
    { label: "Games", value: "GAME", icon: Gamepad2 },
    { label: "Quizzes", value: "QUIZ", icon: BrainCircuit },
    { label: "Jokes & Fun", value: "FUN", icon: Smile },
    { label: "Creative", value: "CREATIVE", icon: Palette },
    { label: "Random", value: "RANDOM", icon: Dices },
    { label: "Multiplayer", value: "MULTIPLAYER", icon: Swords },
  ];

  return (
    <div className="w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Activity Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#202124] tracking-tight">
          Explore Boredom Busters
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] max-w-xl">
          Discover interactive challenges, knowledge quizzes, speed tests, and creative generators.
        </p>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#E8E8E5] shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities, games, quizzes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F0F0ED] border border-transparent text-xs sm:text-sm text-[#202124] placeholder-[#6B7280] focus:outline-none focus:border-[#6366F1] focus:bg-white transition-colors"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty filter */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E8E8E5] text-xs font-semibold text-[#202124] focus:outline-none focus:border-[#6366F1] cursor-pointer"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          {/* Duration filter */}
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E8E8E5] text-xs font-semibold text-[#202124] focus:outline-none focus:border-[#6366F1] cursor-pointer"
          >
            <option value="ALL">Any Duration</option>
            <option value="quick">Under 2 min</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E8E8E5] text-xs font-semibold text-[#202124] focus:outline-none focus:border-[#6366F1] cursor-pointer"
          >
            <option value="trending">Trending First</option>
            <option value="most_played">Most Played</option>
            <option value="highest_rated">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => {
          const IconComp = c.icon;
          const isSelected = category === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                isSelected
                  ? "bg-[#6366F1] text-white border-[#6366F1] shadow-xs"
                  : "bg-white border-[#E8E8E5] text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED]"
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#6B7280]"}`} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Activities */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
          <p className="text-xs text-[#6B7280]">Loading activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="py-16 text-center space-y-3 p-8 rounded-2xl bg-white border border-[#E8E8E5] shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F0F0ED] flex items-center justify-center text-[#6B7280]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#202124]">No activities found</h3>
          <p className="text-xs text-[#6B7280]">
            Try adjusting your search query or reset your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {activities.map((act, index) => {
            const showAd = index === 5;
            return (
              <div key={act.id} className="contents">
                <ActivityCard activity={act} />
                {showAd && <AdSlot placement="inline" className="sm:col-span-1" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Ad Banner */}
      <AdSlot placement="banner" />
    </div>
  );
}
