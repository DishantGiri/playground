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
    <div className="rounded-2xl sm:rounded-3xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col items-center justify-center min-h-[440px] space-y-4">
      {/* Compact Header */}
      <div className="w-full flex items-center justify-between gap-2 pb-2 border-b border-[#E8E8E5]">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] text-xs font-bold text-[#202124]">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              playerNumber === 1 ? "bg-[#EF4444]" : "bg-[#F59E0B]"
            }`}
          />
          <span>You play {myColorName} Discs</span>
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
            ? "Your Turn — Drop Disc"
            : `Waiting for ${opponent?.name || "Opponent"}...`}
        </span>
      </div>

      {/* The 7x6 Connect 4 Board */}
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
          <span>Drop discs into any column</span>
          <span className="font-semibold text-[#202124]">First to connect 4 wins!</span>
        </div>
      </div>
    </div>
  );
}
