"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Zap,
  MessageSquare,
  Send,
  Bot,
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
  const [onlineInitialMode, setOnlineInitialMode] = useState<"friends" | "random">("friends");
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

  const [showRules, setShowRules] = useState(false);

  // In-game temporary chat state
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: "p1" | "p2" | "ai" | "system"; senderName: string; text: string; timestamp: number }[]
  >([
    {
      id: "ng_init_1",
      sender: "system",
      senderName: "Arena System",
      text: "Number Guess Duel live! Find the secret number (1–100) using hot/cold hints.",
      timestamp: Date.now(),
    },
    {
      id: "ng_init_2",
      sender: "ai",
      senderName: "Deduction Bot",
      text: "I picked a number between 1 and 100. Guess wisely! 🔢🤔",
      timestamp: Date.now() + 100,
    },
  ]);
  const [chatInputText, setChatInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const addChatMessage = useCallback(
    (text: string, sender: "p1" | "p2" = "p1") => {
      sound.playClick();
      const newMsg = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        sender,
        senderName: sender === "p1" ? "Player 1" : mode === "SOLO" ? "Deduction Bot" : "Player 2",
        text: text.slice(0, 160),
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev.slice(-30), newMsg]);

      if (mode === "SOLO" && sender === "p1") {
        setTimeout(() => {
          const botReplies = [
            "Good deduction! Check if you are warmer or colder 🔥",
            "Binary search is your best friend here! 💡",
            "Almost there! Narrow down the bounds 🎯",
            "Keep guessing! You have attempts remaining ⚡",
            "Great round! Let us see your next guess 👏",
          ];
          const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
          setChatMessages((prev) => [
            ...prev.slice(-30),
            {
              id: "msg_" + Math.random().toString(36).substring(2, 9),
              sender: "ai",
              senderName: "Deduction Bot",
              text: randomReply,
              timestamp: Date.now(),
            },
          ]);
          sound.playTurnChime();
        }, 600);
      }
    },
    [mode]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);


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

  if (mode === "ONLINE") {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#E8E8E5]">
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
        <MultiplayerLobby defaultGameType="number-guess" initialMode={onlineInitialMode} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 select-none text-[#202124]">
      {/* 1. TOP HEADER BAR: "leavel and other" */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs space-y-3">
        {/* Row 1: Mode Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              sound.playClick();
              setMode("SOLO");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === "SOLO"
                ? "bg-[#6366F1] text-white shadow-xs"
                : "bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124]"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Play with AI</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setOnlineInitialMode("friends");
              setMode("ONLINE");
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-[#FFF7ED] text-[#F97316] hover:bg-[#FFEDD5] border border-[#FFEDD5] cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Play with Friends</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setOnlineInitialMode("random");
              setMode("ONLINE");
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7] border border-[#DCFCE7] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Play with Random Live</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMode("DUEL");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              mode === "DUEL"
                ? "bg-[#202124] text-white shadow-xs"
                : "text-[#9CA3AF] hover:text-[#4B5563]"
            }`}
            title="Pass & play on same screen"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>1-Device</span>
          </button>
        </div>

        {/* Row 2: Difficulty on Left, Restart & Rules on Right */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F0F0ED] p-1 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
            {(["EASY", "NORMAL", "HARD"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  sound.playClick();
                  setDifficulty(d);
                }}
                className={`px-3 py-1 rounded-lg capitalize transition-all shrink-0 cursor-pointer ${
                  difficulty === d
                    ? "bg-white text-[#202124] shadow-xs"
                    : "text-[#6B7280] hover:text-[#202124]"
                }`}
              >
                {DIFFICULTY_CONFIG[d].label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={initGame}
              className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] hover:bg-[#E8E8E5] transition-colors cursor-pointer"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowRules(!showRules)}
              className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] hover:bg-[#E8E8E5] transition-colors cursor-pointer"
              title="How to play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rules Banner (Collapsible) */}
      {showRules && (
        <div className="w-full bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl p-4 text-xs text-[#202124] space-y-1.5 animate-in fade-in">
          <h4 className="font-black text-sm text-[#F97316] flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Rules of Number Guess Duel:
          </h4>
          <p>1. A secret target number between 1 and 100 has been picked.</p>
          <p>2. Enter your guess to receive warm/cold proximity and higher/lower guidance.</p>
          <p>3. In 2-Player mode, take turns guessing. Whoever finds the exact number first wins!</p>
        </div>
      )}

      {/* 2. MAIN 3-COLUMN ARENA: [game] | [game details] | [chat] */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* COLUMN 1: "game" (Left / Largest) */}
        <div className="lg:col-span-6 bg-white border border-[#E8E8E5] rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between relative min-h-[480px]">
          {/* Header info */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#F0F0ED]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-[#202124] uppercase tracking-wider">
                Deduction Arena (1 – 100)
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#6366F1] bg-[#EEF2FF] px-2 py-0.5 rounded-lg border border-[#C7D2FE]">
              {remainingAttempts} attempts left
            </span>
          </div>

          {/* Interactive Guessing Center */}
          <div className="flex-1 flex flex-col items-center justify-center my-3 w-full">
            <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center space-y-4">
              
              {/* Feedback Prompt Banner */}
              <div
                className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
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

              {/* Input Form or Victory Overlay */}
              {!isWon && !isGameOver ? (
                <form onSubmit={handleGuess} className="w-full space-y-3.5">
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="1 – 100"
                      autoFocus
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#F7F7F5] border-2 border-[#E8E8E5] text-[#202124] text-center font-black text-2xl sm:text-3xl focus:outline-none focus:border-[#F97316] focus:bg-white transition-all font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#F97316] hover:bg-[#EA580C] active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
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
                <div className="space-y-3 w-full animate-in fade-in zoom-in-95">
                  <div className="p-4 rounded-2xl bg-[#FFF7ED] border-2 border-[#F97316]/40 text-center space-y-1.5">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-[#FFEDD5] flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-[#F97316]" />
                    </div>
                    <h3 className="text-lg font-black text-[#202124]">
                      {mode === "DUEL"
                        ? `Player ${winner} Won the Duel! 🏆`
                        : `Bullseye! You Found ${targetNumber}! 🏆`}
                    </h3>
                    <p className="text-xs text-[#16A34A] font-bold">
                      +{earnedXp || 25} XP awarded to your balance!
                    </p>
                  </div>

                  <button
                    onClick={initGame}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#F97316] text-white hover:bg-[#EA580C] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Play Another Round</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 w-full animate-in fade-in zoom-in-95">
                  <div className="p-4 rounded-2xl bg-[#FEF2F2] border-2 border-[#DC2626]/30 text-center space-y-1.5">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-[#FEE2E2] flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-[#DC2626]" />
                    </div>
                    <h3 className="text-lg font-black text-[#202124]">Out of Attempts!</h3>
                    <p className="text-xs text-[#6B7280]">
                      The secret number was <span className="font-mono font-bold text-[#DC2626] text-sm">{targetNumber}</span>.
                    </p>
                  </div>

                  <button
                    onClick={initGame}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#202124] text-white hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-[11px] text-[#9CA3AF] pt-2 border-t border-[#F0F0ED]">
            Enter guesses and follow hints to narrow down the secret number.
          </div>
        </div>

        {/* COLUMN 2: "game details" (Middle) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3">
          {/* Player 1 Scorecard */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              activePlayer === 1 && !isWon && !isGameOver
                ? "bg-[#EEF2FF] border-[#6366F1] shadow-xs ring-2 ring-[#6366F1]/30"
                : "bg-white border-[#E8E8E5]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#6366F1] text-white font-black flex items-center justify-center text-xs shadow-xs">
                P1
              </div>
              <div>
                <span className="text-xs font-bold text-[#202124] block">
                  {mode === "SOLO" ? "Player 1" : "Player 1"}
                </span>
                <span className="text-[10px] text-[#6366F1] font-semibold flex items-center gap-1">
                  {mode === "SOLO" ? `${currentAttempts} attempts made` : activePlayer === 1 ? "Your Turn" : "Waiting"}
                </span>
              </div>
            </div>
            <div className="text-2xl font-black text-[#6366F1]">
              {mode === "DUEL" ? duelScores.p1 : currentAttempts}
            </div>
          </div>

          {/* Player 2 / Bot Scorecard */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              activePlayer === 2 && !isWon && !isGameOver
                ? "bg-[#FFF7ED] border-[#F97316] shadow-xs ring-2 ring-[#F97316]/30"
                : "bg-white border-[#E8E8E5]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F97316] text-white font-black flex items-center justify-center text-xs shadow-xs">
                {mode === "SOLO" ? "AI" : "P2"}
              </div>
              <div>
                <span className="text-xs font-bold text-[#202124] block">
                  {mode === "SOLO" ? "Deduction Bot" : "Player 2"}
                </span>
                <span className="text-[10px] text-[#F97316] font-semibold flex items-center gap-1">
                  {mode === "SOLO" ? "Range: 1 – 100" : activePlayer === 2 ? "Your Turn" : "Waiting"}
                </span>
              </div>
            </div>
            <div className="text-2xl font-black text-[#F97316]">
              {mode === "DUEL" ? duelScores.p2 : remainingAttempts}
            </div>
          </div>

          {/* Turn Status Banner */}
          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              isWon
                ? "bg-[#F0FDF4] border-[#86EFAC] text-[#16A34A]"
                : isGameOver
                ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]"
                : activePlayer === 1
                ? "bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5]"
                : "bg-[#FFF7ED] border-[#FFEDD5] text-[#C2410C]"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
              Current Directive
            </span>
            <span className="text-xs font-black">
              {isWon
                ? "Target Discovered! 🎯"
                : isGameOver
                ? "Round Ended"
                : mode === "DUEL"
                ? `🎯 Player ${activePlayer}'s Turn`
                : "🎯 Enter your best guess"}
            </span>
          </div>

          {/* History List Card */}
          <div className="bg-white border border-[#E8E8E5] rounded-2xl p-4 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#202124]">Previous Guesses</span>
                <span className="text-xs font-mono font-bold text-[#6B7280]">
                  {history.length} attempts
                </span>
              </div>

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

            <div className="space-y-1.5 pt-2 border-t border-[#F0F0ED]">
              <button
                onClick={initGame}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#F7F7F5] hover:bg-[#EEF2FF] hover:text-[#6366F1] text-[#202124] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Secret Number</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setShowRewardedAd(true);
                }}
                className="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold text-[#C2410C] bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FFEDD5] transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Gift className="w-3 h-3 text-[#F97316]" />
                <span>Claim +50 XP</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: "chat" (Right) */}
        <div className="lg:col-span-3 bg-white border border-[#E8E8E5] rounded-3xl p-3 sm:p-4 shadow-xs flex flex-col justify-between min-h-[480px]">
          {/* Chat Header */}
          <div className="pb-2.5 border-b border-[#E8E8E5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-[#202124] block uppercase tracking-wider">
                  In-Game Chat
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  ● Temporary Session
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[#9CA3AF] font-semibold">
              {chatMessages.length} msgs
            </span>
          </div>

          {/* Messages List Area */}
          <div className="my-2.5 flex-1 max-h-[260px] overflow-y-auto space-y-2 p-2 bg-[#F7F7F5] rounded-2xl scrollbar-none">
            {chatMessages.map((msg) => {
              const isP1 = msg.sender === "p1";
              const isSystem = msg.sender === "system";
              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center my-1">
                    <span className="text-[10px] font-semibold bg-[#E8E8E5] text-[#4B5563] px-2 py-0.5 rounded-full">
                      {msg.text}
                    </span>
                  </div>
                );
              }
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isP1 ? "items-end" : "items-start"}`}
                >
                  <span className="text-[9px] font-bold text-[#9CA3AF] px-1 mb-0.5">
                    {msg.senderName}
                  </span>
                  <div
                    className={`max-w-[88%] text-xs px-3 py-1.5 rounded-2xl leading-relaxed shadow-2xs font-semibold ${
                      isP1
                        ? "bg-[#6366F1] text-white rounded-br-xs"
                        : "bg-white text-[#202124] border border-[#E8E8E5] rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Reaction Emojis & Taunts */}
          <div className="space-y-2 pt-1 border-t border-[#E8E8E5]">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {["👏", "🔥", "😂", "😎", "🤯", "🎉", "💀", "🚀"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addChatMessage(emoji, "p1")}
                  className="w-7 h-7 rounded-lg hover:bg-[#F0F0ED] text-sm flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {["Warmer! 🔥", "Higher? 📈", "Lower? 📉", "Bullseye! 🎯"].map((taunt) => (
                <button
                  key={taunt}
                  type="button"
                  onClick={() => addChatMessage(taunt, "p1")}
                  className="px-2 py-0.5 rounded-lg bg-[#F7F7F5] hover:bg-[#EEF2FF] hover:text-[#6366F1] text-[#4B5563] text-[10px] font-bold shrink-0 cursor-pointer transition-all border border-[#E8E8E5]"
                >
                  {taunt}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatInputText.trim()) {
                  addChatMessage(chatInputText.trim(), "p1");
                  setChatInputText("");
                }
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                maxLength={120}
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-xs py-1.5 px-3 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#6366F1] focus:bg-white focus:outline-hidden text-[#202124]"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="p-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white disabled:opacity-40 transition-colors cursor-pointer"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
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
