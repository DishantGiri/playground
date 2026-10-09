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
  MessageSquare,
  Send,
  Bot,
  HelpCircle,
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
  const [showRules, setShowRules] = useState(false);

  // In-game ephemeral chat (100% temporary, in-memory)
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: "p1" | "p2" | "ai" | "system"; senderName: string; text: string; timestamp: number }[]
  >([
    {
      id: "rt_init_1",
      sender: "system",
      senderName: "Reflex Arena",
      text: "Reflex duel ready! Wait for the card to turn green, then tap immediately.",
      timestamp: Date.now(),
    },
    {
      id: "rt_init_2",
      sender: "ai",
      senderName: "Reflex Bot",
      text: "Think you can beat 200ms? Good luck! ⚡",
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
        senderName: sender === "p1" ? "Player 1" : mode === "SOLO" ? "Reflex Bot" : "Player 2",
        text: text.slice(0, 160),
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev.slice(-30), newMsg]);

      if (mode === "SOLO" && sender === "p1") {
        setTimeout(() => {
          const botReplies = [
            "Nice tap! Can you beat 200ms? ⚡",
            "Fighter pilots react in under 190ms! ✈️",
            "Watch out for the green flash! 🟢",
            "Patience is key — don't jump the gun! ⏱️",
            "Solid reflex! Try another attempt 🔥",
            "Keep your finger hovering close to the screen! 🎯",
          ];
          const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
          setChatMessages((prev) => [
            ...prev.slice(-30),
            {
              id: "msg_" + Math.random().toString(36).substring(2, 9),
              sender: "ai",
              senderName: "Reflex Bot",
              text: randomReply,
              timestamp: Date.now(),
            },
          ]);
          sound.playTurnChime();
        }, 500);
      }
    },
    [mode]
  );

  useEffect(() => {
    if (chatEndRef.current?.parentElement) {
      chatEndRef.current.parentElement.scrollTop = chatEndRef.current.parentElement.scrollHeight;
    }
  }, [chatMessages]);

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
    <div className="w-full max-w-6xl mx-auto space-y-4 select-none text-[#202124]">
      {mode === "ONLINE" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#E8E8E5] shadow-2xs">
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
        <>
          {/* 1. TOP HEADER BAR: "level and other" */}
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
                <User className="w-3.5 h-3.5" />
                <span>Play Solo</span>
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
                  resetDuelMatch();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  mode === "DUEL"
                    ? "bg-[#202124] text-white shadow-xs"
                    : "text-[#9CA3AF] hover:text-[#4B5563]"
                }`}
                title="Pass & play on same device"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>1-Device</span>
              </button>
            </div>

            {/* Row 2: Mode Info on Left, Restart / Rules on Right */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-[#F0F0ED] px-3 py-1.5 rounded-xl text-xs font-bold text-[#6B7280]">
                {mode === "SOLO" ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                    <span>Single Player Reflex Speedrun</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                    <span>Same Device Duel — First to 3 Points</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (mode === "SOLO") restartAll();
                    else resetDuelMatch();
                  }}
                  className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] hover:bg-[#E8E8E5] transition-colors cursor-pointer"
                  title="Reset Game"
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
                <Zap className="w-4 h-4" /> Rules of Reaction Test:
              </h4>
              <p>1. In Solo Mode: Click the card to begin. Wait for it to turn <strong>GREEN</strong>, then tap as fast as humanly possible.</p>
              <p>2. Don&apos;t tap early! Tapping before the green flash results in a false start penalty.</p>
              <p>3. In 1-Device Duel: Player 1 taps left or presses &apos;A&apos;. Player 2 taps right or presses &apos;L&apos;. First to 3 round points wins!</p>
            </div>
          )}

          {/* 2. MAIN ARENA (3-COLUMN LAYOUT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* COLUMN 1: [game] (lg:col-span-6) */}
            <div className="lg:col-span-6 bg-white border border-[#E8E8E5] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col items-center justify-center min-h-[460px]">
              {mode === "SOLO" ? (
                <div
                  onClick={handleClickScreen}
                  className={`w-full h-full min-h-[400px] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none relative overflow-hidden ${
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
                <div className="w-full flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3 w-full min-h-[340px]">
                    <div
                      onClick={() => handleDuelTap(1)}
                      className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 ${
                        duelRoundState === "GREEN"
                          ? "bg-[#16A34A] text-white border-[#86EFAC] animate-pulse"
                          : duelRoundState === "WAITING"
                          ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]"
                          : "bg-[#FFF7ED] border-[#FFEDD5] hover:bg-[#FFEDD5] text-[#C2410C]"
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider block">Player 1</span>
                      <span className="text-2xl sm:text-3xl font-black mt-2">TAP HERE</span>
                      <span className="text-[11px] opacity-75 block mt-1">or press &apos;A&apos;</span>
                      {p1RoundMs && (
                        <span className="text-base font-bold font-mono mt-2 block">
                          {p1RoundMs} ms
                        </span>
                      )}
                    </div>

                    <div
                      onClick={() => handleDuelTap(2)}
                      className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 ${
                        duelRoundState === "GREEN"
                          ? "bg-[#16A34A] text-white border-[#86EFAC] animate-pulse"
                          : duelRoundState === "WAITING"
                          ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#DC2626]"
                          : "bg-[#EEF2FF] border-[#C7D2FE] hover:bg-[#E0E7FF] text-[#4338CA]"
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider block">Player 2</span>
                      <span className="text-2xl sm:text-3xl font-black mt-2">TAP HERE</span>
                      <span className="text-[11px] opacity-75 block mt-1">or press &apos;L&apos;</span>
                      {p2RoundMs && (
                        <span className="text-base font-bold font-mono mt-2 block">
                          {p2RoundMs} ms
                        </span>
                      )}
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

            {/* COLUMN 2: [game details] (lg:col-span-3) */}
            <div className="lg:col-span-3 bg-white border border-[#E8E8E5] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Game Details
                </h3>
                <span className="text-[10px] font-bold text-[#F97316] bg-[#FFF7ED] px-2 py-0.5 rounded-lg border border-[#FFEDD5]">
                  {mode === "SOLO" ? "Reflex Log" : "1v1 Duel"}
                </span>
              </div>

              {mode === "SOLO" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5]">
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                        Best Reflex
                      </span>
                      <div className="text-lg font-black font-mono text-[#F97316] mt-0.5">
                        {bestScore ? `${bestScore} ms` : "—"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5]">
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                        Average
                      </span>
                      <div className="text-lg font-black font-mono text-[#202124] mt-0.5">
                        {average ? `${average} ms` : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#6B7280]">Total Attempts</span>
                    <span className="text-base font-black font-mono text-[#202124]">{attempts.length}</span>
                  </div>

                  {/* Performance Tier Banner */}
                  {reactionTime && gameState === "RESULT" && (
                    <div className="p-3 rounded-xl border border-[#E8E8E5] bg-[#F7F7F5] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#6B7280]">Tier</span>
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRank(reactionTime).badgeColor}`}>
                          {getRank(reactionTime).icon}
                          <span>{getRank(reactionTime).title}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#6B7280] leading-snug">
                        {getRank(reactionTime).desc}
                      </p>
                    </div>
                  )}

                  {/* Recent Taps */}
                  {attempts.length > 0 && (
                    <div className="space-y-1.5">
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

                  <div className="p-3 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#F97316] block">XP Progress</span>
                      <span className="text-sm font-bold text-[#202124]">Reflex Master</span>
                    </div>
                    <span className="text-base font-black font-mono text-[#F97316]">+{earnedXp || 25} XP</span>
                  </div>

                  <div className="pt-2 border-t border-[#E8E8E5] space-y-2">
                    <button
                      onClick={restartAll}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#202124] border border-[#E8E8E5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span>Reset History</span>
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
              ) : (
                /* Duel Mode Scorecard in Col 2 */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5]">
                      <span className="text-[10px] uppercase font-bold text-[#F97316] block">
                        P1 (&apos;A&apos;)
                      </span>
                      <span className="text-2xl font-black font-mono text-[#F97316]">{duelScores.p1}</span>
                      <span className="text-[9px] text-[#6B7280] block">/ 3 pts</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE]">
                      <span className="text-[10px] uppercase font-bold text-[#6366F1] block">
                        P2 (&apos;L&apos;)
                      </span>
                      <span className="text-2xl font-black font-mono text-[#6366F1]">{duelScores.p2}</span>
                      <span className="text-[9px] text-[#6B7280] block">/ 3 pts</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8E8E5] space-y-2">
                    {duelRoundState === "MATCH_OVER" ? (
                      <button
                        onClick={resetDuelMatch}
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs cursor-pointer"
                      >
                        Start New Match
                      </button>
                    ) : (
                      <button
                        onClick={startDuelRound}
                        disabled={duelRoundState === "WAITING" || duelRoundState === "GREEN"}
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-[#6366F1] hover:bg-[#4F46E5] text-white disabled:opacity-50 shadow-xs cursor-pointer"
                      >
                        Start Next Round
                      </button>
                    )}

                    <button
                      onClick={resetDuelMatch}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#202124] border border-[#E8E8E5] cursor-pointer"
                    >
                      Reset Duel
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
              )}
            </div>

            {/* COLUMN 3: [chat] (lg:col-span-3) */}
            <div className="lg:col-span-3 bg-white border border-[#E8E8E5] rounded-2xl sm:rounded-3xl p-4 shadow-xs flex flex-col h-[460px]">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E8E5]">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#6366F1]" />
                  <h3 className="text-xs font-bold text-[#202124]">Reflex Live Banter</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#16A34A] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#DCFCE7]">
                  TEMPORARY
                </span>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto py-2.5 space-y-2 pr-1 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-xl text-xs leading-snug break-words ${
                      msg.sender === "system"
                        ? "bg-[#F7F7F5] text-[#6B7280] italic text-[11px] border border-[#E8E8E5]"
                        : msg.sender === "ai"
                        ? "bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]"
                        : msg.sender === "p1"
                        ? "bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] ml-2"
                        : "bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7] ml-2"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-[10px] opacity-80">{msg.senderName}</span>
                      <span className="text-[9px] opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div>{msg.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Emojis Bar */}
              <div className="flex items-center justify-between gap-1 py-1.5 border-t border-[#E8E8E5]">
                {["⚡", "🔥", "🏆", "👏", "💨", "😱"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addChatMessage(emoji, "p1")}
                    className="p-1 rounded-lg hover:bg-[#F0F0ED] text-sm transition-transform active:scale-90 cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Quick Taunt Chips */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-[10px] font-semibold text-[#6B7280]">
                {["Too fast!", "False start!", "Rematch?", "GG!"].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => addChatMessage(chip, "p1")}
                    className="px-2 py-0.5 rounded-full bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#202124] shrink-0 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatInputText.trim()) return;
                  addChatMessage(chatInputText, "p1");
                  setChatInputText("");
                }}
                className="flex items-center gap-1.5 pt-1.5 border-t border-[#E8E8E5]"
              >
                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  placeholder="Send live banter..."
                  maxLength={140}
                  className="flex-1 bg-[#F0F0ED] border border-[#E8E8E5] rounded-xl px-2.5 py-1.5 text-xs text-[#202124] placeholder-[#9CA3AF] focus:outline-none focus:border-[#6366F1]"
                />
                <button
                  type="submit"
                  disabled={!chatInputText.trim()}
                  className="p-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        </>
      )}

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onRewardClaimed={(bonus) => setEarnedXp((prev) => prev + bonus)}
      />
    </div>
  );
}
