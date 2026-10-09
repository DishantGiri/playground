"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Gift, Play, CheckCircle2, X, Sparkles } from "lucide-react";
import { sound } from "@/lib/audio";

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (points: number) => void;
}

export function RewardedAdModal({
  isOpen,
  onClose,
  onRewardClaimed,
}: RewardedAdModalProps) {
  const [adState, setAdState] = useState<"prompt" | "playing" | "claimed">("prompt");
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adState === "playing" && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
        sound.playClick();
      }, 1000);
    } else if (adState === "playing" && countdown === 0) {
      handleCompleteAd();
    }
    return () => clearTimeout(timer);
  }, [adState, countdown]);

  if (!isOpen) return null;

  const handleStartAd = () => {
    sound.playClick();
    setCountdown(5);
    setAdState("playing");
  };

  const handleCompleteAd = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const fakeAdToken = "token_" + Math.random().toString(36).substring(2) + "_" + Date.now();

      const res = await fetch("/api/ads/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adVerificationToken: fakeAdToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to claim reward");
      }

      setAdState("claimed");
      sound.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      if (onRewardClaimed) {
        onRewardClaimed(data.pointsEarned || 50);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify ad");
      setAdState("prompt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl text-center overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {adState === "prompt" && (
          <div className="space-y-4 pt-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-sm">
              <Gift className="w-8 h-8 text-amber-600 animate-bounce" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                BONUS REWARD
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                Boost Your Activity XP!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Watch a short 5-second entertainment preview to receive{" "}
                <span className="text-amber-700 font-bold">+50 Bonus XP</span>.
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 bg-rose-50 py-1.5 px-3 rounded-lg border border-rose-200">
                {errorMsg}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleStartAd}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>WATCH AD (+50 XP)</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                NO THANKS
              </button>
            </div>
          </div>
        )}

        {adState === "playing" && (
          <div className="space-y-5 py-4">
            <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 rounded text-[10px] font-mono font-bold text-amber-400">
                Reward in: {countdown}s
              </div>
              <Sparkles className="w-10 h-10 text-violet-400 animate-pulse mb-2" />
              <p className="text-xs font-bold text-white">StreamPass Gaming Pass</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Over 200 instant indie games</p>
            </div>

            <p className="text-xs text-slate-500">
              Please watch until the countdown finishes to claim your reward...
            </p>

            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {adState === "claimed" && (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Reward Claimed!</h3>
              <p className="text-sm font-bold text-emerald-600 mt-1">+50 XP Added to your profile</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            >
              CONTINUE
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
