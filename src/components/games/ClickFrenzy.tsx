"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  MousePointerClick,
  RotateCcw,
  ArrowRight,
  Gift,
  Trophy,
  Clock,
  Zap,
  Sparkles,
} from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import Link from "next/link";

export function ClickFrenzy({ activitySlug = "click-frenzy" }: { activitySlug?: string }) {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      finishGame();
    }
    return () => clearTimeout(timer);
  }, [isActive, timeLeft]);

  const handleClick = () => {
    if (isFinished) return;

    sound.playClick();
    if (!isActive) {
      setIsActive(true);
      setClicks(1);
      setTimeLeft(10);
      return;
    }

    setClicks((c) => c + 1);
  };

  const finishGame = async () => {
    setIsActive(false);
    setIsFinished(true);
    sound.playWin();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });

    try {
      const res = await fetch("/api/games/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activitySlug,
          score: clicks,
        }),
      });
      const data = await res.json();
      if (data.pointsEarned) setEarnedXp(data.pointsEarned);
    } catch (e) {
      console.error(e);
    }
  };

  const resetGame = () => {
    sound.playClick();
    setClicks(0);
    setTimeLeft(10);
    setIsActive(false);
    setIsFinished(false);
  };

  const cps = clicks > 0 ? (clicks / (10 - timeLeft || 1)).toFixed(1) : "0.0";

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
        <div>
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Time Left
          </span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{timeLeft}s</div>
        </div>
        <div>
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <MousePointerClick className="w-3 h-3 text-slate-400" /> Total Clicks
          </span>
          <div className="text-2xl font-black text-violet-700 mt-0.5">{clicks}</div>
        </div>
        <div>
          <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-slate-400" /> CPS Speed
          </span>
          <div className="text-2xl font-black text-amber-700 mt-0.5">{cps}</div>
        </div>
      </div>

      {/* Big Click Area */}
      <div
        onClick={handleClick}
        className={`w-full min-h-[300px] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-150 shadow-sm relative overflow-hidden ${
          isActive
            ? "bg-violet-600 text-white scale-[1.01] active:scale-98 shadow-xl shadow-violet-500/20"
            : isFinished
            ? "bg-white border-2 border-slate-200"
            : "bg-white border-2 border-slate-200 hover:border-violet-300 hover:bg-violet-50/20"
        }`}
      >
        {!isActive && !isFinished ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
              <MousePointerClick className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Click Frenzy (10s)</h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Click anywhere inside this card as fast as you can to trigger the 10-second timer!
            </p>
            <span className="inline-block px-6 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-md shadow-violet-500/20">
              Click Anywhere To Start
            </span>
          </div>
        ) : isActive ? (
          <div className="space-y-2">
            <span className="text-7xl font-black text-white tracking-tight">{clicks}</span>
            <p className="text-sm font-bold text-violet-100 uppercase tracking-widest animate-pulse">
              Click Rapidly!
            </p>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black text-slate-900">Time&apos;s Up!</h3>
            <p className="text-sm text-slate-600">
              You clicked <span className="text-violet-700 font-bold">{clicks} times</span> (
              <span className="text-amber-800 font-bold">{(clicks / 10).toFixed(1)} CPS</span>)
            </p>
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>+{earnedXp || 20} XP Earned</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <button
          onClick={() => {
            sound.playClick();
            setShowRewardedAd(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer"
        >
          <Gift className="w-3.5 h-3.5 text-amber-600" />
          <span>Claim +50 Bonus XP</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Restart</span>
          </button>

          <Link
            href="/explore"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-md shadow-violet-500/20"
          >
            <span>Explore More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onRewardClaimed={(bonus) => setEarnedXp((prev) => prev + bonus)}
      />
    </div>
  );
}
