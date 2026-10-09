"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import {
  RotateCcw,
  Clock,
  Trophy,
  ArrowRight,
  Gift,
  Star,
  Sparkles,
  CheckCircle2,
  Swords,
  Smartphone,
  Award,
  Users,
  Zap,
  MessageSquare,
  Send,
  HelpCircle,
} from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import { MultiplayerLobby } from "@/components/multiplayer/MultiplayerLobby";
import { CARD_IMAGE_ITEMS } from "@/lib/multiplayerStore";
import Link from "next/link";

type GameMode = "SOLO" | "LOCAL_2P" | "CROSS_DEVICE";

interface Card {
  id: number;
  iconKey: string;
  name: string;
  image?: string;
  matched: boolean;
  matchedBy?: 1 | 2;
}

export function MemoryGame({ activitySlug = "memory-game" }: { activitySlug?: string }) {
  const [mode, setMode] = useState<GameMode>("SOLO");
  const [onlineInitialMode, setOnlineInitialMode] = useState<"friends" | "random">("friends");
  const [showRules, setShowRules] = useState(false);

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);

  // Local 2-Player Duel State
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [p1Pairs, setP1Pairs] = useState(0);
  const [p2Pairs, setP2Pairs] = useState(0);

  // In-game temporary chat state
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: "p1" | "p2" | "ai" | "system"; senderName: string; text: string; timestamp: number }[]
  >([
    {
      id: "mem_init_1",
      sender: "system",
      senderName: "Arena System",
      text: "Card Memory Duel initialized! Find all 12 matching pairs across the 4×6 grid.",
      timestamp: Date.now(),
    },
    {
      id: "mem_init_2",
      sender: "ai",
      senderName: "Memory Bot",
      text: "Concentrate on the card positions! Can you beat my record under 20 moves? 🧠🃏",
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
        senderName: sender === "p1" ? "Player 1" : mode === "SOLO" ? "Memory Bot" : "Player 2",
        text: text.slice(0, 160),
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev.slice(-30), newMsg]);

      if (mode === "SOLO" && sender === "p1") {
        setTimeout(() => {
          const botReplies = [
            "Good memory! Remember where that duplicate was 🃏",
            "Pair found! Keep up the momentum 🔥",
            "Focus! The corners usually hold matching tokens 🧠",
            "Great round! You're beating my average pace 👏",
            "Concentration is key in memory duels! ⚡",
          ];
          const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
          setChatMessages((prev) => [
            ...prev.slice(-30),
            {
              id: "msg_" + Math.random().toString(36).substring(2, 9),
              sender: "ai",
              senderName: "Memory Bot",
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

  const initGame = useCallback(() => {
    sound.playClick();

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bored:game_reset"));
    }

    // Pick 12 random cards out of the 16 available card images
    const chosen = [...CARD_IMAGE_ITEMS].sort(() => Math.random() - 0.5).slice(0, 12);
    const deck: Card[] = [];
    let idCounter = 1;

    chosen.forEach((c) => {
      deck.push({ id: idCounter++, iconKey: c.key, name: c.name, image: c.image, matched: false });
      deck.push({ id: idCounter++, iconKey: c.key, name: c.name, image: c.image, matched: false });
    });

    // Fisher-Yates shuffle the 24 cards across the 4x6 board
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setTimeSeconds(0);
    setMatchedPairsCount(0);
    setIsGameOver(false);
    setActivePlayer(1);
    setP1Pairs(0);
    setP2Pairs(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [mode, initGame]);

  // Timer (for Solo mode)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "SOLO" && !isGameOver && cards.length > 0 && !cards.every((c) => c.matched)) {
      interval = setInterval(() => {
        setTimeSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameOver, cards, mode]);

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length >= 2 ||
      flippedIndices.includes(index) ||
      cards[index].matched ||
      isGameOver
    ) {
      return;
    }

    // Trigger game started event to collapse headers
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bored:game_started"));
    }

    sound.playFlip();

    const clickedCard = cards[index];

    if (flippedIndices.length === 0) {
      setFlippedIndices([index]);
      return;
    }

    if (flippedIndices.length === 1) {
      const firstIdx = flippedIndices[0];
      const firstCard = cards[firstIdx];
      const newFlipped = [firstIdx, index];
      setFlippedIndices(newFlipped);
      setMoves((m) => m + 1);

      if (firstCard.iconKey === clickedCard.iconKey) {
        // MATCH!
        setTimeout(() => {
          sound.playSuccess();
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === index
                ? { ...c, matched: true, matchedBy: mode === "LOCAL_2P" ? activePlayer : undefined }
                : c
            )
          );
          setFlippedIndices([]);
          setMatchedPairsCount((prev) => {
            const nextCount = prev + 1;
            if (nextCount === 12) {
              handleGameWin();
            }
            return nextCount;
          });

          if (mode === "LOCAL_2P") {
            if (activePlayer === 1) setP1Pairs((p) => p + 1);
            else setP2Pairs((p) => p + 1);
            // Player keeps turn on match
          }
        }, 320);
      } else {
        // NO MATCH: auto flip back in 850ms
        setTimeout(() => {
          sound.playIncorrect();
          setFlippedIndices([]);
          if (mode === "LOCAL_2P") {
            setActivePlayer((p) => (p === 1 ? 2 : 1));
          }
        }, 850);
      }
    }
  };

  const handleGameWin = () => {
    setIsGameOver(true);
    sound.playWin();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });

    if (mode === "SOLO") {
      fetch("/api/games/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activitySlug, score: 100 }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.pointsEarned) setEarnedXp(d.pointsEarned);
        })
        .catch(console.error);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Cross-device 2-device multiplayer mode
  if (mode === "CROSS_DEVICE") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              sound.playClick();
              setMode("SOLO");
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Switch back to Solo 4x6 Grid</span>
          </button>

          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Live 2-Device Arena
          </span>
        </div>

        <MultiplayerLobby defaultGameType="memory-duel" initialMode={onlineInitialMode} />
      </div>
    );
  }


  return (
    <div className="w-full min-w-0 rounded-2xl sm:rounded-3xl border border-[#E8E8E5] bg-[#F7F7F5] p-3 sm:p-4 lg:p-5 shadow-2xs select-none text-[#202124]">
      
      {/* 2-Card Full-Width Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 w-full items-stretch">
        
        {/* Left Card: HUD, Modes, Progress & Controls */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 order-2 lg:order-1">
          
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
                Working Memory Test
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                Card Memory Duel
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                4x6 Grid • 12 matching character pairs
              </p>
            </div>

            {/* Game Mode Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Mode
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  onClick={() => {
                    sound.playClick();
                    setMode("SOLO");
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                    mode === "SOLO"
                      ? "bg-[#EEF2FF] text-[#6366F1] border-[#C7D2FE] shadow-2xs font-black"
                      : "bg-white text-[#6B7280] border-[#E8E8E5] hover:text-[#202124] hover:bg-[#F0F0ED]"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Play Solo</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setOnlineInitialMode("friends");
                    setMode("CROSS_DEVICE");
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5] hover:bg-[#FFEDD5]"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>With Friends</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setOnlineInitialMode("random");
                    setMode("CROSS_DEVICE");
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7] hover:bg-[#DCFCE7]"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Random Live</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setMode("LOCAL_2P");
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                    mode === "LOCAL_2P"
                      ? "bg-[#202124] text-white border-[#202124] shadow-2xs font-black"
                      : "bg-white text-[#9CA3AF] border-[#E8E8E5] hover:text-[#202124]"
                  }`}
                  title="Pass & play on same screen"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>1-Device</span>
                </button>
              </div>
            </div>

            {/* Solo HUD Widgets */}
            {mode === "SOLO" ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  {/* Timer Widget */}
                  <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-[#F97316]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                        TIME
                      </div>
                      <div className="text-sm font-black font-mono text-[#202124]">
                        {formatTime(timeSeconds)}
                      </div>
                    </div>
                  </div>

                  {/* Moves Widget */}
                  <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-[#6366F1]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                        MOVES
                      </div>
                      <div className="text-sm font-black font-mono text-[#202124]">
                        {moves}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar Widget */}
                <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    <span className="flex items-center gap-1 text-[#F97316]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PAIRS FOUND</span>
                    </span>
                    <span className="text-[#202124] font-mono">
                      {matchedPairsCount} / 12
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-[#E8E8E5]">
                    <div
                      className="h-full bg-gradient-to-r from-[#F97316] to-[#6366F1] transition-all duration-300 rounded-full"
                      style={{ width: `${(matchedPairsCount / 12) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Pass & Play Duel HUD */
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    activePlayer === 1 && !isGameOver
                      ? "bg-[#FFF7ED] border-[#F97316] ring-2 ring-[#F97316]/30"
                      : "bg-[#F0F0ED] border-[#E8E8E5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#F97316]">P1 (Red)</span>
                    {activePlayer === 1 && !isGameOver && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#F97316] text-white font-bold text-[8px] uppercase">
                        TURN
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black font-mono text-[#202124] mt-1">
                    {p1Pairs} <span className="text-[10px] font-bold text-[#6B7280]">pairs</span>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border transition-all ${
                    activePlayer === 2 && !isGameOver
                      ? "bg-[#EEF2FF] border-[#6366F1] ring-2 ring-[#6366F1]/30"
                      : "bg-[#F0F0ED] border-[#E8E8E5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#6366F1]">P2 (Indigo)</span>
                    {activePlayer === 2 && !isGameOver && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#6366F1] text-white font-bold text-[8px] uppercase">
                        TURN
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black font-mono text-[#202124] mt-1">
                    {p2Pairs} <span className="text-[10px] font-bold text-[#6B7280]">pairs</span>
                  </div>
                </div>
              </div>
            )}

            {/* Game Complete Modal / Banner */}
            {isGameOver && (
              <div className="p-4 rounded-xl bg-white border-2 border-[#F97316]/40 text-center space-y-2 shadow-xs animate-in fade-in">
                <div className="w-10 h-10 mx-auto rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#F97316]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#202124]">
                    {mode === "SOLO"
                      ? "Board Cleared!"
                      : p1Pairs > p2Pairs
                      ? "Player 1 Wins!"
                      : p2Pairs > p1Pairs
                      ? "Player 2 Wins!"
                      : "Tie Match!"}
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    {mode === "SOLO"
                      ? `Completed in ${moves} moves and ${formatTime(timeSeconds)}!`
                      : `Final Score: ${p1Pairs} - ${p2Pairs}`}
                  </p>
                </div>
                <button
                  onClick={initGame}
                  className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-[#F97316] text-white hover:bg-[#EA580C] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play Again</span>
                </button>
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
              <span>Shuffle New Deck</span>
            </button>

            <button
              onClick={() => setShowRewardedAd(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-[#C2410C] bg-[#FFF7ED] border border-[#FFEDD5] hover:bg-[#FFEDD5] transition-all cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Claim +50 Bonus XP</span>
            </button>
          </div>

        </div>

        {/* Right Card: 4x6 Gaming Arena Board (Full Width of Right Panel) */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-3 sm:p-5 shadow-xs flex flex-col items-center justify-center min-h-[440px] order-1 lg:order-2">
          
          <div className="grid grid-cols-6 gap-2 sm:gap-2.5 md:gap-3 w-full">
            {cards.map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx);
              const isMatched = card.matched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  disabled={isMatched || isFlipped}
                  className="aspect-[3/4] w-full select-none relative focus:outline-hidden cursor-pointer"
                  style={{ perspective: "1000px" }}
                >
                  {/* 3D Card Flip Wrapper */}
                  <div
                    className="w-full h-full relative transition-transform duration-350 ease-out"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped || isMatched ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* Card Back (Face Down) */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl border border-[#6366F1]/30 bg-gradient-to-br from-[#6366F1] via-[#5457E5] to-[#4338CA] p-1 shadow-2xs flex items-center justify-center transition-all duration-200 overflow-hidden hover:scale-[1.03] hover:border-[#F97316]"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    >
                      <div className="w-full h-full rounded-lg sm:rounded-xl border border-white/20 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,transparent_75%)] relative flex flex-col items-center justify-center p-1">
                        <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full border border-white/30 bg-white/15 flex items-center justify-center shadow-inner">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#F97316] fill-[#F97316]" />
                        </div>
                        <span className="text-[6px] sm:text-[7px] font-black tracking-widest uppercase text-white/95 mt-0.5">
                          PLAY
                        </span>
                      </div>
                    </div>

                    {/* Card Front (Face Up, 180deg) */}
                    <div
                      className={`absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl border-2 transition-all duration-300 flex flex-col overflow-hidden bg-white ${
                        isMatched
                          ? "border-[#16A34A] bg-[#F0FDF4] shadow-xs"
                          : "border-[#6366F1] shadow-xs"
                      }`}
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      {/* Artwork Stage */}
                      <div className="relative flex-1 w-full flex items-center justify-center p-1 bg-[radial-gradient(circle_at_50%_45%,rgba(249,115,22,0.06)_0%,transparent_70%)] overflow-hidden">
                        <img
                          src={card.image}
                          alt={card.name || card.iconKey}
                          className={`w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 ${
                            isMatched ? "scale-90 opacity-95" : "scale-100"
                          }`}
                        />

                        {isMatched && (
                          <div className="absolute top-1 right-1 z-10">
                            <span className="px-1 py-0.2 rounded-full bg-[#16A34A] text-white font-black text-[7px] shadow-2xs flex items-center">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Name Plate */}
                      <div className="w-full bg-[#F7F7F5] border-t border-[#E8E8E5] py-0.5 px-0.5 text-center shrink-0">
                        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-[#202124] truncate block">
                          {card.name || card.iconKey}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
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

