"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Sparkles, 
  Gamepad2, 
  Puzzle, 
  Trophy, 
  Flame, 
  Clock, 
  Star, 
  Heart,
  Grid,
  Zap,
  Swords,
  Brain,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import { getActivityIcon } from "@/lib/icons";
import { formatNumber } from "@/lib/utils";

interface Activity {
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
}

interface Props {
  activities: Activity[];
}

const CATEGORIES = [
  { id: "all", label: "All Games", icon: Grid },
  { id: "puzzle", label: "Puzzle", icon: Puzzle },
  { id: "board", label: "Board", icon: Gamepad2 },
  { id: "arcade", label: "Arcade", icon: Zap },
  { id: "strategy", label: "Strategy", icon: Swords },
  { id: "casual", label: "Casual", icon: Sparkles },
  { id: "trivia", label: "Trivia & Quiz", icon: Brain },
];

export function HomeGameExplorer({ activities }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bored_fav_games");
        if (saved) setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleFavorite = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(slug)) {
      updated = favorites.filter((s) => s !== slug);
    } else {
      updated = [...favorites, slug];
    }
    setFavorites(updated);
    try {
      localStorage.setItem("bored_fav_games", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(act.slug)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = act.title.toLowerCase().includes(q);
        const matchesDesc = act.description.toLowerCase().includes(q);
        const matchesCat = act.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // Category filter
      if (selectedCategory === "all") return true;

      const slug = act.slug.toLowerCase();
      const cat = act.category.toLowerCase();
      const type = act.type.toLowerCase();

      if (selectedCategory === "puzzle") {
        return (
          slug.includes("memory") ||
          slug.includes("guess") ||
          slug.includes("connect") ||
          type.includes("memory") ||
          type.includes("guess")
        );
      }
      if (selectedCategory === "board") {
        return slug.includes("connect") || slug.includes("memory");
      }
      if (selectedCategory === "arcade") {
        return (
          slug.includes("reaction") ||
          slug.includes("click") ||
          slug.includes("typing") ||
          type.includes("reaction") ||
          type.includes("typing")
        );
      }
      if (selectedCategory === "strategy") {
        return slug.includes("connect") || slug.includes("number-guess");
      }
      if (selectedCategory === "casual") {
        return (
          cat === "fun" ||
          cat === "creative" ||
          cat === "random" ||
          slug.includes("jokes") ||
          slug.includes("thoughts") ||
          slug.includes("rather") ||
          slug.includes("pixel") ||
          slug.includes("soundboard")
        );
      }
      if (selectedCategory === "trivia") {
        return cat === "quiz" || type.includes("trivia") || type.includes("quiz");
      }

      return true;
    });
  }, [activities, searchQuery, selectedCategory, favorites, showFavoritesOnly]);

  return (
    <section className="w-full space-y-6">
      {/* Search and Category Filter Header */}
      <div className="w-full space-y-4">
        
        {/* Search input + Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="home-game-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by game name, puzzle, or tag..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E8E8E5] text-xs sm:text-sm text-[#202124] placeholder-[#6B7280] shadow-2xs focus:bg-white focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6B7280] hover:text-[#202124]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Favorite Filter Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0 ${
              showFavoritesOnly
                ? "bg-[#EEF2FF] text-[#6366F1] border-[#C7D2FE]"
                : "bg-white text-[#6B7280] border-[#E8E8E5] hover:text-[#202124] hover:bg-[#F0F0ED]"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-[#6366F1] text-[#6366F1]" : "text-[#6B7280]"}`} />
            <span>Favorites ({favorites.length})</span>
          </button>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id && !showFavoritesOnly;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowFavoritesOnly(false);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#6366F1] text-white border-[#6366F1] shadow-xs"
                    : "bg-white text-[#6B7280] border-[#E8E8E5] hover:text-[#202124] hover:bg-[#F0F0ED]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[#6B7280]"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Games */}
      {filteredActivities.length === 0 ? (
        <div className="w-full py-16 text-center space-y-3 p-8 rounded-2xl bg-white border border-[#E8E8E5]">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F0F0ED] flex items-center justify-center text-[#6B7280]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#202124]">No games found</h3>
          <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
            Try adjusting your search terms, changing the category, or clearing your favorite filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setShowFavoritesOnly(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 w-full">
          {filteredActivities.map((act) => {
            const isQuiz = act.category === "QUIZ" || act.type === "TRIVIA";
            const targetUrl = isQuiz ? `/quiz/${act.slug}` : `/play/${act.slug}`;
            const isFav = favorites.includes(act.slug);

            return (
              <Link
                key={act.id}
                href={targetUrl}
                className="group relative rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between bg-white border border-[#E8E8E5] shadow-2xs hover:border-[#D1D5DB] hover:shadow-xs hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]"
              >
                {/* Top Badge & Favorite Button */}
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
                      {act.category}
                    </span>

                    <button
                      onClick={(e) => toggleFavorite(act.slug, e)}
                      className="p-1 rounded-lg text-[#6B7280] hover:text-[#DC2626] transition-colors"
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                      aria-label="Toggle favorite"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-[#DC2626] text-[#DC2626]" : "text-[#9CA3AF]"}`} />
                    </button>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3 my-1.5">
                    <div className="w-11 h-11 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#FFF7ED] transition-transform">
                      {getActivityIcon(act.slug, "w-6 h-6 text-[#202124]")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#202124] group-hover:text-[#F97316] transition-colors line-clamp-1">
                        {act.title}
                      </h3>
                      <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Meta & Action */}
                <div className="pt-3 mt-2.5 border-t border-[#E8E8E5] flex items-center justify-between text-xs text-[#6B7280]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#6B7280]" />
                      <span>{act.estimatedTime}</span>
                    </span>
                    <span className="text-[#D1D5DB]">•</span>
                    <span className="flex items-center gap-0.5 font-bold text-[#202124]">
                      <Star className="w-3 h-3 fill-[#F97316] text-[#F97316]" />
                      <span>{act.rating.toFixed(1)}</span>
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold text-[#F97316] group-hover:translate-x-0.5 transition-transform">
                    <span>{isQuiz ? "Quiz" : "Play"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
