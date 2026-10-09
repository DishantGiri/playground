"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, Clock, Sparkles, ChevronDown } from "lucide-react";
import { MultiplayerRoom } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  room: MultiplayerRoom;
  playerNumber: 1 | 2;
  onAction: (action: string, payload?: any) => Promise<void>;
  isSubmitting: boolean;
}

export function OnlineConnectFour({ room, playerNumber, onAction, isSubmitting }: Props) {
  const state = room.connectFour;
  const isMyTurn = room.status === "playing" && state?.currentTurn === playerNumber;
  const isWaitingForGuest = room.status === "waiting";
  const isFinished = room.status === "finished";

  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const me = room.players.find((p) => p.playerNumber === playerNumber);
  const opponent = room.players.find((p) => p.playerNumber !== playerNumber);

  const myColorName = playerNumber === 1 ? "Red" : "Yellow";
  const opponentColorName = playerNumber === 1 ? "Yellow" : "Red";

  useEffect(() => {
    if (isMyTurn) sound.playTurnChime();
  }, [state?.currentTurn, isMyTurn]);

  useEffect(() => {
    if (isFinished && room.winner === playerNumber) {
      sound.playWin();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } else if (isFinished && room.winner && room.winner !== playerNumber) {
      sound.playIncorrect();
    }
  }, [isFinished, room.winner, playerNumber]);

  const handleDrop = async (col: number) => {
    if (!isMyTurn || isSubmitting || !state) return;
    // Check if column is full
    if (state.board[col] !== null) return;

    sound.playDrop();
    await onAction("drop_disc", { col });
  };

  if (isWaitingForGuest) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900">Waiting for Opponent to Join...</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Share your 4-digit Room Code <span className="font-mono font-bold bg-violet-100 text-violet-800 px-2.5 py-1 rounded-lg border border-violet-200">{room.code}</span> with a friend on another phone or laptop!
        </p>
      </div>
    );
  }

  const board = state?.board || Array(42).fill(null);
  const winningCells = state?.winningCells || [];

  return (
    <div className="w-full min-w-0 rounded-2xl sm:rounded-3xl border border-[#E8E8E5] bg-[#F7F7F5] p-3 sm:p-4 lg:p-5 shadow-2xs select-none text-[#202124]">
      
      {/* 2-Card Full-Width Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 w-full items-stretch">
        
        {/* Left Card: Status, Turn & Players */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 order-2 lg:order-1">
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
                  Online 2-Device Arena
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                  Connect 4 Live Duel
                </h2>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] text-xs font-bold text-[#202124]">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    playerNumber === 1 ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                  }`}
                />
                <span>You are {myColorName}</span>
              </div>
            </div>

            {/* Turn Banner */}
            {!isFinished ? (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs transition-colors ${
                  isMyTurn
                    ? playerNumber === 1
                      ? "bg-[#FEF2F2] border-[#EF4444] text-[#DC2626]"
                      : "bg-[#FFFBEB] border-[#F59E0B] text-[#D97706]"
                    : "bg-[#F7F7F5] text-[#202124] border-[#E8E8E5]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      playerNumber === 1 ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                    } ${isMyTurn ? "animate-ping" : ""}`}
                  />
                  <span>
                    {isMyTurn
                      ? `Your Turn (${myColorName})! Pick a column.`
                      : `Waiting for ${opponent?.name || "Opponent"} (${opponentColorName})...`}
                  </span>
                </div>
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
                  <h3 className="text-xl font-black">
                    {room.winner === playerNumber
                      ? "VICTORY! You Connected 4!"
                      : room.winner === "draw"
                      ? "STALEMATE DRAW"
                      : "OPPONENT CONNECTED 4"}
                  </h3>
                  <p className="text-xs mt-1 text-[#6B7280]">{room.winReason}</p>
                </div>

                <button
                  onClick={() => onAction("rematch")}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs active:scale-95 transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play Rematch</span>
                </button>
              </div>
            )}

            {/* Players Status Box */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div
                className={`p-3 rounded-xl border ${
                  playerNumber === 1
                    ? "bg-[#FEF2F2] border-[#EF4444]"
                    : "bg-[#F0F0ED] border-[#E8E8E5]"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-[#DC2626] block truncate">
                  {playerNumber === 1 ? `${me?.name} (You)` : `${opponent?.name} (P1)`}
                </span>
                <span className="text-base font-black text-[#991B1B]">Red Discs</span>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  playerNumber === 2
                    ? "bg-[#FFFBEB] border-[#F59E0B]"
                    : "bg-[#F0F0ED] border-[#E8E8E5]"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-[#D97706] block truncate">
                  {playerNumber === 2 ? `${me?.name} (You)` : `${opponent?.name} (P2)`}
                </span>
                <span className="text-base font-black text-[#92400E]">Yellow Discs</span>
              </div>
            </div>

          </div>

          <div className="pt-2 border-t border-[#E8E8E5] text-[11px] text-[#6B7280] text-center">
            Drop discs into any column • First to connect 4 wins!
          </div>
        </div>

        {/* Right Card: Connect 4 Physical Board (Full Width of Right Panel) */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col items-center justify-center min-h-[440px] order-1 lg:order-2">
          <div className="w-full max-w-[520px] flex flex-col items-center">
            
            {/* Column Drop Buttons Header */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full mb-2.5">
              {Array.from({ length: 7 }).map((_, col) => {
                const isColFull = board[col] !== null;
                const canDrop = isMyTurn && !isColFull && !isFinished;

                return (
                  <button
                    key={col}
                    onClick={() => handleDrop(col)}
                    onMouseEnter={() => setHoverCol(col)}
                    onMouseLeave={() => setHoverCol(null)}
                    disabled={!canDrop}
                    className={`h-11 rounded-xl flex items-center justify-center transition-all ${
                      canDrop
                        ? playerNumber === 1
                          ? "bg-[#FEF2F2] hover:bg-[#EF4444] hover:text-white text-[#DC2626] cursor-pointer shadow-2xs"
                          : "bg-[#FFFBEB] hover:bg-[#F59E0B] hover:text-white text-[#D97706] cursor-pointer shadow-2xs"
                        : "opacity-20 cursor-not-allowed bg-[#F0F0ED] text-[#9CA3AF]"
                    }`}
                    title={canDrop ? `Drop disc in column ${col + 1}` : "Column full"}
                  >
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </button>
                );
              })}
            </div>

            {/* The 7x6 Connect 4 Grid */}
            <div className="w-full aspect-[7/6] bg-[#4F46E5] p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-inner border-4 border-[#4338CA] flex flex-col justify-center">
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 h-full">
                {Array.from({ length: 42 }).map((_, idx) => {
                  const cellVal = board[idx];
                  const isWinningCell = winningCells.includes(idx);
                  const col = idx % 7;
                  const isPreview = isMyTurn && hoverCol === col && cellVal === null && !isFinished;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleDrop(col)}
                      onMouseEnter={() => setHoverCol(col)}
                      onMouseLeave={() => setHoverCol(null)}
                      className={`aspect-square rounded-full flex items-center justify-center cursor-pointer transition-transform ${
                        cellVal === null
                          ? "bg-[#3730A3]/50 shadow-inner"
                          : cellVal === 1
                          ? "bg-[#EF4444] shadow-md"
                          : "bg-[#F59E0B] shadow-md"
                      } ${
                        isWinningCell ? "ring-4 ring-white animate-pulse scale-105" : ""
                      }`}
                    >
                      {cellVal !== null && (
                        <div className="w-3/4 h-3/4 rounded-full border border-white/40" />
                      )}

                      {cellVal === null && isPreview && (
                        <div
                          className={`w-3/4 h-3/4 rounded-full opacity-40 transition-opacity ${
                            playerNumber === 1 ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-xs text-[#6B7280] pt-3 px-1">
              <span>{playerNumber === 1 ? me?.name : opponent?.name} (Red) vs {playerNumber === 2 ? me?.name : opponent?.name} (Yellow)</span>
              <span className="font-semibold text-[#202124]">Connect 4 to Win</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
