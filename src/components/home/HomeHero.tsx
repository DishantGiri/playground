"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Play, Gamepad2 } from "lucide-react";

export function HomeHero() {
  const [lastPlayed, setLastPlayed] = useState<{ slug: string; title: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bored_last_game");
        if (saved) {
          setLastPlayed(JSON.parse(saved));
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const scrollToGames = () => {
    const searchEl = document.getElementById("home-game-search");
    if (searchEl) {
      searchEl.focus();
      searchEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-5 sm:p-7 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Column - Content */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#F97316]" />
            <span>Instant mini-games & brain breaks</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#202124] tracking-tight leading-tight">
            A little play goes a long way<span className="text-[#F97316]">.</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-xl">
            Quick games, clever puzzles, and tiny breaks that make your day better. No downloads, zero fuss — jump right in.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={scrollToGames}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#F97316] hover:bg-[#EA580C] active:scale-95 transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Explore games</span>
            </button>

            {lastPlayed ? (
              <Link
                href={`/play/${lastPlayed.slug}`}
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#202124] bg-[#F0F0ED] hover:bg-[#E8E8E5] border border-[#E8E8E5] transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-[#202124]" />
                <span>Continue: {lastPlayed.title}</span>
              </Link>
            ) : (
              <Link
                href="/explore"
                className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#202124] bg-white hover:bg-[#F0F0ED] border border-[#E8E8E5] transition-all flex items-center gap-1.5"
              >
                <span>Browse All</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#6B7280]" />
              </Link>
            )}
          </div>
        </div>

        {/* Right Column - Compact Soft Play Mascot Badge */}
        <div className="hidden lg:flex items-center gap-4 bg-[#F7F7F5] border border-[#E8E8E5] p-3.5 rounded-xl shrink-0">
          <div className="w-16 h-16 rounded-xl bg-white border border-[#E8E8E5] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            <img
              src="/images/hero-mascot.jpg"
              alt="Bored Mascot"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="text-left pr-2">
            <div className="text-xs font-bold text-[#202124] flex items-center gap-1">
              <span>Ready for a quick break?</span>
            </div>
            <p className="text-[11px] text-[#6B7280] mt-0.5 max-w-[150px]">
              Average game session takes only 90 seconds.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
