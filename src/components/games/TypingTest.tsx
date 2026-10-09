"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Keyboard, RotateCcw, ArrowRight, Gift, Trophy, Zap, RefreshCw, Sparkles } from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import Link from "next/link";

const SENTENCES_POOL = [
  "The quick brown fox jumps over the lazy dog and cures digital boredom in seconds.",
  "Never underestimate the power of five minutes of pure fun to reboot your creative mind.",
  "Deep space travels at the speed of light while galaxies spin in harmonious cosmic dance.",
  "When life gives you a blank screen, fill it with pixels, music, jokes, and interactive games.",
  "Curiosity is the engine of achievement and the ultimate cure for an idle afternoon.",
  "Programming is the closest thing to magic where writing words can bring ideas to life.",
  "Focus on the present moment because every single second is a chance to discover something extraordinary.",
  "Laughter releases endorphins that reduce stress and elevate your mental clarity within minutes.",
];

export function TypingTest({ activitySlug = "typing-test" }: { activitySlug?: string }) {
  const [targetText, setTargetText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initRound();
  }, []);

  // Keyboard shortcut: Press Escape to instant restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        initRound();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [usedIndices]);

  const initRound = () => {
    sound.playClick();
    // Pick an unused sentence so user never gets repeated text
    let availableIndices = SENTENCES_POOL.map((_, i) => i).filter(
      (i) => !usedIndices.includes(i)
    );
    if (availableIndices.length === 0) {
      availableIndices = SENTENCES_POOL.map((_, i) => i);
      setUsedIndices([]);
    }
    const chosenIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedIndices((prev) => [...prev, chosenIdx]);

    setTargetText(SENTENCES_POOL[chosenIdx]);
    setUserInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setIsFinished(false);

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isFinished) return;

    sound.playClick();

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setUserInput(val);

    // Calculate mistakes
    let errorCount = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== targetText[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);

    const calculatedAcc =
      val.length > 0 ? Math.max(0, Math.round(((val.length - errorCount) / val.length) * 100)) : 100;
    setAccuracy(calculatedAcc);

    // Calculate real-time WPM
    if (startTime) {
      const minutes = (Date.now() - startTime) / 60000;
      const words = val.length / 5;
      if (minutes > 0.02) {
        setWpm(Math.round(words / minutes));
      }
    }

    // Check completion
    if (val.length >= targetText.length) {
      finishTest(val, errorCount, calculatedAcc);
    }
  };

  const finishTest = async (finalInput: string, finalErrors: number, finalAcc: number) => {
    setIsFinished(true);
    const durationMin = startTime ? (Date.now() - startTime) / 60000 : 0.1;
    const finalWpm = Math.max(10, Math.round(finalInput.length / 5 / durationMin));
    setWpm(finalWpm);

    sound.playSuccess();
    if (finalAcc >= 85) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }

    try {
      const res = await fetch("/api/games/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activitySlug,
          score: finalWpm,
          wpm: finalWpm,
          accuracy: finalAcc,
        }),
      });
      const data = await res.json();
      if (data.pointsEarned) {
        setEarnedXp(data.pointsEarned);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-w-0 rounded-2xl sm:rounded-3xl border border-[#E8E8E5] bg-[#F7F7F5] p-3 sm:p-4 lg:p-5 shadow-2xs select-none text-[#202124]">
      
      {/* 2-Card Full-Width Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 w-full items-stretch">
        
        {/* Left Card: Live Metrics, Accuracy & Controls */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 order-2 lg:order-1">
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
                  Keyboard Precision
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                  Speed Typing Sprint
                </h2>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316] shrink-0">
                <Keyboard className="w-5 h-5" />
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Live Performance Metrics
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                    WPM Speed
                  </span>
                  <div className="text-2xl font-black font-mono text-[#6366F1] mt-0.5">
                    {wpm}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                    Accuracy
                  </span>
                  <div className={`text-2xl font-black font-mono mt-0.5 ${accuracy >= 90 ? "text-[#16A34A]" : "text-[#D97706]"}`}>
                    {accuracy}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                    Errors
                  </span>
                  <div className="text-2xl font-black font-mono text-[#DC2626] mt-0.5">
                    {errors}
                  </div>
                </div>
              </div>
            </div>

            {/* XP Bonus Widget */}
            <div className="p-3.5 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFEDD5] flex items-center justify-center text-[#F97316]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#202124] block">Sprint Reward</span>
                  <span className="text-[10px] text-[#6B7280]">Complete sprint to bank XP</span>
                </div>
              </div>
              <span className="text-xs font-black text-[#F97316] font-mono">
                +{earnedXp || 35} XP
              </span>
            </div>

            {/* Tips Card */}
            <div className="p-3 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] text-xs text-[#6B7280] space-y-1">
              <span className="font-bold text-[#202124] block">Pro Tip:</span>
              <p>Keep your gaze on the upcoming word ahead rather than individual keys. Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E8E8E5] font-mono font-bold text-[10px] text-[#202124]">Esc</kbd> anytime to restart instantly.</p>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="space-y-2 pt-2 border-t border-[#E8E8E5]">
            <button
              onClick={initRound}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#202124] border border-[#E8E8E5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Restart Sprint (Esc)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowRewardedAd(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-[#C2410C] bg-[#FFF7ED] border border-[#FFEDD5] hover:bg-[#FFEDD5] transition-all cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Claim +50 Bonus XP</span>
            </button>
          </div>
        </div>

        {/* Right Card: Interactive Typing Arena (Full Width of Right Panel) */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-center min-h-[440px] order-1 lg:order-2 space-y-5">
          
          {/* Target Sentence Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#F0F0ED] border border-[#E8E8E5] text-lg sm:text-xl font-mono leading-relaxed select-none min-h-[140px] flex items-center flex-wrap">
            <div>
              {targetText.split("").map((char, index) => {
                let color = "text-[#9CA3AF]";
                if (index < userInput.length) {
                  color = userInput[index] === char ? "text-[#16A34A] font-bold" : "text-[#DC2626] bg-[#FEF2F2] rounded px-0.5";
                } else if (index === userInput.length) {
                  color = "text-[#202124] underline decoration-[#F97316] decoration-2 font-bold";
                }
                return (
                  <span key={index} className={color}>
                    {char}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Input Box or Completion Banner */}
          {!isFinished ? (
            <div className="space-y-2">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type the sentence above to start sprint..."
                autoFocus
                className="w-full px-5 py-4 rounded-xl bg-[#F7F7F5] border-2 border-[#E8E8E5] text-[#202124] text-base font-mono focus:outline-none focus:border-[#F97316] focus:bg-white transition-all shadow-inner"
              />
              <span className="text-[11px] text-[#6B7280] block text-center">
                Typing begins automatically on first keystroke
              </span>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#FFF7ED] border-2 border-[#F97316]/40 text-center space-y-3 animate-in fade-in">
              <h3 className="text-2xl font-black text-[#202124]">Sprint Complete!</h3>
              <p className="text-xs text-[#6B7280]">
                You finished at <span className="text-[#F97316] font-bold text-sm">{wpm} WPM</span> with{" "}
                <span className="text-[#16A34A] font-bold text-sm">{accuracy}% accuracy</span>.
              </p>

              <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-[#FFEDD5] text-[#F97316] font-black text-sm">
                +{earnedXp || 35} XP Banked!
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={initRound}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#F97316] hover:bg-[#EA580C] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Next Sentence</span>
                </button>
              </div>
            </div>
          )}

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
