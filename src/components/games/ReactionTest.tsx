"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Zap,
  RotateCcw,
  Trophy,
  ArrowRight,
  Gift,
  AlertCircle,
  Sparkles,
  Flame,
  Clock,
  Swords,
  User,
  Users,
  Smartphone,
} from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import { MultiplayerLobby } from "@/components/multiplayer/MultiplayerLobby";
import Link from "next/link";

type Mode = "SOLO" | "DUEL" | "ONLINE";
type State = "WAITING" | "READY" | "CLICK" | "TOO_EARLY" | "RESULT";

export function ReactionTest({ activitySlug = "reaction-test" }: { activitySlug?: string }) {
  const [mode, setMode] = useState<Mode>("SOLO");
  const [onlineInitialMode, setOnlineInitialMode] = useState<"friends" | "random">("friends");

  // Solo State
  const [gameState, setGameState] = useState<State>("WAITING");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Duel State
  const [duelRoundState, setDuelRoundState] = useState<"IDLE" | "WAITING" | "GREEN" | "ROUND_OVER" | "MATCH_OVER">("IDLE");
  const [duelScores, setDuelScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [roundWinnerMessage, setRoundWinnerMessage] = useState<string>("");
  const [p1RoundMs, setP1RoundMs] = useState<number | null>(null);
  const [p2RoundMs, setP2RoundMs] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const duelTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const duelStartTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (duelTimerRef.current) clearTimeout(duelTimerRef.current);
    };
  }, []);

  // Keyboard shortcut listener for Duel Mode ('A' for P1, 'L' for P2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== "DUEL") return;
      if (e.key === "a" || e.key === "A") {
        handleDuelTap(1);
      } else if (e.key === "l" || e.key === "L") {
        handleDuelTap(2);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, duelRoundState]);

  // Solo Round
  const startRound = () => {
    sound.playClick();
    setGameState("READY");
    setReactionTime(null);

    const randomDelay = Math.floor(Math.random() * 3000) + 1500;

    timerRef.current = setTimeout(() => {
      startTimeRef.current = Date.now();
      setGameState("CLICK");
      sound.playCorrect();
    }, randomDelay);
  };

  const handleClickScreen = () => {
    if (gameState === "WAITING") {
      startRound();
    } else if (gameState === "READY") {
      if (timerRef.current) clearTimeout(timerRef.current);
      sound.playIncorrect();
      setGameState("TOO_EARLY");
    } else if (gameState === "CLICK") {
      const timeTaken = Date.now() - startTimeRef.current;
      setReactionTime(timeTaken);
      const newAttempts = [...attempts, timeTaken];
      setAttempts(newAttempts);

      if (bestScore === null || timeTaken < bestScore) {
        setBestScore(timeTaken);
      }

      setGameState("RESULT");

      if (timeTaken <= 240) {
        sound.playWin();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } else {
        sound.playClick();
      }

      if (!submitted && newAttempts.length >= 1) {
        submitResult(timeTaken);
      }
    } else if (gameState === "TOO_EARLY" || gameState === "RESULT") {
      startRound();
    }
  };

  const restartAll = () => {
    sound.playClick();
    if (timerRef.current) clearTimeout(timerRef.current);
    setAttempts([]);
    setBestScore(null);
    setReactionTime(null);
    setGameState("WAITING");
  };

  const submitResult = async (scoreMs: number) => {
    try {
      setSubmitted(true);
      const res = await fetch("/api/games/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activitySlug,
          score: Math.max(10, 1000 - scoreMs),
          timeMs: scoreMs,
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

  // Duel Round Handlers
  const startDuelRound = () => {
    sound.playClick();
    setDuelRoundState("WAITING");
    setRoundWinnerMessage("");
    setP1RoundMs(null);
    setP2RoundMs(null);

    const randomDelay = Math.floor(Math.random() * 3000) + 1500;
    duelTimerRef.current = setTimeout(() => {
      duelStartTimeRef.current = Date.now();
      setDuelRoundState("GREEN");
      sound.playCorrect();
    }, randomDelay);
  };

  const handleDuelTap = (player: 1 | 2) => {
    if (duelRoundState === "IDLE") {
      startDuelRound();
      return;
    }

    if (duelRoundState === "WAITING") {
      // False start penalty! Opponent gets a point
      if (duelTimerRef.current) clearTimeout(duelTimerRef.current);
      sound.playIncorrect();
      const opponent = player === 1 ? 2 : 1;
      const nextScores = {
        ...duelScores,
        [opponent === 1 ? "p1" : "p2"]: duelScores[opponent === 1 ? "p1" : "p2"] + 1,
      };
      setDuelScores(nextScores);
      setRoundWinnerMessage(`Player ${player} tapped too early! +1 point to Player ${opponent}`);

      if (nextScores.p1 >= 3 || nextScores.p2 >= 3) {
        setDuelRoundState("MATCH_OVER");
        sound.playWin();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } else {
        setDuelRoundState("ROUND_OVER");
      }
      return;
    }

    if (duelRoundState === "GREEN") {
      const ms = Date.now() - duelStartTimeRef.current;
      sound.playWin();

      if (player === 1) setP1RoundMs(ms);
      else setP2RoundMs(ms);

      const nextScores = {
        ...duelScores,
        [player === 1 ? "p1" : "p2"]: duelScores[player === 1 ? "p1" : "p2"] + 1,
      };
      setDuelScores(nextScores);
      setRoundWinnerMessage(`Player ${player} wins the round in ${ms}ms!`);

      if (nextScores.p1 >= 3 || nextScores.p2 >= 3) {
        setDuelRoundState("MATCH_OVER");
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        setDuelRoundState("ROUND_OVER");
      }
    }
  };

  const resetDuelMatch = () => {
    sound.playClick();
    if (duelTimerRef.current) clearTimeout(duelTimerRef.current);
    setDuelScores({ p1: 0, p2: 0 });
    setDuelRoundState("IDLE");
    setRoundWinnerMessage("");
    setP1RoundMs(null);
    setP2RoundMs(null);
  };

  const getRank = (ms: number) => {
    if (ms < 190) {
      return {
        title: "Godlike Reflexes",
        badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
        desc: "Top 0.5% human speed! Fighter pilot level reflexes.",
        icon: <Zap className="w-5 h-5 text-purple-600 inline mr-1.5" />,
      };
    }
    if (ms < 230) {
      return {
        title: "Superhuman",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        desc: "Faster than 94% of people! Professional esports tier.",
        icon: <Flame className="w-5 h-5 text-amber-600 inline mr-1.5" />,
      };
    }
    if (ms < 280) {
      return {
        title: "Fast Reflexes",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        desc: "Above average human reaction speed (~270ms baseline).",
        icon: <Sparkles className="w-5 h-5 text-emerald-600 inline mr-1.5" />,
      };
    }
    if (ms < 350) {
      return {
        title: "Average Human",
        badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
        desc: "Solid typical human reaction speed.",
        icon: <Clock className="w-5 h-5 text-sky-600 inline mr-1.5" />,
      };
    }
    return {
      title: "Delayed Reflexes",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
      desc: "A bit slow this round! Take a deep breath and try again.",
      icon: <Clock className="w-5 h-5 text-slate-600 inline mr-1.5" />,
    };
  };

  const average =
    attempts.length > 0
      ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
      : null;

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
              Online Reflex Duel
            </span>
          </div>
          <MultiplayerLobby defaultGameType="reaction-duel" initialMode={onlineInitialMode} />
        </div>
      ) : (
        /* 2-Card Full-Width Split Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 w-full items-stretch">
          
          {/* Left Card: HUD, Modes, Scores & Reflex Stats */}
          <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 order-2 lg:order-1">
            <div className="space-y-4">
              {/* Header info */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
                    Reflex & Speed Test
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                    Reaction Speed Tap
                  </h2>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316] shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              {/* Game Mode Selector */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                  Game Mode
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setMode("SOLO");
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      mode === "SOLO"
                        ? "bg-[#EEF2FF] text-[#6366F1] border-[#C7D2FE] shadow-2xs font-black"
                        : "bg-white text-[#6B7280] border-[#E8E8E5] hover:text-[#202124] hover:bg-[#F0F0ED]"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Play Solo</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setOnlineInitialMode("friends");
                      setMode("ONLINE");
                    }}
                    className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5] hover:bg-[#FFEDD5]"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>With Friends</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setOnlineInitialMode("random");
                      setMode("ONLINE");
                    }}
                    className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7] hover:bg-[#DCFCE7]"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Random Live</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setMode("DUEL");
                      resetDuelMatch();
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      mode === "DUEL"
                        ? "bg-[#202124] text-white border-[#202124] shadow-2xs font-black"
                        : "bg-white text-[#9CA3AF] border-[#E8E8E5] hover:text-[#202124] hover:bg-[#F0F0ED]"
                    }`}
                    title="2 players share 1 screen"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>1-Device</span>
                  </button>
                </div>
              </div>

              {/* Solo HUD Stats */}
              {mode === "SOLO" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5]">
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                        Best Reflex
                      </span>
                      <div className="text-xl font-black font-mono text-[#F97316] mt-0.5">
                        {bestScore ? `${bestScore} ms` : "—"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5]">
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                        Average Reflex
                      </span>
                      <div className="text-xl font-black font-mono text-[#202124] mt-0.5">
                        {average ? `${average} ms` : "—"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5]">
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                        Total Attempts
                      </span>
                      <div className="text-xl font-black font-mono text-[#202124] mt-0.5">
                        {attempts.length}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5]">
                      <span className="text-[10px] uppercase font-bold text-[#F97316] block">
                        XP Earned
                      </span>
                      <div className="text-xl font-black font-mono text-[#F97316] mt-0.5">
                        +{earnedXp || 25} XP
                      </div>
                    </div>
                  </div>

                  {/* Rank Tier Banner */}
                  {reactionTime && gameState === "RESULT" && (
                    <div className="p-3.5 rounded-xl border border-[#E8E8E5] bg-[#F7F7F5] space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#6B7280]">
                          Your Performance Tier
                        </span>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${getRank(reactionTime).badgeColor}`}>
                          {getRank(reactionTime).icon}
                          <span>{getRank(reactionTime).title}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        {getRank(reactionTime).desc}
                      </p>
                    </div>
                  )}

                  {/* Past Attempts Strip */}
                  {attempts.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#6B7280] block">
                        Recent Taps
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {attempts.slice(-5).map((att, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-[#F0F0ED] border border-[#E8E8E5] text-xs font-mono font-bold text-[#202124]"
                          >
                            {att}ms
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Duel Mode Scoreboard */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5]">
                      <span className="text-[10px] uppercase font-bold text-[#F97316] block">
                        P1 (Left / &apos;A&apos;)
                      </span>
                      <span className="text-2xl font-black font-mono text-[#F97316]">{duelScores.p1}</span>
                      <span className="text-[9px] text-[#6B7280] block">points</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE]">
                      <span className="text-[10px] uppercase font-bold text-[#6366F1] block">
                        P2 (Right / &apos;L&apos;)
                      </span>
                      <span className="text-2xl font-black font-mono text-[#6366F1]">{duelScores.p2}</span>
                      <span className="text-[9px] text-[#6B7280] block">points</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] text-center text-xs font-semibold text-[#202124]">
                    {duelRoundState === "IDLE" && "Press Start Round or tap your side when ready!"}
                    {duelRoundState === "WAITING" && "Wait for green... Early taps award a point to opponent!"}
                    {duelRoundState === "GREEN" && "TAP AS FAST AS YOU CAN!"}
                    {duelRoundState === "ROUND_OVER" && roundWinnerMessage}
                    {duelRoundState === "MATCH_OVER" && (
                      <span className="text-sm font-black text-[#16A34A]">
                        Player {duelScores.p1 >= 3 ? "1" : "2"} Wins the Match!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Footer */}
            <div className="space-y-2 pt-2 border-t border-[#E8E8E5]">
              <div className="flex items-center gap-2">
                {mode === "SOLO" ? (
                  <button
                    onClick={restartAll}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#202124] border border-[#E8E8E5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>Reset All</span>
                  </button>
                ) : (
                  <>
                    {duelRoundState === "MATCH_OVER" ? (
                      <button
                        onClick={resetDuelMatch}
                        className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs cursor-pointer"
                      >
                        New Match
                      </button>
                    ) : (
                      <button
                        onClick={startDuelRound}
                        disabled={duelRoundState === "WAITING" || duelRoundState === "GREEN"}
                        className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white disabled:opacity-50 shadow-xs cursor-pointer"
                      >
                        Start Round
                      </button>
                    )}
                    <button
                      onClick={resetDuelMatch}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#202124] border border-[#E8E8E5] cursor-pointer"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>

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

          {/* Right Card: Reflex Tap Arena (Full Width of Right Panel) */}
          <div className="rounded-2xl border border-[#E8E8E5] bg-white p-3 sm:p-5 shadow-xs flex flex-col items-center justify-center min-h-[440px] order-1 lg:order-2">
            {mode === "SOLO" ? (
              <div
                onClick={handleClickScreen}
                className={`w-full h-full min-h-[380px] rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none relative overflow-hidden ${
                  gameState === "READY"
                    ? "bg-[#FEF2F2] border-4 border-[#EF4444]"
                    : gameState === "CLICK"
                    ? "bg-[#16A34A] border-4 border-[#86EFAC] text-white scale-[1.01]"
                    : gameState === "TOO_EARLY"
                    ? "bg-[#FFFBEB] border-2 border-[#F59E0B]"
                    : gameState === "RESULT"
                    ? "bg-[#F7F7F5] border-2 border-[#E8E8E5]"
                    : "bg-[#F7F7F5] border-2 border-dashed border-[#E8E8E5] hover:border-[#F97316]"
                }`}
              >
                {gameState === "WAITING" && (
                  <div className="space-y-4 max-w-sm">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316]">
                      <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#202124]">
                      Ready to Test Reflexes?
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6B7280]">
                      Click anywhere inside this card. When it flashes{" "}
                      <span className="text-[#16A34A] font-bold">GREEN</span>, tap immediately!
                    </p>
                    <div className="pt-2">
                      <span className="px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-black text-xs shadow-xs inline-block">
                        Tap Anywhere To Begin
                      </span>
                    </div>
                  </div>
                )}

                {gameState === "READY" && (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#FEE2E2] border border-[#FCA5A5] flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#EF4444] animate-ping" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#DC2626] uppercase tracking-wider">
                      Wait For Green...
                    </h3>
                    <p className="text-xs text-[#DC2626] font-semibold">Do not click yet</p>
                  </div>
                )}

                {gameState === "CLICK" && (
                  <div className="space-y-2">
                    <h3 className="text-5xl sm:text-7xl font-black text-white tracking-tight uppercase animate-pulse">
                      CLICK NOW!
                    </h3>
                  </div>
                )}

                {gameState === "TOO_EARLY" && (
                  <div className="space-y-3 max-w-xs">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center border border-[#FDE68A]">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-black text-[#B45309]">Too Early!</h3>
                    <p className="text-xs text-[#6B7280]">
                      You tapped before the screen turned green.
                    </p>
                    <p className="text-xs font-bold text-[#F97316] pt-1">Click to try again</p>
                  </div>
                )}

                {gameState === "RESULT" && reactionTime && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-6xl sm:text-7xl font-black tracking-tight text-[#202124] font-mono">
                      {reactionTime} <span className="text-2xl text-[#F97316] font-sans">ms</span>
                    </div>

                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-[#E8E8E5] bg-white shadow-2xs">
                      {getRank(reactionTime).icon}
                      <span>{getRank(reactionTime).title}</span>
                    </div>

                    <p className="text-xs font-semibold text-[#6B7280]">
                      Click anywhere inside to record another attempt
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Duel Split Screen */
              <div className="grid grid-cols-2 gap-3 w-full h-full min-h-[380px]">
                <div
                  onClick={() => handleDuelTap(1)}
                  className={`rounded-xl sm:rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 ${
                    duelRoundState === "GREEN"
                      ? "bg-[#16A34A] text-white border-[#86EFAC] animate-pulse"
                      : duelRoundState === "WAITING"
                      ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]"
                      : "bg-[#FFF7ED] border-[#FFEDD5] hover:bg-[#FFEDD5] text-[#C2410C]"
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider block">Player 1</span>
                  <span className="text-3xl font-black mt-2">TAP HERE</span>
                  <span className="text-[11px] opacity-75 block mt-1">or press &apos;A&apos;</span>
                  {p1RoundMs && (
                    <span className="text-base font-bold font-mono mt-2 block">
                      {p1RoundMs} ms
                    </span>
                  )}
                </div>

                <div
                  onClick={() => handleDuelTap(2)}
                  className={`rounded-xl sm:rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 ${
                    duelRoundState === "GREEN"
                      ? "bg-[#16A34A] text-white border-[#86EFAC] animate-pulse"
                      : duelRoundState === "WAITING"
                      ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]"
                      : "bg-[#EEF2FF] border-[#C7D2FE] hover:bg-[#E0E7FF] text-[#4338CA]"
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider block">Player 2</span>
                  <span className="text-3xl font-black mt-2">TAP HERE</span>
                  <span className="text-[11px] opacity-75 block mt-1">or press &apos;L&apos;</span>
                  {p2RoundMs && (
                    <span className="text-base font-bold font-mono mt-2 block">
                      {p2RoundMs} ms
                    </span>
                  )}
                </div>
              </div>
            )}
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
