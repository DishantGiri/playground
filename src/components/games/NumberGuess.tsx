"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Gift,
  Flame,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Sparkles,
  Binary,
  Users,
  User,
  Swords,
  Trophy,
  AlertCircle,
  Heart,
  Smartphone,
} from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import { MultiplayerLobby } from "@/components/multiplayer/MultiplayerLobby";
import Link from "next/link";

type GameMode = "SOLO" | "DUEL" | "ONLINE";
type Difficulty = "EASY" | "NORMAL" | "HARD";

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; maxAttempts: number }> = {
  EASY: { label: "Easy (10 Attempts)", maxAttempts: 10 },
  NORMAL: { label: "Normal (7 Attempts)", maxAttempts: 7 },
  HARD: { label: "Hard (5 Attempts)", maxAttempts: 5 },
};

interface GuessRecord {
  player?: number;
  guess: number;
  hint: string;
  type: "too-high" | "too-low" | "correct";
}

export function NumberGuess({ activitySlug = "number-guess" }: { activitySlug?: string }) {
  const [mode, setMode] = useState<GameMode>("SOLO");
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");

  // Game state
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [history, setHistory] = useState<GuessRecord[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<number | null>(null); // For duel mode: 1 or 2
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [duelScores, setDuelScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });

  const [feedback, setFeedback] = useState<string>("Enter any number between 1 and 100.");
  const [feedbackType, setFeedbackType] = useState<"neutral" | "hot" | "warm" | "cold" | "win" | "loss">("neutral");
  const [earnedXp, setEarnedXp] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  const maxAttempts = mode === "SOLO" ? DIFFICULTY_CONFIG[difficulty].maxAttempts : 10; // 5 per player in duel
  const maxAttemptsPerPlayer = 5;

  const player1Attempts = history.filter((h) => h.player === 1).length;
  const player2Attempts = history.filter((h) => h.player === 2).length;
  const currentAttempts = mode === "SOLO" ? history.length : activePlayer === 1 ? player1Attempts : player2Attempts;
  const remainingAttempts = mode === "SOLO" ? Math.max(0, maxAttempts - history.length) : Math.max(0, maxAttemptsPerPlayer - currentAttempts);

  useEffect(() => {
    initGame();
  }, [mode, difficulty]);

  const initGame = () => {
    sound.playClick();
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setHistory([]);
    setIsWon(false);
    setIsGameOver(false);
    setWinner(null);
    setActivePlayer(1);
    setFeedback("Enter any number between 1 and 100.");
    setFeedbackType("neutral");
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (isWon || isGameOver) return;

    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > 100) return;

    if (history.some((h) => h.guess === num)) {
      sound.playIncorrect();
      setFeedback(`Number ${num} was already attempted! Try another.`);
      return;
    }

    const currentPlayerNum = mode === "DUEL" ? activePlayer : undefined;

    if (num === targetNumber) {
      sound.playWin();
      setIsWon(true);
      setFeedbackType("win");

      if (mode === "DUEL") {
        setWinner(activePlayer);
        setDuelScores((prev) => ({
          ...prev,
          [activePlayer === 1 ? "p1" : "p2"]: prev[activePlayer === 1 ? "p1" : "p2"] + 1,
        }));
        setFeedback(`Player ${activePlayer} nailed it! The secret number was ${num}!`);
      } else {
        setFeedback(`Spot on! The secret number was ${num}!`);
        submitScore(history.length + 1);
      }

      setHistory((prev) => [{ player: currentPlayerNum, guess: num, hint: "Correct!", type: "correct" }, ...prev]);
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } else {
      // Evaluate higher or lower
      const isTooLow = num < targetNumber;
      const diff = Math.abs(targetNumber - num);
      let hint = "";

      if (diff <= 5) {
        hint = isTooLow ? "Boiling Hot! (Go slightly higher)" : "Boiling Hot! (Go slightly lower)";
        setFeedbackType("hot");
      } else if (diff <= 15) {
        hint = isTooLow ? "Warm! (Go higher)" : "Warm! (Go lower)";
        setFeedbackType("warm");
      } else {
        hint = isTooLow ? "Too Low! (Go much higher)" : "Too High! (Go much lower)";
        setFeedbackType("cold");
      }

      sound.playClick();
      const newHistory = [
        {
          player: currentPlayerNum,
          guess: num,
          hint,
          type: isTooLow ? ("too-low" as const) : ("too-high" as const),
        },
        ...history,
      ];
      setHistory(newHistory);

      if (mode === "SOLO") {
        const nextAttemptCount = newHistory.length;
        if (nextAttemptCount >= maxAttempts) {
          // Ran out of attempts
          sound.playIncorrect();
          setIsGameOver(true);
          setFeedbackType("loss");
          setFeedback(`Game Over! You ran out of attempts. The secret number was ${targetNumber}.`);
        } else {
          setFeedback(`${hint} — ${maxAttempts - nextAttemptCount} attempts left.`);
        }
      } else {
        // Duel mode switch turns
        const nextP1 = newHistory.filter((h) => h.player === 1).length;
        const nextP2 = newHistory.filter((h) => h.player === 2).length;

        if (nextP1 >= maxAttemptsPerPlayer && nextP2 >= maxAttemptsPerPlayer) {
          // Draw / both ran out
          sound.playIncorrect();
          setIsGameOver(true);
          setFeedbackType("loss");
          setFeedback(`Duel Draw! Both players ran out of attempts. The number was ${targetNumber}.`);
        } else {
          const nextPlayer = activePlayer === 1 ? 2 : 1;
          setActivePlayer(nextPlayer);
          setFeedback(`${hint} — Player ${nextPlayer}'s Turn!`);
        }
      }
    }

    setGuess("");
  };

  const submitScore = async (attemptsCount: number) => {
    try {
      const res = await fetch("/api/games/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activitySlug,
          score: Math.max(10, 100 - attemptsCount * 10),
          moves: attemptsCount,
        }),
      });
      const data = await res.json();
      if (data.pointsEarned) {
        setEarnedXp(data.pointsEarned);
      }
    } catch (err) {
      console.error("Score submit error:", err);
    }
  };

  return (
    <div className="w-full min-w-0 rounded-2xl sm:rounded-3xl border border-[#E8E8E5] bg-[#F7F7F5] p-3 sm:p-4 lg:p-5 shadow-2xs select-none text-[#202124]">
      {mode === "ONLINE" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-[#E8E8E5]">
            <button
              onClick={() => {
                sound.playClick();
                setMode("SOLO");
              }}
              className="text-xs font-bold text-[#6B7280] hover:text-[#202124] flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to Solo / Same-Device</span>
            </button>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6366F1] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#C7D2FE]">
              Online Number Duel
            </span>
          </div>
          <MultiplayerLobby defaultGameType="number-guess" />
        </div>
      ) : (
        /* 2-Card Full-Width Split Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 w-full items-stretch">
          
          {/* Left Card: HUD, Difficulty, History & Controls */}
          <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 order-2 lg:order-1">
            <div className="space-y-4">
              {/* Header info */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
                    Deduction & Logic
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                    Number Guess Duel
                  </h2>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316] shrink-0">
                  <Binary className="w-5 h-5" />
                </div>
              </div>

              {/* Game Mode Selector */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                  Game Mode
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setMode("SOLO");
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      mode === "SOLO"
                        ? "bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5] shadow-2xs font-black"
                        : "bg-white text-[#6B7280] border-[#E8E8E5] hover:text-[#202124] hover:bg-[#F0F0ED]"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Solo</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setMode("DUEL");
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      mode === "DUEL"
                        ? "bg-[#EEF2FF] text-[#6366F1] border-[#C7D2FE] shadow-2xs font-black"
                        : "bg-white text-[#6B7280] border-[#E8E8E5] hover:text-[#202124] hover:bg-[#F0F0ED]"
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>1-Device Duel</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setMode("ONLINE");
                    }}
                    className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border bg-white text-[#6B7280] border-[#E8E8E5] hover:text-[#6366F1] hover:bg-[#EEF2FF]"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>2 Devices</span>
                  </button>
                </div>
              </div>

              {/* Difficulty (Solo) or Duel Scoreboard */}
              {mode === "SOLO" ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                      Difficulty Level
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["EASY", "NORMAL", "HARD"] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            difficulty === d
                              ? "bg-[#202124] text-white border-[#202124] shadow-xs"
                              : "bg-[#F0F0ED] text-[#6B7280] border-[#E8E8E5] hover:text-[#202124]"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attempts Remaining Bar */}
                  <div className="p-3.5 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-[#F97316]">
                        <Heart className="w-4 h-4 fill-[#F97316]" />
                        <span>ATTEMPTS REMAINING</span>
                      </span>
                      <span className={`font-mono text-sm ${remainingAttempts <= 2 ? "text-[#DC2626] animate-pulse" : "text-[#202124]"}`}>
                        {remainingAttempts} / {maxAttempts}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-[#E8E8E5]">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          remainingAttempts <= 2 ? "bg-[#DC2626]" : remainingAttempts <= 4 ? "bg-[#F59E0B]" : "bg-[#16A34A]"
                        }`}
                        style={{ width: `${(remainingAttempts / maxAttempts) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Duel Mode Scoreboard & Turn info */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5]">
                      <span className="text-[10px] uppercase font-bold text-[#F97316] block">
                        Player 1
                      </span>
                      <span className="text-2xl font-black font-mono text-[#F97316]">{duelScores.p1}</span>
                      <span className="text-[9px] text-[#6B7280] block">wins</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE]">
                      <span className="text-[10px] uppercase font-bold text-[#6366F1] block">
                        Player 2
                      </span>
                      <span className="text-2xl font-black font-mono text-[#6366F1]">{duelScores.p2}</span>
                      <span className="text-[9px] text-[#6B7280] block">wins</span>
                    </div>
                  </div>

                  {!isWon && !isGameOver && (
                    <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                      activePlayer === 1
                        ? "bg-[#FFF7ED] border-[#FFEDD5] text-[#C2410C]"
                        : "bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
                        <span>Player {activePlayer}&apos;s Turn</span>
                      </div>
                      <span>
                        Attempts Left: {maxAttemptsPerPlayer - (activePlayer === 1 ? player1Attempts : player2Attempts)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Guess History Chips */}
              {history.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                    Previous Attempts ({history.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {history.map((h, i) => (
                      <div
                        key={i}
                        className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-mono ${
                          h.type === "correct"
                            ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A] font-bold"
                            : h.player === 1
                            ? "bg-[#FFF7ED] border-[#FFEDD5] text-[#C2410C]"
                            : h.player === 2
                            ? "bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]"
                            : "bg-[#F0F0ED] border-[#E8E8E5] text-[#202124]"
                        }`}
                      >
                        {h.player && <span className="font-sans font-bold text-[9px]">P{h.player}:</span>}
                        <span className="font-black">{h.guess}</span>
                        {h.type === "too-high" && <ArrowDown className="w-3 h-3 text-[#2563EB]" />}
                        {h.type === "too-low" && <ArrowUp className="w-3 h-3 text-[#DC2626]" />}
                        <span className="text-[10px] text-[#6B7280] font-sans">({h.hint})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Footer */}
            <div className="space-y-2 pt-2 border-t border-[#E8E8E5]">
              <button
                onClick={initGame}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#202124] border border-[#E8E8E5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Restart Secret Number</span>
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

          {/* Right Card: Interactive Guessing Arena (Full Width of Right Panel) */}
          <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col items-center justify-center min-h-[440px] order-1 lg:order-2">
            
            <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-5">
              
              {/* Feedback Prompt Banner */}
              <div
                className={`w-full p-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  feedbackType === "win"
                    ? "bg-[#F0FDF4] border-[#86EFAC] text-[#16A34A]"
                    : feedbackType === "loss"
                    ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]"
                    : feedbackType === "hot"
                    ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]"
                    : feedbackType === "warm"
                    ? "bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]"
                    : feedbackType === "cold"
                    ? "bg-[#F0F9FF] border-[#BAE6FD] text-[#0284C7]"
                    : "bg-[#F7F7F5] border-[#E8E8E5] text-[#202124]"
                }`}
              >
                {feedbackType === "win" && <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />}
                {feedbackType === "loss" && <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />}
                {feedbackType === "hot" && <Flame className="w-4 h-4 text-[#DC2626] shrink-0" />}
                {feedbackType === "warm" && <Sparkles className="w-4 h-4 text-[#D97706] shrink-0" />}
                <span>{feedback}</span>
              </div>

              {/* Active Guessing Form or Win/Loss States */}
              {!isWon && !isGameOver ? (
                <form onSubmit={handleGuess} className="w-full space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="1 – 100"
                      autoFocus
                      className="w-full py-4 px-4 rounded-2xl bg-[#F7F7F5] border-2 border-[#E8E8E5] text-[#202124] text-center font-black text-2xl sm:text-3xl focus:outline-none focus:border-[#F97316] focus:bg-white transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#F97316] hover:bg-[#EA580C] active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{mode === "DUEL" ? `Submit Player ${activePlayer} Guess` : "Submit Guess"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Range shortcut chips */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[
                      { label: "1-25", val: "12" },
                      { label: "26-50", val: "37" },
                      { label: "51-75", val: "63" },
                      { label: "76-100", val: "88" },
                    ].map((chip) => (
                      <button
                        type="button"
                        key={chip.label}
                        onClick={() => setGuess(chip.val)}
                        className="py-1 px-1 rounded-lg bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#6B7280] text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </form>
              ) : isWon ? (
                <div className="space-y-4 w-full animate-in fade-in zoom-in-95">
                  <div className="p-5 rounded-2xl bg-[#FFF7ED] border-2 border-[#F97316]/40 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white border border-[#FFEDD5] flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-[#F97316]" />
                    </div>
                    <h3 className="text-xl font-black text-[#202124]">
                      {mode === "DUEL"
                        ? `Player ${winner} Won the Duel!`
                        : `Bullseye! You Found ${targetNumber}!`}
                    </h3>
                    <p className="text-xs text-[#16A34A] font-bold">
                      +{earnedXp || 25} XP awarded to your balance!
                    </p>
                  </div>

                  <button
                    onClick={initGame}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#F97316] text-white hover:bg-[#EA580C] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Play Another Round</span>
                  </button>
                </div>
              ) : (
                /* Out of Attempts */
                <div className="space-y-4 w-full animate-in fade-in zoom-in-95">
                  <div className="p-5 rounded-2xl bg-[#FEF2F2] border-2 border-[#DC2626]/30 text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-white border border-[#FEE2E2] flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-[#DC2626]" />
                    </div>
                    <h3 className="text-xl font-black text-[#202124]">Out of Attempts!</h3>
                    <p className="text-xs text-[#6B7280]">
                      The secret number was <span className="font-mono font-bold text-[#DC2626] text-sm">{targetNumber}</span>.
                    </p>
                  </div>

                  <button
                    onClick={initGame}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#202124] text-white hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onRewardClaimed={(bonus) => setEarnedXp((prev) => prev + bonus)}
      />
    </div>
  );
}
