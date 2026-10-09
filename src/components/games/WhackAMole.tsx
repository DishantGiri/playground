"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Play,
  Pause,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
} from "lucide-react";
import { sound } from "@/lib/audio";

interface Props {
  activitySlug?: string;
}

interface MoleState {
  id: number;
  active: boolean;
  whacked: boolean;
  type: "normal" | "golden" | "bomb";
}

export function WhackAMole({ activitySlug = "whack-a-mole" }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // 9 holes (index 0 to 8)
  const [moles, setMoles] = useState<MoleState[]>(() =>
    Array.from({ length: 9 }, (_, id) => ({
      id,
      active: false,
      whacked: false,
      type: "normal",
    }))
  );

  const [hitEffects, setHitEffects] = useState<
    { id: number; x: number; y: number; text: string }[]
  >([]);

  // Load high score
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bored_whack_highscore");
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isPlaying || isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isPlaying, timeLeft]);

  // Mole spawner with dynamic difficulty
  useEffect(() => {
    if (!isPlaying || isPaused || timeLeft <= 0) return;

    // As time decreases from 30s to 0s, spawn interval drops from 800ms to 400ms
    const speedMultiplier = Math.max(0.4, timeLeft / 30);
    const spawnInterval = 400 + 400 * speedMultiplier;
    const hideTimeoutDuration = 600 + 350 * speedMultiplier;

    const spawnTimer = setInterval(() => {
      // Pick 1 to 2 random inactive holes
      setMoles((prevMoles) => {
        const inactiveHoles = prevMoles
          .map((m, idx) => (!m.active ? idx : null))
          .filter((idx): idx is number => idx !== null);

        if (inactiveHoles.length === 0) return prevMoles;

        const pickIdx =
          inactiveHoles[Math.floor(Math.random() * inactiveHoles.length)];

        // 15% chance golden mole (3x points), 10% chance bomb (-50 points)
        const roll = Math.random();
        const moleType: "normal" | "golden" | "bomb" =
          roll < 0.15 ? "golden" : roll < 0.25 ? "bomb" : "normal";

        const nextMoles = [...prevMoles];
        nextMoles[pickIdx] = {
          id: pickIdx,
          active: true,
          whacked: false,
          type: moleType,
        };

        // Auto hide mole after hideTimeoutDuration
        setTimeout(() => {
          setMoles((cur) => {
            const updated = [...cur];
            if (updated[pickIdx] && updated[pickIdx].active && !updated[pickIdx].whacked) {
              updated[pickIdx] = {
                ...updated[pickIdx],
                active: false,
              };
            }
            return updated;
          });
        }, hideTimeoutDuration);

        return nextMoles;
      });
    }, spawnInterval);

    return () => clearInterval(spawnTimer);
  }, [isPaused, isPlaying, timeLeft]);

  // Handle Game Over
  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    setMoles((prev) => prev.map((m) => ({ ...m, active: false })));

    setScore((finalScore) => {
      if (finalScore > highScore) {
        setHighScore(finalScore);
        try {
          localStorage.setItem("bored_whack_highscore", finalScore.toString());
        } catch {}
        confetti({ particleCount: 80, spread: 70 });
      }
      return finalScore;
    });
  }, [highScore]);

  // Start / Restart game
  const startGame = () => {
    sound.playClick();
    setTimeLeft(30);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setGameOver(false);
    setIsPaused(false);
    setMoles(
      Array.from({ length: 9 }, (_, id) => ({
        id,
        active: false,
        whacked: false,
        type: "normal",
      }))
    );
    setIsPlaying(true);
  };

  // Whack mole click
  const whackMole = (index: number, e: React.MouseEvent) => {
    const mole = moles[index];
    if (!mole.active || mole.whacked || !isPlaying || isPaused) return;

    sound.playClick();

    // Mark as whacked
    setMoles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], whacked: true };
      setTimeout(() => {
        setMoles((cur) => {
          const u = [...cur];
          u[index] = { ...u[index], active: false, whacked: false };
          return u;
        });
      }, 250);
      return updated;
    });

    const rect = e.currentTarget.getBoundingClientRect();

    if (mole.type === "bomb") {
      // Hit a bomb! Reset combo and lose points
      setCombo(0);
      setScore((s) => Math.max(0, s - 50));
      spawnHitEffect(rect.left + rect.width / 2, rect.top, "-50 💣");
    } else {
      // Hit a normal or golden mole
      const currentCombo = combo + 1;
      setCombo(currentCombo);
      if (currentCombo > maxCombo) setMaxCombo(currentCombo);

      const multiplier = Math.min(4, 1 + Math.floor(currentCombo / 5) * 0.5);
      const basePoints = mole.type === "golden" ? 60 : 20;
      const pointsWon = Math.round(basePoints * multiplier);

      setScore((s) => s + pointsWon);

      spawnHitEffect(
        rect.left + rect.width / 2,
        rect.top,
        `+${pointsWon}${multiplier > 1 ? ` (x${multiplier})` : ""}`
      );
    }
  };

  const spawnHitEffect = (x: number, y: number, text: string) => {
    const id = Date.now() + Math.random();
    setHitEffects((prev) => [...prev, { id, x, y, text }]);
    setTimeout(() => {
      setHitEffects((prev) => prev.filter((item) => item.id !== id));
    }, 700);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 select-none">
      {/* Top Telemetry Bar */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3">
        {/* Score & High Score */}
        <div>
          <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider block">
            Score
          </span>
          <div className="text-2xl font-black text-[#202124]">{score}</div>
        </div>

        {/* Combo Multiplier Meter */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase text-[#F97316] tracking-wider flex items-center gap-0.5">
            <Flame className="w-3 h-3 fill-current" /> Combo
          </span>
          <div className="text-xl font-black text-[#F97316]">
            {combo}x{" "}
            {combo >= 5 && (
              <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-md ml-1 animate-pulse">
                HOT!
              </span>
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider block">
            Time Left
          </span>
          <div
            className={`text-2xl font-black transition-colors ${
              timeLeft <= 5 ? "text-rose-600 animate-pulse" : "text-[#202124]"
            }`}
          >
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Main Whack Grid Arena */}
      <div className="w-full bg-[#E8E8E5] border-4 border-[#D1D5DB] rounded-3xl p-5 sm:p-6 shadow-inner relative flex flex-col items-center justify-center">
        {/* 3x3 Holes Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 w-full max-w-[380px] aspect-square">
          {moles.map((mole, idx) => (
            <div
              key={mole.id}
              onClick={(e) => whackMole(idx, e)}
              className="relative w-full aspect-square rounded-full bg-[#3B3A36] border-4 border-[#2B2A26] shadow-inner overflow-hidden cursor-pointer flex items-end justify-center"
            >
              {/* Hole dirt rim shadow */}
              <div className="absolute inset-x-0 bottom-0 h-4 bg-[#1F1E1B] rounded-b-full pointer-events-none" />

              {/* Animated Mole */}
              <div
                className={`w-4/5 h-4/5 rounded-t-full transition-all duration-150 flex flex-col items-center justify-center shadow-lg ${
                  mole.type === "golden"
                    ? "bg-amber-400 border-2 border-amber-300"
                    : mole.type === "bomb"
                    ? "bg-zinc-800 border-2 border-red-500"
                    : "bg-[#8D5B4C] border-2 border-[#A86B5A]"
                } ${
                  mole.active
                    ? "translate-y-0 opacity-100 scale-100"
                    : "translate-y-full opacity-0 scale-75"
                } ${mole.whacked ? "scale-90 rotate-6 brightness-125" : ""}`}
              >
                {/* Face details */}
                {mole.type === "bomb" ? (
                  <div className="text-2xl animate-bounce">💣</div>
                ) : mole.whacked ? (
                  <div className="text-xl">😵</div>
                ) : mole.type === "golden" ? (
                  <div className="flex flex-col items-center">
                    <span className="text-xs">👑</span>
                    <span className="text-sm font-black">🐹</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    </div>
                    <div className="w-2 h-1.5 rounded-full bg-rose-400 mt-0.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Start Game Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-3xl shadow-sm">
              🔨
            </div>
            <div>
              <h3 className="text-xl font-black text-[#202124]">Whack-a-Mole Mania!</h3>
              <p className="text-xs text-[#6B7280] max-w-xs mt-1">
                Tap moles before they escape! Build combo multipliers for massive XP. Watch out for bombs!
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-black text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Whacking!</span>
            </button>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316]">
              <Trophy className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-black text-[#202124]">Time&apos;s Up!</h3>
            <p className="text-sm font-bold text-[#F97316]">
              You scored {score} points with a {maxCombo}x max combo!
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
              <span>Personal Best: {highScore}</span>
            </div>

            <button
              onClick={startGame}
              className="mt-2 px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        {isPlaying && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-4 py-2 rounded-xl bg-white border border-[#E8E8E5] text-xs font-bold text-[#202124] hover:bg-[#F0F0ED] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? "Resume" : "Pause"}</span>
          </button>
        )}
        <button
          onClick={startGame}
          className="px-4 py-2 rounded-xl bg-white border border-[#E8E8E5] text-xs font-bold text-[#202124] hover:bg-[#F0F0ED] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
