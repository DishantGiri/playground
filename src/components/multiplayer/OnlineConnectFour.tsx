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
    <div className="space-y-5">
      {/* Turn Banner */}
      {!isFinished && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-bold shadow-xs transition-colors ${
            isMyTurn
              ? playerNumber === 1
                ? "bg-rose-600 text-white border-rose-700 shadow-rose-200"
                : "bg-amber-500 text-white border-amber-600 shadow-amber-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                playerNumber === 1 ? "bg-rose-300" : "bg-amber-200"
              } ${isMyTurn ? "animate-ping" : ""}`}
            />
            <span>
              {isMyTurn
                ? `Your Turn (${myColorName})! Pick a column.`
                : `Waiting for ${opponent?.name || "Opponent"} (${opponentColorName})...`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20">
              You are {myColorName}
            </span>
          </div>
        </div>
      )}

      {/* Finished Banner */}
      {isFinished && (
        <div
          className={`p-6 rounded-3xl border text-center space-y-3 ${
            room.winner === playerNumber
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : room.winner === "draw"
              ? "bg-slate-50 border-slate-300 text-slate-800"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-xs bg-white">
            {room.winner === playerNumber ? (
              <Trophy className="w-8 h-8 text-emerald-600" />
            ) : room.winner === "draw" ? (
              <Sparkles className="w-8 h-8 text-slate-500" />
            ) : (
              <Trophy className="w-8 h-8 text-rose-500" />
            )}
          </div>

          <div>
            <h3 className="text-2xl font-black">
              {room.winner === playerNumber
                ? "VICTORY!"
                : room.winner === "draw"
                ? "STALEMATE DRAW"
                : "OPPONENT WINS"}
            </h3>
            <p className="text-sm mt-1 opacity-90">{room.winReason}</p>
          </div>

          <button
            onClick={() => onAction("rematch")}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Rematch</span>
          </button>
        </div>
      )}

      {/* Connect 4 Board Container */}
      <div className="max-w-[440px] mx-auto bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-md">
        
        {/* Column Drop Buttons Header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
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
                className={`h-9 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                  canDrop
                    ? "bg-violet-100 hover:bg-violet-600 hover:text-white text-violet-700 cursor-pointer shadow-xs"
                    : "opacity-20 cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
                title={canDrop ? `Drop disc in column ${col + 1}` : "Column full"}
              >
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </button>
            );
          })}
        </div>

        {/* The 7x6 Connect 4 Grid */}
        <div className="bg-gradient-to-b from-blue-600 to-indigo-700 p-2.5 sm:p-3.5 rounded-2xl shadow-inner border-4 border-blue-700">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
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
                      ? "bg-slate-900/35 shadow-inner"
                      : cellVal === 1
                      ? "bg-gradient-to-tr from-rose-700 via-rose-500 to-red-400 shadow-md"
                      : "bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 shadow-md"
                  } ${
                    isWinningCell
                      ? "ring-4 ring-white animate-pulse scale-105"
                      : ""
                  }`}
                >
                  {/* Subtle inner gloss disc ring */}
                  {cellVal !== null && (
                    <div className="w-3/4 h-3/4 rounded-full border border-white/30" />
                  )}

                  {/* Empty cell preview on hover */}
                  {cellVal === null && isPreview && (
                    <div
                      className={`w-3/4 h-3/4 rounded-full opacity-40 transition-opacity ${
                        playerNumber === 1 ? "bg-rose-400" : "bg-amber-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-xs" />
            <span className="font-bold text-slate-700">{playerNumber === 1 ? me?.name : opponent?.name} (P1)</span>
          </div>

          <span className="text-[10px] uppercase font-bold text-slate-400">First to 4 in a line</span>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-xs" />
            <span className="font-bold text-slate-700">{playerNumber === 2 ? me?.name : opponent?.name} (P2)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
