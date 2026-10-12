"use client";

import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Clock,
  Sparkles,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { MultiplayerRoom, MemoryCardItem } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  room: MultiplayerRoom;
  playerNumber: 1 | 2;
  onAction: (action: string, payload?: any) => Promise<void>;
  isSubmitting: boolean;
}

export function OnlineMemoryDuel({
  room,
  playerNumber,
  onAction,
  isSubmitting,
}: Props) {
  const state = room.memoryDuel;
  const isMyTurn = room.status === "playing" && state?.currentTurn === playerNumber;
  const isWaitingForGuest = room.status === "waiting";
  const isFinished = room.status === "finished";

  const me = room.players.find((p) => p.playerNumber === playerNumber);
  const opponent = room.players.find((p) => p.playerNumber !== playerNumber);

  // Local state to manage the temporary peek window for non-matching flips
  const [localFlipped, setLocalFlipped] = useState<number[]>([]);
  const [isPeekActive, setIsPeekActive] = useState<boolean>(false);
  const peekTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound effects
  useEffect(() => {
    if (isMyTurn && !isPeekActive) sound.playTurnChime();
  }, [state?.currentTurn, isMyTurn, isPeekActive]);

  useEffect(() => {
    if (isFinished && room.winner === playerNumber) {
      sound.playWin();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } else if (isFinished && room.winner && room.winner !== playerNumber) {
      sound.playIncorrect();
    }
  }, [isFinished, room.winner, playerNumber]);

  // Synchronize flipped indices and enforce auto-conceal countdown (1.2s)
  useEffect(() => {
    if (!state) return;

    if (peekTimerRef.current) {
      clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }

    const serverFlipped = state.flippedIndices || [];

    if (serverFlipped.length > 0 && state.flipTimestamp) {
      const elapsed = Date.now() - state.flipTimestamp;
      const remaining = Math.max(0, 1200 - elapsed);

      if (remaining > 50) {
        setLocalFlipped(serverFlipped);
        setIsPeekActive(true);

        peekTimerRef.current = setTimeout(() => {
          setLocalFlipped([]);
          setIsPeekActive(false);
        }, remaining);
      } else {
        setLocalFlipped([]);
        setIsPeekActive(false);
      }
    } else {
      setLocalFlipped(serverFlipped);
      setIsPeekActive(false);
    }

    return () => {
      if (peekTimerRef.current) {
        clearTimeout(peekTimerRef.current);
      }
    };
  }, [state?.flippedIndices, state?.flipTimestamp]);

  const handleCardClick = async (index: number) => {
    if (!isMyTurn || isSubmitting || !state || isPeekActive) return;
    const card = state.cards[index];
    if (!card || card.matched || card.isWildcard || localFlipped.includes(index)) return;

    sound.playFlip();
    await onAction("flip_card", { index });
  };

  if (isWaitingForGuest) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          Waiting for Opponent to Join...
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Share your 4-digit Room Code{" "}
          <span className="font-mono font-bold bg-violet-100 text-violet-800 px-2.5 py-1 rounded-lg border border-violet-200">
            {room.code}
          </span>{" "}
          with a friend on another device!
        </p>
      </div>
    );
  }

  const cards = state?.cards || [];
  const matchedCount = state ? state.p1Score + state.p2Score : 0;
  const cols = state?.cols || (cards.length === 24 ? 6 : 4);
  const totalPairs = state?.totalPairs || (cards.length > 0 ? Math.floor(cards.length / 2) : 12);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-[#E8E8E5] bg-white p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center min-h-[440px] space-y-4">
      {/* Peek warning notification when cards are temporarily shown */}
      {isPeekActive && (
        <div className="w-full p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-xs">
          <Eye className="w-4 h-4 text-[#D97706]" />
          <span>Memorize quickly! Cards auto-conceal in 1s...</span>
        </div>
      )}

      {/* Header */}
      <div className="w-full flex items-center justify-between gap-2 pb-2 border-b border-[#E8E8E5]">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] text-xs font-bold text-[#202124]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>
            {matchedCount} / {totalPairs} Pairs Found
          </span>
        </div>

        <span
          className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
            isFinished
              ? "bg-purple-100 text-purple-700 border border-purple-200"
              : isMyTurn
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200 animate-pulse"
              : "bg-amber-100 text-amber-700 border border-amber-200"
          }`}
        >
          {isFinished
            ? room.winner === "draw"
              ? "Match Draw!"
              : room.winner === playerNumber
              ? "You Won!"
              : "Opponent Won!"
            : isMyTurn
            ? isPeekActive
              ? "Memorizing..."
              : "Your Turn — Flip 2 Cards"
            : `Waiting for ${opponent?.name || "Opponent"}...`}
        </span>
      </div>

      {/* Dynamic Gaming Arena Board */}
      <div
        className={`grid gap-1.5 sm:gap-2.5 md:gap-3 w-full mx-auto ${
          cols === 6
            ? "grid-cols-6 max-w-[560px]"
            : cols === 3
            ? "grid-cols-3 max-w-[340px]"
            : "grid-cols-4 max-w-[440px]"
        }`}
      >
        {cards.map((card, idx) => {
          const isFlipped = localFlipped.includes(idx);
          const isMatched = card.matched;
          const isClickable =
            isMyTurn && !isMatched && !isFlipped && !isFinished && !isPeekActive;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={!isClickable}
              className={`aspect-[3/4] w-full select-none relative focus:outline-hidden ${
                isClickable ? "cursor-pointer" : isMatched ? "cursor-default" : "cursor-not-allowed"
              }`}
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
                {/* Back of Card (Face Down) */}
                <div
                  className={`absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col items-center justify-center p-1 ${
                    isClickable
                      ? "border-[#6366F1]/40 bg-gradient-to-br from-[#6366F1] via-[#5457E5] to-[#4338CA] hover:border-[#F97316] hover:scale-[1.03] shadow-xs active:scale-95"
                      : "border-[#6366F1]/30 bg-gradient-to-br from-[#6366F1] via-[#5457E5] to-[#4338CA] shadow-2xs opacity-90"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <div className="w-full h-full rounded-lg sm:rounded-xl border border-white/20 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18)_0%,transparent_75%)] relative flex flex-col items-center justify-center p-1">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-white/30 bg-white/15 flex items-center justify-center shadow-inner">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F97316] fill-[#F97316]" />
                    </div>
                    <span className="text-[6px] sm:text-[7px] font-black tracking-widest uppercase text-white/95 mt-0.5">
                      CARD
                    </span>
                  </div>
                </div>

                {/* Front of Card (Face Up / Revealed) */}
                <div
                  className={`absolute inset-0 rounded-xl sm:rounded-2xl border-2 bg-white flex flex-col items-center justify-between p-1 overflow-hidden transition-all shadow-xs ${
                    isMatched
                      ? card.matchedBy === 1
                        ? "border-[#F97316] ring-2 ring-[#FFEDD5] bg-[#FFF7ED]"
                        : "border-[#6366F1] ring-2 ring-[#EEF2FF] bg-[#EEF2FF]"
                      : "border-[#6366F1]"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="w-full flex justify-between items-center px-1 pt-0.5">
                    <span className="text-[7px] font-bold text-[#9CA3AF]">#{card.id}</span>
                    {isMatched && (
                      <span
                        className={`px-1 py-0.2 rounded-full text-white font-black text-[7px] flex items-center gap-0.5 ${
                          card.matchedBy === 1 ? "bg-[#F97316]" : "bg-[#6366F1]"
                        }`}
                      >
                        P{card.matchedBy}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 w-full flex items-center justify-center relative p-1 overflow-hidden">
                    {card.image && (card.image.startsWith("/") || card.image.startsWith("http")) ? (
                      <img
                        src={card.image}
                        alt={card.iconKey}
                        className={`w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 ${
                          isMatched ? "scale-90 opacity-95" : "scale-100"
                        }`}
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl drop-shadow-xs">{card.image || card.iconKey}</span>
                    )}
                  </div>

                  <div className="w-full bg-[#F7F7F5] border-t border-[#E8E8E5] py-0.5 px-0.5 text-center shrink-0">
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-[#202124] truncate block">
                      {card.iconKey}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
