"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, AlertCircle, Clock, Sparkles } from "lucide-react";
import { MultiplayerRoom } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  room: MultiplayerRoom;
  playerNumber: 1 | 2;
  onAction: (action: string, payload?: any) => Promise<void>;
  isSubmitting: boolean;
}

export function OnlineTicTacToe({ room, playerNumber, onAction, isSubmitting }: Props) {
  const state = room.ticTacToe;
  const isMyTurn = room.status === "playing" && state?.currentTurn === playerNumber;
  const isWaitingForGuest = room.status === "waiting";
  const isFinished = room.status === "finished";

  const me = room.players.find((p) => p.playerNumber === playerNumber);
  const opponent = room.players.find((p) => p.playerNumber !== playerNumber);

  const mySymbol = playerNumber === 1 ? "X" : "O";
  const opponentSymbol = playerNumber === 1 ? "O" : "X";

  useEffect(() => {
    if (isMyTurn) sound.playTurnChime();
  }, [state?.currentTurn, isMyTurn]);

  useEffect(() => {
    if (isFinished && room.winner === playerNumber) {
      sound.playWin();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } else if (isFinished && room.winner && room.winner !== playerNumber) {
      sound.playIncorrect();
    }
  }, [isFinished, room.winner, playerNumber]);

  const handleCellClick = async (index: number) => {
    if (!isMyTurn || isSubmitting || !state || state.board[index] !== null) return;
    sound.playClick();
    await onAction("move", { index });
  };

  if (isWaitingForGuest) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900">Waiting for Opponent to Join...</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Share your Room Code <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{room.code}</span> with a friend on another device!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Turn Banner */}
      {!isFinished && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-sm font-bold shadow-xs transition-colors ${
            isMyTurn
              ? "bg-violet-600 text-white border-violet-700 shadow-violet-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-full ${
                isMyTurn ? "bg-white animate-ping" : "bg-slate-400"
              }`}
            />
            <span>
              {isMyTurn ? `Your Turn (${mySymbol})! Tap a square.` : `Waiting for ${opponent?.name || "Opponent"} (${opponentSymbol})...`}
            </span>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/20">
            You are &lsquo;{mySymbol}&rsquo;
          </span>
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
              <Trophy className="w-7 h-7 text-emerald-600" />
            ) : room.winner === "draw" ? (
              <AlertCircle className="w-7 h-7 text-slate-600" />
            ) : (
              <Trophy className="w-7 h-7 text-rose-600" />
            )}
          </div>
          <div>
            <h3 className="text-2xl font-black">
              {room.winner === playerNumber
                ? "VICTORY! YOU WON!"
                : room.winner === "draw"
                ? "CAT'S GAME! DRAW!"
                : `${opponent?.name || "Opponent"} Won!`}
            </h3>
            <p className="text-sm font-medium mt-1">
              {room.winReason || "Great game!"}
            </p>
          </div>

          <button
            onClick={() => onAction("rematch")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-700 shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again / Rematch</span>
          </button>
        </div>
      )}

      {/* 3x3 Tic Tac Toe Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col items-center">
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs aspect-square">
          {state?.board.map((cell, idx) => {
            const isWinningCell = state.winningLine?.includes(idx);
            return (
              <button
                key={idx}
                disabled={!isMyTurn || isSubmitting || cell !== null}
                onClick={() => handleCellClick(idx)}
                className={`rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black transition-all cursor-pointer aspect-square ${
                  isWinningCell
                    ? "bg-amber-100 text-amber-700 border-2 border-amber-400 scale-102 shadow-md"
                    : cell === "X"
                    ? "bg-violet-50 text-violet-700 border border-violet-200"
                    : cell === "O"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isMyTurn
                    ? "bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 hover:border-violet-400 active:scale-95"
                    : "bg-slate-50 border border-slate-200 opacity-70 cursor-not-allowed"
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 mt-5 font-medium">
          Line up 3 in a row horizontally, vertically, or diagonally.
        </p>
      </div>
    </div>
  );
}
