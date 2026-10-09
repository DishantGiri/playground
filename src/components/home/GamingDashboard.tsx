"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Zap,
  Sparkles,
  Trophy,
  Compass,
  Crown,
  Medal,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Play,
  Swords,
  Gamepad2,
  Puzzle,
  Brain,
  Keyboard,
  CircleDot,
  Layers,
  Binary,
  Star,
  Search,
  Users,
  Clock,
  Heart,
  Grid,
} from "lucide-react";
import { getActivityIcon } from "@/lib/icons";
import { getActivityImage } from "@/lib/activityImages";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { formatNumber } from "@/lib/utils";
import { sound } from "@/lib/audio";

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

interface LeaderboardUser {
  id: string;
  name: string;
  image?: string;
  points: number;
  level: number;
  streak: number;
}

interface Props {
  activities: Activity[];
  topUsers: LeaderboardUser[];
  dailyChallenge?: {
    id: string;
    title: string;
    description: string;
    xpReward: number;
  } | null;
}

const SIDEBAR_NAV = [
  { id: "home", label: "Home", icon: Compass, href: "/" },
  { id: "popular", label: "Popular", icon: Flame, filter: "popular" },
  { id: "trending", label: "Trending", icon: Zap, filter: "trending" },
  { id: "multiplayer", label: "2-Player Duel", icon: Swords, href: "/multiplayer" },
  { id: "daily", label: "Daily Challenge", icon: Trophy, href: "/daily" },
];

const CATEGORIES = [
  { id: "all", label: "All Games", icon: Grid },
  { id: "board", label: "Board & Tactical", icon: Gamepad2 },
  { id: "memory", label: "Memory & Cards", icon: Layers },
  { id: "reflex", label: "Reflex & Speed", icon: Zap },
  { id: "puzzle", label: "Puzzle & Logic", icon: Puzzle },
  { id: "typing", label: "Typing & Words", icon: Keyboard },
  { id: "casual", label: "Casual & Fun", icon: Sparkles },
  { id: "trivia", label: "Trivia & Quiz", icon: Brain },
];

// Fallback champions if database has few registered users
const DEFAULT_TOP_USERS: LeaderboardUser[] = [
  { id: "champion-1", name: "Alex Rover", points: 14850, level: 18, streak: 14 },
  { id: "champion-2", name: "Elena Woods", points: 11200, level: 15, streak: 9 },
  { id: "champion-3", name: "Marcus King", points: 9450, level: 12, streak: 7 },
];

