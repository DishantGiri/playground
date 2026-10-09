"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  Gamepad2, 
  Flame, 
  Sparkles, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck,
  Volume2,
  VolumeX,
  Search,
  ArrowLeft,
} from "lucide-react";
import { sound } from "@/lib/audio";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSurprising, setIsSurprising] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [guestXp, setGuestXp] = useState(0);
  const [guestStreak, setGuestStreak] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedXp = localStorage.getItem("bored_guest_xp");
      if (savedXp) setGuestXp(parseInt(savedXp));
      const savedStreak = localStorage.getItem("bored_guest_streak");
      if (savedStreak) setGuestStreak(parseInt(savedStreak));
    }
  }, []);

  const handleSurpriseMe = async () => {
    sound.playClick();
    try {
      setIsSurprising(true);
      const res = await fetch("/api/surprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.targetUrl) {
        router.push(data.targetUrl);
      }
    } catch (err) {
      router.push("/explore");
    } finally {
      setIsSurprising(false);
      setMobileMenuOpen(false);
    }
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    } else {
      router.push("/explore");
    }
  };

  const isGameplayPage = pathname?.startsWith("/play/") || pathname?.startsWith("/quiz/");

  const user = session?.user;
  const isAdmin = (user as any)?.role === "ADMIN";

  // Gameplay Compact Header
  if (isGameplayPage) {
    return (
      <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E8E8E5] px-3 sm:px-6 h-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Explore</span>
            <span className="sm:hidden">Exit</span>
          </Link>
          <div className="h-4 w-px bg-[#E8E8E5] hidden sm:block" />
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" aria-label="Bored Home">
            <img
              src="/logo.png"
              alt="Bored"
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] transition-colors cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label="Toggle sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#6B7280]" /> : <Volume2 className="w-4 h-4 text-[#F97316]" />}
          </button>

          {/* Quick Surprise Next */}
          <button
            onClick={handleSurpriseMe}
            disabled={isSurprising}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSurprising ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSurprising ? "Next..." : "Next Game"}</span>
          </button>
        </div>
      </header>
    );
  }

  // Full Soft Play Standard Navbar
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E8E8E5]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group py-0.5" aria-label="Bored - Play & Relax">
            <img
              src="/logo.png"
              alt="Bored - Play & Relax"
              className="h-10 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* Center / Search Input (Medium and up) */}
        <form onSubmit={handleQuickSearch} className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games, categories..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F0F0ED] border border-transparent text-xs text-[#202124] placeholder-[#6B7280] focus:bg-white focus:border-[#6366F1] focus:outline-none transition-all"
            />
          </div>
        </form>

        {/* Right: Actions, Streaks & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mobile Search Button */}
          <Link
            href="/explore"
            className="md:hidden p-2 rounded-xl text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] transition-colors"
            title="Search Games"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] transition-colors cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            aria-label="Toggle audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#6B7280]" /> : <Volume2 className="w-4 h-4 text-[#F97316]" />}
          </button>

          {/* Daily Streak */}
          <Link
            href="/daily"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] text-xs font-bold hover:bg-[#FFEDD5] transition-colors"
            title="Daily Streak"
          >
            <Flame className="w-3.5 h-3.5 text-[#F97316] fill-[#F97316]" />
            <span>{guestStreak}d</span>
          </Link>

          {/* Surprise Me CTA */}
          <button
            onClick={handleSurpriseMe}
            disabled={isSurprising}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSurprising ? "animate-spin" : ""}`} />
            <span>{isSurprising ? "Picking..." : "Surprise Me"}</span>
          </button>

          {/* User Profile / Auth */}
          {status === "authenticated" && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl bg-white border border-[#E8E8E5] hover:border-[#D1D5DB] transition-all cursor-pointer"
              >
                <img
                  src={user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id || "User"}`}
                  alt={user.name || "User"}
                  className="w-7 h-7 rounded-lg bg-[#F0F0ED] object-cover"
                />
                <span className="text-xs font-semibold text-[#202124] max-w-[85px] truncate pr-1 hidden sm:inline">
                  {user.name?.split(" ")[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#E8E8E5] shadow-lg p-1.5 z-50 text-xs animate-in fade-in"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#202124] hover:bg-[#F0F0ED] font-semibold transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#6366F1]" />
                    Profile & XP
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#C2410C] hover:bg-[#FFF7ED] font-semibold transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />
                      Admin Dashboard
                    </Link>
                  )}

                  <div className="h-px bg-[#E8E8E5] my-1" />

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#DC2626] hover:bg-[#FEF2F2] font-semibold transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#202124] hover:bg-[#F0F0ED] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C] shadow-xs transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E8E5] bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleQuickSearch} className="relative w-full">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games & quizzes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F0F0ED] border border-transparent text-xs text-[#202124] placeholder-[#6B7280] focus:bg-white focus:border-[#6366F1] focus:outline-none"
            />
          </form>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSurpriseMe}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#F97316] hover:bg-[#EA580C]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Surprise Me
            </button>
            <Link
              href="/daily"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] text-xs font-bold"
            >
              <Flame className="w-3.5 h-3.5 text-[#F97316]" />
              Daily Streak
            </Link>
          </div>

          {status !== "authenticated" && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E8E8E5]">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2 px-3 rounded-xl bg-[#F0F0ED] text-[#202124] text-xs font-bold hover:bg-[#E8E8E5] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2 px-3 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
