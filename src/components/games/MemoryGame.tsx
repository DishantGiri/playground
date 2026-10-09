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
    if (chatEndRef.current?.parentElement) {
      chatEndRef.current.parentElement.scrollTop = chatEndRef.current.parentElement.scrollHeight;
    }
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
      <div className="w-full max-w-6xl mx-auto space-y-4 select-none text-[#202124]">
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
            <Award className="w-3.5 h-3.5" />
            <span>Play Solo / Bot</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setOnlineInitialMode("friends");
              setMode("CROSS_DEVICE");
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
              setMode("CROSS_DEVICE");
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7] border border-[#DCFCE7] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Play with Random Live</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMode("LOCAL_2P");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              mode === "LOCAL_2P"
                ? "bg-[#202124] text-white shadow-xs"
                : "text-[#9CA3AF] hover:text-[#4B5563]"
            }`}
            title="Pass & play on same screen"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>1-Device</span>
          </button>
        </div>

        {/* Row 2: Deck Info on Left, Restart & Rules on Right */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F0F0ED] p-1 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
            <span className="px-3 py-1 bg-white text-[#202124] rounded-lg shadow-xs">
              4×6 Grid (24 Cards)
            </span>
            <span className="px-3 py-1 text-[#6B7280]">
              12 Matching Pairs
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={initGame}
              className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] hover:bg-[#E8E8E5] transition-colors cursor-pointer"
              title="Shuffle New Deck"
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
            <Zap className="w-4 h-4" /> Rules of Memory Card Duel:
          </h4>
          <p>1. Tap cards to flip them face up and reveal their hidden characters.</p>
          <p>2. Find two matching cards in consecutive flips to claim the pair.</p>
          <p>3. In 2-Player mode, finding a match awards an extra turn! Most pairs wins.</p>
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
                Memory Board (4×6 Grid)
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#6366F1] bg-[#EEF2FF] px-2 py-0.5 rounded-lg border border-[#C7D2FE]">
              {matchedPairsCount} / 12 pairs found
            </span>
          </div>

          {/* Cards Grid Centered */}
          <div className="flex-1 flex items-center justify-center my-3 w-full">
            <div className="grid grid-cols-6 gap-2 sm:gap-2.5 w-full max-w-[480px]">
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
                          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border border-white/30 bg-white/15 flex items-center justify-center shadow-inner">
                            <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#F97316] fill-[#F97316]" />
                          </div>
                          <span className="text-[5px] sm:text-[6px] font-black tracking-widest uppercase text-white/95 mt-0.5">
                            CARD
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

                        <div className="w-full bg-[#F7F7F5] border-t border-[#E8E8E5] py-0.5 px-0.5 text-center shrink-0">
                          <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-wider text-[#202124] truncate block">
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

          <div className="text-center text-[11px] text-[#9CA3AF] pt-2 border-t border-[#F0F0ED]">
            Tap any two cards to flip them. Remember character positions to match pairs!
          </div>

          {/* Victory Modal Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316]">
                <Trophy className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-black text-[#202124]">
                {mode === "SOLO"
                  ? "Board Cleared! 🏆"
                  : p1Pairs > p2Pairs
                  ? "Player 1 Wins! 🏆"
                  : p2Pairs > p1Pairs
                  ? "Player 2 Wins! 🏆"
                  : "Tie Match! 🤝"}
              </h3>

              <p className="text-xs font-semibold text-[#6B7280]">
                {mode === "SOLO"
                  ? `Completed in ${moves} moves and ${formatTime(timeSeconds)}!`
                  : `Final Score: ${p1Pairs} pairs vs ${p2Pairs} pairs`}
              </p>

              <button
                onClick={initGame}
                className="mt-2 px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          )}
        </div>

        {/* COLUMN 2: "game details" (Middle) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3">
          {/* Player 1 Scorecard */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              activePlayer === 1 && !isGameOver
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
                  {mode === "SOLO" ? "Player" : "Player 1"}
                </span>
                <span className="text-[10px] text-[#6366F1] font-semibold flex items-center gap-1">
                  {mode === "SOLO" ? `${moves} moves taken` : activePlayer === 1 ? "Thinking..." : "Waiting"}
                </span>
              </div>
            </div>
            <div className="text-2xl font-black text-[#6366F1]">
              {mode === "SOLO" ? matchedPairsCount : p1Pairs}
            </div>
          </div>

          {/* Player 2 / Bot Scorecard */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              activePlayer === 2 && !isGameOver
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
                  {mode === "SOLO" ? "Target Bot" : "Player 2"}
                </span>
                <span className="text-[10px] text-[#F97316] font-semibold flex items-center gap-1">
                  {mode === "SOLO" ? "Benchmark: 18 moves" : activePlayer === 2 ? "Thinking..." : "Waiting"}
                </span>
              </div>
            </div>
            <div className="text-2xl font-black text-[#F97316]">
              {mode === "SOLO" ? "12" : p2Pairs}
            </div>
          </div>

          {/* Turn Status Banner */}
          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              isGameOver
                ? "bg-[#F7F7F5] border-[#E8E8E5] text-[#202124]"
                : activePlayer === 1
                ? "bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5]"
                : "bg-[#FFF7ED] border-[#FFEDD5] text-[#C2410C]"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
              Match Status
            </span>
            <span className="text-xs font-black">
              {isGameOver
                ? "Deck Cleared"
                : mode === "SOLO"
                ? `Elapsed: ${formatTime(timeSeconds)} (${moves} moves)`
                : activePlayer === 1
                ? "Player 1's Turn"
                : "Player 2's Turn"}
            </span>
          </div>

          {/* Game Details Summary Card */}
          <div className="bg-white border border-[#E8E8E5] rounded-2xl p-4 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#202124]">Pairs Discovered</span>
                <span className="text-xs font-mono font-bold text-[#6B7280]">
                  {matchedPairsCount} / 12
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-[#F0F0ED] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(matchedPairsCount / 12) * 100}%` }}
                  className="bg-[#6366F1] transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5 text-[11px] text-[#6B7280] font-medium pt-1">
                <div className="flex items-center justify-between">
                  <span>Elapsed Time:</span>
                  <span className="font-bold text-[#202124]">{formatTime(timeSeconds)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Moves:</span>
                  <span className="font-bold text-[#202124]">{moves} flips</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Remaining:</span>
                  <span className="font-bold text-emerald-600">{12 - matchedPairsCount} pairs</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#F0F0ED]">
              <button
                onClick={initGame}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#F7F7F5] hover:bg-[#EEF2FF] hover:text-[#6366F1] text-[#202124] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Shuffle New Deck</span>
              </button>

              <button
                onClick={() => setShowRewardedAd(true)}
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
              {["Matched pair! 🔥", "Where is it? 🤔", "Almost had it! ⚡", "Good game! 🎉"].map((taunt) => (
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