export function GamingDashboard({ activities, topUsers, dailyChallenge }: Props) {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [leaderboardPage, setLeaderboardPage] = useState(0);

  // Load favorites from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bored_fav_games");
        if (saved) setFavorites(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const toggleFavorite = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playClick();
    const updated = favorites.includes(slug)
      ? favorites.filter((s) => s !== slug)
      : [...favorites, slug];
    setFavorites(updated);
    try {
      localStorage.setItem("bored_fav_games", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  // Top 3 Leaderboard players
  const podiumUsers = useMemo(() => {
    const list = [...(topUsers.length >= 3 ? topUsers : DEFAULT_TOP_USERS)];
    return list.slice(0, 3);
  }, [topUsers]);

  // Featured 3 Top Showcase Games
  const featuredGames = [
    {
      slug: "connect-4",
      title: "Connect 4 Duel",
      subtitle: "152k Players • 2-Player & AI",
      badge: "🔥 HOT",
      badgeColor: "bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]",
      btnColor: "bg-[#F97316] hover:bg-[#EA580C] text-white",
      bgGradient: "bg-gradient-to-br from-[#EEF2FF] via-white to-[#FFF7ED]",
      border: "border-[#E8E8E5]",
      image: "/images/connect-4.png",
      iconSlug: "connect-4",
    },
    {
      slug: "memory-game",
      title: "Card Memory Match",
      subtitle: "98k Players • 4x6 Illustrated Arena",
      badge: "⭐ 4.9",
      badgeColor: "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]",
      btnColor: "bg-[#6366F1] hover:bg-[#4F46E5] text-white",
      bgGradient: "bg-gradient-to-br from-[#FFF7ED] via-white to-[#EEF2FF]",
      border: "border-[#E8E8E5]",
      image: "/images/fox-card.png",
      iconSlug: "memory-game",
    },
    {
      slug: "reaction-test",
      title: "Reaction Speed Tap",
      subtitle: "114k Players • Sub-250ms Reflexes",
      badge: "⚡ FAST",
      badgeColor: "bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]",
      btnColor: "bg-[#F97316] hover:bg-[#EA580C] text-white",
      bgGradient: "bg-gradient-to-br from-[#F0FDF4] via-white to-[#FFF7ED]",
      border: "border-[#E8E8E5]",
      image: "/images/reaction-test.svg",
      iconSlug: "reaction-test",
    },
  ];

  // Quick Games Row (6 Vertical Cards)
  const quickGames = [
    {
      slug: "number-guess",
      title: "Number Guess",
      category: "Deduction",
      players: "45k",
      image: "/images/number-guess.png",
      tag: "HOT",
    },
    {
      slug: "typing-test",
      title: "Typing Sprint",
      category: "Keyboard",
      players: "62k",
      image: "/images/typing-sprint.png",
      tag: "SPEED",
    },
    {
      slug: "connect-4",
      title: "Connect 4",
      category: "Tactical",
      players: "152k",
      image: "/images/connect-4.png",
      tag: "1v1 DUEL",
    },
    {
      slug: "memory-game",
      title: "Memory Duel",
      category: "Cards",
      players: "98k",
      image: "/images/fox-card.png",
      tag: "4x6 DECK",
    },
    {
      slug: "reaction-test",
      title: "Reflex Tap",
      category: "Reflex",
      players: "114k",
      image: "/images/reaction-test.svg",
      tag: "INSTANT",
    },
    {
      slug: "would-you-rather",
      title: "Dilemmas",
      category: "Casual",
      players: "38k",
      image: "/images/would-you-rather.svg",
      tag: "CHOICE",
    },
  ];

  // Filtered Activities for Game Explorer
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Category filter
      if (selectedCategory !== "all") {
        const cat = selectedCategory.toLowerCase();
        if (cat === "board" && act.slug !== "connect-4") return false;
        if (cat === "memory" && act.slug !== "memory-game") return false;
        if (cat === "reflex" && act.slug !== "reaction-test" && act.slug !== "click-frenzy") return false;
        if (cat === "typing" && act.slug !== "typing-test") return false;
        if (cat === "puzzle" && act.slug !== "number-guess" && act.category.toLowerCase() !== "puzzle") return false;
        if (cat === "trivia" && act.category.toLowerCase() !== "quiz" && act.category.toLowerCase() !== "trivia") return false;
        if (cat === "casual" && act.category.toLowerCase() !== "casual" && act.category.toLowerCase() !== "fun") return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          act.title.toLowerCase().includes(q) ||
          act.description.toLowerCase().includes(q) ||
          act.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [activities, selectedCategory, searchQuery]);

  return (
    <div className="w-full min-w-0 flex flex-col md:flex-row gap-4 lg:gap-6 items-start">
      
      {/* ============================================================== */}
      {/* 1. LEFT VERTICAL NAVIGATION SIDEBAR (Matching reference image) */}
      {/* ============================================================== */}
      <aside className="w-full md:w-48 lg:w-56 shrink-0 bg-white border border-[#E8E8E5] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xs space-y-4 md:sticky md:top-16">
        
        {/* Core Navigation Items */}
        <div className="space-y-1">
          {SIDEBAR_NAV.map((nav) => {
            const Icon = nav.icon;
            const isActive = activeTab === nav.id;

            return nav.href ? (
              <Link
                key={nav.id}
                href={nav.href}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(nav.id);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#FFF7ED] text-[#F97316] border border-[#FFEDD5] shadow-2xs"
                    : "text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#F97316]" : "text-[#6B7280]"}`} />
                <span>{nav.label}</span>
              </Link>
            ) : (
              <button
                key={nav.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(nav.id);
                  if (nav.filter === "popular") {
                    setSelectedCategory("all");
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-[#FFF7ED] text-[#F97316] border border-[#FFEDD5] shadow-2xs"
                    : "text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#F97316]" : "text-[#6B7280]"}`} />
                <span>{nav.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category Divider & Subheader */}
        <div className="pt-2 border-t border-[#E8E8E5] space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] px-3 block mb-1.5">
            Categories
          </span>

          <div className="space-y-0.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(cat.id);
                    setActiveTab("home");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-[#EEF2FF] text-[#6366F1] font-bold border border-[#C7D2FE]"
                      : "text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#6366F1]" : "text-[#9CA3AF]"}`} />
                    <span>{cat.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Streak / Mascot Mini-Banner */}
        <div className="pt-2 border-t border-[#E8E8E5]">
          <Link
            href="/daily"
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] hover:border-[#F97316]/40 transition-all text-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E8E5] flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-[#F97316]" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-[#202124] block truncate">Daily Streak</span>
              <span className="text-[10px] text-[#F97316] font-bold">+150 XP Today</span>
            </div>
          </Link>
        </div>

      </aside>

      {/* ============================================================== */}
      {/* 2. MAIN DASHBOARD CONTENT (Matching reference image)           */}
      {/* ============================================================== */}
      <main className="flex-1 min-w-0 space-y-5 sm:space-y-6 w-full">
        
        {/* ROW 1: TOP 3 FEATURED SHOWCASE CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 w-full">
          {featuredGames.map((game) => (
            <div
              key={game.slug}
              className={`rounded-2xl sm:rounded-3xl border ${game.border} ${game.bgGradient} p-4 sm:p-5 shadow-2xs flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xs group min-h-[170px] sm:min-h-[190px]`}
            >
              {/* Background Art Silhouette */}
              <div className="absolute right-0 bottom-0 w-36 h-36 opacity-15 pointer-events-none transition-transform duration-300 group-hover:scale-110">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Top Row: Icon + Badge */}
              <div className="flex items-center justify-between relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E8E5] flex items-center justify-center shadow-2xs overflow-hidden p-1">
                  {game.image ? (
                    <img src={game.image} alt={game.title} className="w-full h-full object-contain" />
                  ) : (
                    getActivityIcon(game.iconSlug, "w-5 h-5")
                  )}
                </div>

                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-2xs ${game.badgeColor}`}>
                  {game.badge}
                </span>
              </div>

              {/* Bottom Row: Game Title & Play Now Button */}
              <div className="relative z-10 pt-4 flex items-end justify-between gap-2">
                <div className="min-w-0 pr-1">
                  <h2 className="text-base sm:text-lg font-black text-[#202124] tracking-tight truncate group-hover:text-[#F97316] transition-colors">
                    {game.title}
                  </h2>
                  <p className="text-[11px] font-semibold text-[#6B7280] truncate mt-0.5">
                    {game.subtitle}
                  </p>
                </div>

                <Link
                  href={`/play/${game.slug}`}
                  onClick={() => sound.playClick()}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 ${game.btnColor}`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play</span>
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* ROW 2: LEADERBOARD SECTION (Styled like reference mockup) */}
        <section className="w-full rounded-2xl sm:rounded-3xl bg-white border border-[#E8E8E5] p-4 sm:p-5 shadow-2xs space-y-4">
          
          {/* Section Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Leaderboard Pill Tag */}
              <div className="px-3.5 py-1.5 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center gap-1.5 text-xs font-black text-[#F97316] shadow-2xs">
                <Trophy className="w-3.5 h-3.5" />
                <span>Leaderboard</span>
              </div>

              <p className="text-xs text-[#6B7280] hidden sm:block">
                Top players updated in real-time • Compete to reach #1!
              </p>
            </div>

            {/* Right Buttons: See All + Navigation Arrows */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Link
                href="/leaderboard"
                className="text-xs font-bold text-[#6B7280] hover:text-[#202124] px-3 py-1.5 rounded-xl border border-[#E8E8E5] hover:bg-[#F0F0ED] transition-colors"
              >
                See All
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => sound.playClick()}
                  className="p-1.5 rounded-xl border border-[#E8E8E5] hover:bg-[#F0F0ED] text-[#6B7280] cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => sound.playClick()}
                  className="p-1.5 rounded-xl border border-[#E8E8E5] hover:bg-[#F0F0ED] text-[#6B7280] cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 3 Podium Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            
            {/* 1st Place Podium Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-[#F97316]/40 bg-gradient-to-b from-[#FFF7ED] to-white shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white border border-[#FFEDD5] flex items-center justify-center text-[#F97316] shrink-0 shadow-2xs relative">
                  <Crown className="w-5 h-5 fill-[#F97316]" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-black text-[#202124] truncate block">
                    {podiumUsers[0]?.name || "Alex Rover"}
                  </span>
                  <span className="text-xs font-black font-mono text-[#F97316]">
                    {formatNumber(podiumUsers[0]?.points || 14850)} XP
                  </span>
                  <span className="text-[10px] text-[#6B7280] block font-semibold">
                    Level {podiumUsers[0]?.level || 18} • 1st Place
                  </span>
                </div>
              </div>

              {/* Stylized Rank 1 Badge */}
              <div className="w-9 h-9 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                1
              </div>
            </div>

            {/* 2nd Place Podium Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-[#6366F1]/30 bg-gradient-to-b from-[#EEF2FF] to-white shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white border border-[#C7D2FE] flex items-center justify-center text-[#6366F1] shrink-0 shadow-2xs">
                  <Medal className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-black text-[#202124] truncate block">
                    {podiumUsers[1]?.name || "Elena Woods"}
                  </span>
                  <span className="text-xs font-black font-mono text-[#6366F1]">
                    {formatNumber(podiumUsers[1]?.points || 11200)} XP
                  </span>
                  <span className="text-[10px] text-[#6B7280] block font-semibold">
                    Level {podiumUsers[1]?.level || 15} • 2nd Place
                  </span>
                </div>
              </div>

              {/* Stylized Rank 2 Badge */}
              <div className="w-9 h-9 rounded-xl bg-[#6366F1] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                2
              </div>
            </div>

            {/* 3rd Place Podium Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-[#F59E0B]/30 bg-gradient-to-b from-[#FFFBEB] to-white shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white border border-[#FEF3C7] flex items-center justify-center text-[#D97706] shrink-0 shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-black text-[#202124] truncate block">
                    {podiumUsers[2]?.name || "Marcus King"}
                  </span>
                  <span className="text-xs font-black font-mono text-[#D97706]">
                    {formatNumber(podiumUsers[2]?.points || 9450)} XP
                  </span>
                  <span className="text-[10px] text-[#6B7280] block font-semibold">
                    Level {podiumUsers[2]?.level || 12} • 3rd Place
                  </span>
                </div>
              </div>

              {/* Stylized Rank 3 Badge */}
              <div className="w-9 h-9 rounded-xl bg-[#D97706] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                3
              </div>
            </div>

          </div>
        </section>

        {/* ROW 3: QUICK GAMES SECTION (6 Vertical Artwork Cards) */}
        <section className="w-full rounded-2xl sm:rounded-3xl bg-white border border-[#E8E8E5] p-4 sm:p-5 shadow-2xs space-y-4">
          
          {/* Section Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] flex items-center gap-1.5 text-xs font-black text-[#202124]">
                <Gamepad2 className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Quick Games</span>
              </div>
              <span className="text-xs text-[#6B7280] hidden sm:inline">
                Instant play in under 90 seconds
              </span>
            </div>

            <Link
              href="/explore"
              className="text-xs font-bold text-[#F97316] hover:text-[#EA580C] px-3 py-1.5 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] transition-colors flex items-center gap-1"
            >
              <span>See All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 6 Quick Game Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
            {quickGames.map((game) => (
              <Link
                key={game.slug}
                href={`/play/${game.slug}`}
                onClick={() => sound.playClick()}
                className="group rounded-2xl border border-[#E8E8E5] bg-[#F7F7F5] p-2.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:border-[#F97316] hover:shadow-xs aspect-[3/4] relative overflow-hidden"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/90 text-[#F97316] border border-[#E8E8E5] shadow-2xs">
                    {game.tag}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-2.5 h-2.5 fill-[#F97316] text-[#F97316]" />
                  </div>
                </div>

                {/* Center Artwork Thumbnail */}
                <div className="flex-1 flex items-center justify-center p-2 relative">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Bottom Plate */}
                <div className="w-full bg-white rounded-xl border border-[#E8E8E5] p-2 text-center relative z-10 group-hover:border-[#F97316]/40 transition-colors">
                  <span className="text-xs font-black text-[#202124] truncate block">
                    {game.title}
                  </span>
                  <span className="text-[10px] text-[#6B7280] font-semibold block">
                    {game.category} • {game.players}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ROW 4: ALL GAMES EXPLORER (With real-time search and filter chips) */}
        <section className="w-full rounded-2xl sm:rounded-3xl bg-white border border-[#E8E8E5] p-4 sm:p-5 shadow-2xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#202124]">
                All Bored Games & Activities ({filteredActivities.length})
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Browse our collection of micro-games and casual entertainment
              </p>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full pl-8 pr-3 py-2 text-xs font-semibold rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] text-[#202124] focus:outline-none focus:border-[#F97316] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Grid of All Games */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredActivities.map((act) => {
              const isFav = favorites.includes(act.slug);
              return (
                <ActivityCard
                  key={act.id}
                  activity={act}
                  isFavorite={isFav}
                  onFavoriteToggle={(slug, e) => toggleFavorite(slug, e)}
                />
              );
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12 text-[#6B7280] space-y-2">
              <p className="font-bold text-sm">No games found matching your search</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-xs font-bold text-[#F97316] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}

        </section>

      </main>

    </div>
  );
}
