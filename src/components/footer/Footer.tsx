"use client";

import Link from "next/link";
import { Gamepad2, Shield, Compass, Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E8E8E5] bg-white text-[#6B7280] mt-16">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-[#F97316] flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-[#202124]">
                BORED<span className="text-[#F97316]">.</span>
              </span>
            </Link>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Quick games, clever puzzles, and tiny breaks that make your day better. Built for instant casual entertainment.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
              Games & Categories
            </h4>
            <ul className="space-y-1.5 text-xs text-[#6B7280]">
              <li>
                <Link href="/explore?category=GAME" className="hover:text-[#F97316] transition-colors">
                  Mini Games & Board Games
                </Link>
              </li>
              <li>
                <Link href="/explore?category=QUIZ" className="hover:text-[#F97316] transition-colors">
                  Quizzes & Brain Teasers
                </Link>
              </li>
              <li>
                <Link href="/explore?category=FUN" className="hover:text-[#F97316] transition-colors">
                  Humor & Dad Jokes
                </Link>
              </li>
              <li>
                <Link href="/explore?category=CREATIVE" className="hover:text-[#F97316] transition-colors">
                  Pixel Art & Synth Music
                </Link>
              </li>
              <li>
                <Link href="/explore?category=RANDOM" className="hover:text-[#F97316] transition-colors">
                  Shower Thoughts & Facts
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
              Features
            </h4>
            <ul className="space-y-1.5 text-xs text-[#6B7280]">
              <li>
                <Link href="/multiplayer" className="hover:text-[#F97316] transition-colors">
                  Live 2-Player Duels
                </Link>
              </li>
              <li>
                <Link href="/daily" className="hover:text-[#F97316] transition-colors">
                  Daily Challenge & Streaks
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-[#F97316] transition-colors">
                  Global Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#F97316] transition-colors">
                  XP & Achievements
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Admin */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#202124]">
              Platform
            </h4>
            <ul className="space-y-1.5 text-xs text-[#6B7280]">
              <li>
                <Link href="/admin" className="text-[#6B7280] hover:text-[#F97316] flex items-center gap-1.5 transition-colors">
                  <Shield className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Admin Panel</span>
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-[#9CA3AF]">
                  Theme: Soft Play Light
                </span>
              </li>
              <li>
                <span className="text-[11px] text-[#9CA3AF]">
                  © {new Date().getFullYear()} Bored. All rights reserved.
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom subtle divider */}
        <div className="mt-8 pt-6 border-t border-[#E8E8E5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9CA3AF]">
          <p>Handcrafted for short attention spans and genuine smiles.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-[#EF4444] fill-[#EF4444]" />
            <span>for casual gaming</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
