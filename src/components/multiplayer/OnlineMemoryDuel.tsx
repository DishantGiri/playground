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
    <div className="w-full min-w-0 rounded-2xl sm:rounded-3xl border border-[#E8E8E5] bg-[#F7F7F5] p-3 sm:p-4 lg:p-5 shadow-2xs select-none text-[#202124]">
      
      {/* 2-Card Full-Width Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 w-full items-stretch">
        
        {/* Left Card: Turn Status, Scores, Duel Info & Rematch */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 order-2 lg:order-1">
          <div className="space-y-4">
            
            {/* Peek warning notification when cards are temporarily shown */}
            {isPeekActive && (
              <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-xs">
                <Eye className="w-4 h-4 text-[#D97706]" />
                <span>Memorize quickly! Cards auto-conceal in 1s...</span>
              </div>
            )}

            {/* Turn & Score Banner */}
            {!isFinished ? (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs transition-colors ${
                  isMyTurn
                    ? playerNumber === 1
                      ? "bg-[#F97316] text-white border-[#F97316]"
                      : "bg-[#6366F1] text-white border-[#6366F1]"
                    : "bg-[#F7F7F5] text-[#202124] border-[#E8E8E5]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      playerNumber === 1 ? "bg-white" : "bg-white"
                    } ${isMyTurn && !isPeekActive ? "animate-ping" : ""}`}
                  />
                  <span className="truncate">
                    {isMyTurn
                      ? isPeekActive
                        ? "Revealed cards memorizing..."
                        : `Your Turn (${playerNumber === 1 ? "P1" : "P2"})! Tap to match.`
                      : `Waiting for ${opponent?.name || "Opponent"}...`}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-white/20 font-bold whitespace-nowrap text-xs">
                  {state?.p1Score} - {state?.p2Score}
                </span>
              </div>
            ) : (
              /* Finished Banner */
              <div
                className={`p-5 rounded-2xl border-2 text-center space-y-3 ${
                  room.winner === playerNumber
                    ? "bg-[#FFF7ED] border-[#F97316]/40 text-[#202124]"
                    : room.winner === "draw"
                    ? "bg-[#F7F7F5] border-[#E8E8E5] text-[#202124]"
                    : "bg-[#FEF2F2] border-[#DC2626]/30 text-[#202124]"
                }`}
              >
                <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center border border-[#E8E8E5] shadow-xs bg-white">
                  {room.winner === playerNumber ? (
                    <Trophy className="w-6 h-6 text-[#F97316]" />
                  ) : room.winner === "draw" ? (
                    <Sparkles className="w-6 h-6 text-[#6B7280]" />
                  ) : (
                    <Trophy className="w-6 h-6 text-[#DC2626]" />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-black text-[#202124]">
                    {room.winner === playerNumber
                      ? "VICTORY! You Matched More Pairs!"
                      : room.winner === "draw"
                      ? "TIED GAME!"
                      : "OPPONENT WINS!"}
                  </h3>
                  <p className="text-xs mt-1 text-[#6B7280]">{room.winReason}</p>
                </div>

                <button
                  onClick={() => onAction("rematch")}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play 4x6 Rematch</span>
                </button>
              </div>
            )}

            {/* Score Header */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Session Scoreboard
              </span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div
                  className={`p-3 rounded-xl border ${
                    playerNumber === 1
                      ? "bg-[#FFF7ED] border-[#F97316]"
                      : "bg-[#F0F0ED] border-[#E8E8E5] text-[#202124]"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-[#F97316] block truncate">
                    {playerNumber === 1 ? `${me?.name} (You)` : `${opponent?.name} (P1)`}
                  </span>
                  <span className="text-2xl font-black font-mono text-[#F97316]">{state?.p1Score}</span>
                  <span className="text-[9px] text-[#6B7280] block">pairs</span>
                </div>

                <div
                  className={`p-3 rounded-xl border ${
                    playerNumber === 2
                      ? "bg-[#EEF2FF] border-[#6366F1]"
                      : "bg-[#F0F0ED] border-[#E8E8E5] text-[#202124]"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-[#6366F1] block truncate">
                    {playerNumber === 2 ? `${me?.name} (You)` : `${opponent?.name} (P2)`}
                  </span>
                  <span className="text-2xl font-black font-mono text-[#6366F1]">{state?.p2Score}</span>
                  <span className="text-[9px] text-[#6B7280] block">pairs</span>
                </div>
              </div>
            </div>

            {/* Meta status bar */}
            <div className="p-3 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#202124]">
                <span className="flex items-center gap-1.5 text-[#F97316]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PAIRS FOUND</span>
                </span>
                <span className="font-mono">{matchedCount} / 12</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-[#E8E8E5]">
                <div
                  className="h-full bg-gradient-to-r from-[#F97316] to-[#6366F1] transition-all duration-300 rounded-full"
                  style={{ width: `${(matchedCount / 12) * 100}%` }}
                />
              </div>
            </div>

          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-[#E8E8E5] text-[11px] text-[#6B7280] text-center">
            2-Device Online Sync • Real-Time Duel
          </div>
        </div>

        {/* Right Card: 4x6 Gaming Arena Board (Full Width of Right Panel) */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-3 sm:p-5 shadow-xs flex flex-col items-center justify-center min-h-[440px] order-1 lg:order-2">
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 md:gap-3 w-full">
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
                      transform: isFlipped || isMatched ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    {/* Card Back (Face Down) */}
                    <div
                      className={`absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl border border-[#6366F1]/30 bg-gradient-to-br from-[#6366F1] via-[#5457E5] to-[#4338CA] p-1 shadow-2xs flex items-center justify-center transition-all duration-200 overflow-hidden ${
                        isClickable
                          ? "hover:scale-[1.03] hover:border-[#F97316] cursor-pointer"
                          : "opacity-80"
                      }`}
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
                      <div className="relative flex-1 w-full flex items-center justify-center p-1 bg-[radial-gradient(circle_at_50%_45%,rgba(249,115,22,0.06)_0%,transparent_70%)] overflow-hidden">
                        <img
                          src={card.image}
                          alt={card.iconKey}
                          className={`w-full h-full object-contain pointer-events-none select-none transition-transform duration-300 ${
                            isMatched ? "scale-90 opacity-95" : "scale-100"
                          }`}
                        />

                        {isMatched && (
                          <div className="absolute top-1 right-1 z-10 flex items-center justify-center">
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

      </div>
    </div>
  );
}

