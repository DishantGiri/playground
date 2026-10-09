import { Suspense } from "react";
import { Metadata } from "next";
import { MultiplayerLobby } from "@/components/multiplayer/MultiplayerLobby";
import { AdSlot } from "@/components/ads/AdSlot";
import { Swords, Smartphone, Laptop } from "lucide-react";

export const metadata: Metadata = {
  title: "Multiplayer Arena — Play From 2 Different Devices | Bored?",
  description:
    "Challenge friends across 2 different devices in real-time games. Play Connect 4, Memory Duel, Number Guess Duel, and Reflex Tap Duel with instant room codes.",
};

export default function MultiplayerPage() {
  return (
    <div className="w-full min-w-0 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-[#E8E8E5] shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316] shrink-0">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] px-2 py-0.5 rounded-lg border border-[#FFEDD5]">
                Online Multiplayer
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-lg border border-[#DCFCE7]">
                Live 2 Devices
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#202124] tracking-tight">
              2-Device Multiplayer Arena
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
              Play with a friend on another phone, tablet, or laptop using simple 4-digit room codes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] text-xs font-semibold text-[#202124]">
            <Smartphone className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Phone</span>
            <span className="text-[#9CA3AF]">vs</span>
            <Laptop className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Laptop</span>
          </div>
        </div>
      </div>

      {/* Main Lobby */}
      <Suspense fallback={<div className="text-center py-12 text-[#6B7280]">Loading Multiplayer Arena...</div>}>
        <MultiplayerLobby />
      </Suspense>

      {/* Sponsored Ad Slot */}
      <AdSlot placement="banner" />
    </div>
  );
}
