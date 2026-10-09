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
          <span>{matchedCount} / 12 Pairs Found</span>
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

      {/* 4x6 Gaming Arena Board */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 md:gap-3 w-full max-w-[560px]">
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
              className="aspect-[3/4] w-full select-none relative focus:outline-hidden cursor-pointer"
              style={{ perspective: "1000px" }}
            >
              {/* 3D Card Flip Wrapper */}
              <div
                className="w-full h-full relative transition-transform duration-350 ease-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Back of Card (Face Down) */}
                <div
                  className={`absolute inset-0 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center p-1 transition-all ${
                    isClickable
                      ? "bg-gradient-to-br from-[#6366F1] to-[#4338CA] border-[#4F46E5] text-white hover:scale-102 shadow-2xs hover:shadow-xs active:scale-95"
                      : "bg-[#F0F0ED] border-[#E8E8E5] text-[#9CA3AF] cursor-default opacity-85"
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-black text-white/80">?</span>
                  </div>
                </div>

                {/* Front of Card (Face Up / Revealed) */}
                <div
                  className={`absolute inset-0 rounded-xl sm:rounded-2xl border-2 bg-white flex flex-col items-center justify-between p-1 overflow-hidden transition-all shadow-xs ${
                    isMatched
                      ? card.matchedBy === 1
                        ? "border-[#F97316] ring-2 ring-[#FFEDD5] bg-[#FFF7ED]"
                        : "border-[#6366F1] ring-2 ring-[#EEF2FF] bg-[#EEF2FF]"
                      : "border-[#E8E8E5]"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="w-full flex justify-end px-1 pt-0.5">
                    <span className="text-[7px] font-bold text-[#9CA3AF]">#{card.id + 1}</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center relative">
                    <span className="text-xl sm:text-2xl drop-shadow-xs">{card.image}</span>

                    {isMatched && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-lg">
                        <span
                          className={`px-1 py-0.2 rounded-full text-white font-black text-[7px] shadow-2xs flex items-center gap-0.5 ${
                            card.matchedBy === 1 ? "bg-[#F97316]" : "bg-[#6366F1]"
                          }`}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>P{card.matchedBy}</span>
                        </span>
                      </div>
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
