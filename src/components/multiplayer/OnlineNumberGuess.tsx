"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Binary,
  ArrowUp,
  ArrowDown,
  Flame,
  CheckCircle2,
  Sparkles,
  Trophy,
  Heart,
  Clock,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  User,
} from "lucide-react";
import { MultiplayerRoom } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  room: MultiplayerRoom;
  playerNumber: 1 | 2;
  onAction: (action: string, payload?: any) => Promise<void>;
  isSubmitting: boolean;
}

export function OnlineNumberGuess({ room, playerNumber, onAction, isSubmitting }: Props) {
  const [guessInput, setGuessInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const state = room.numberGuess;
  const isMyTurn = room.status === "playing" && state?.currentTurn === playerNumber;
  const isWaitingForGuest = room.status === "waiting";
  const isFinished = room.status === "finished";

  const me = room.players.find((p) => p.playerNumber === playerNumber);
  const opponent = room.players.find((p) => p.playerNumber !== playerNumber);

  // Play turn chime when turn becomes active
  useEffect(() => {
    if (isMyTurn) {
      sound.playTurnChime();
    }
  }, [state?.currentTurn, isMyTurn]);

  // Trigger win confetti
  useEffect(() => {
    if (isFinished && room.winner === playerNumber) {
      sound.playWin();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } else if (isFinished && room.winner && room.winner !== playerNumber) {
      sound.playIncorrect();
    }
  }, [isFinished, room.winner, playerNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!isMyTurn || isSubmitting) return;

    const num = parseInt(guessInput);
    if (isNaN(num) || num < 1 || num > 100) {
      setErrorMsg("Please enter a valid number between 1 and 100");
      return;
    }

    if (state?.history.some((h) => h.guess === num)) {
      setErrorMsg(`Number ${num} was already guessed. Pick a different number.`);
      return;
    }

    sound.playClick();
    setGuessInput("");
    await onAction("guess", { guess: num });
  };

  if (isWaitingForGuest) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900">Waiting for Opponent to Join...</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Share your Room Code <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{room.code}</span> with a friend on another phone or computer!
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Listening for device connection...
          </span>
        </div>
      </div>
    );
  }

  const p1Attempts = state?.p1Attempts || 0;
  const p2Attempts = state?.p2Attempts || 0;
  const maxAttempts = state?.maxAttemptsPerPlayer || 5;

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
              {isMyTurn ? "Your Turn! Enter your guess." : `Waiting for ${opponent?.name || "Opponent"} to guess...`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className={isMyTurn ? "text-violet-200" : "text-slate-500"}>
              {playerNumber === 1
                ? `${maxAttempts - p1Attempts} attempts left`
                : `${maxAttempts - p2Attempts} attempts left`}
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
                ? "MATCH DRAW!"
                : `${opponent?.name || "Opponent"} Won!`}
            </h3>
            <p className="text-sm font-medium mt-1">
              {room.winReason || `The secret number was ${state?.targetNumber}!`}
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

      {/* Guess Input Card */}
      {!isFinished && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-center">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 mx-auto mb-2">
              <Binary className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Guess Secret Number (1 to 100)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Both players get 5 attempts. First to nail the target wins!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                disabled={!isMyTurn || isSubmitting}
                placeholder={isMyTurn ? "Type 1 - 100..." : "Waiting for opponent..."}
                className="w-full text-center text-3xl font-black tracking-widest py-3 px-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-violet-600 focus:bg-white focus:outline-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-900"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={!isMyTurn || isSubmitting || !guessInput}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:hover:bg-violet-600 shadow-md shadow-violet-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isMyTurn ? "Submit My Guess" : "Waiting for Opponent..."}</span>
            </button>
          </form>

          {/* Quick Attempts tracker */}
          <div className="flex items-center justify-around pt-2 border-t border-slate-100 text-xs">
            <div className="text-left">
              <span className="font-bold text-slate-600 block">{me?.name} (You)</span>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: maxAttempts }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full border ${
                      i < (playerNumber === 1 ? p1Attempts : p2Attempts)
                        ? "bg-slate-300 border-slate-400"
                        : "bg-emerald-500 border-emerald-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-600 block">{opponent?.name || "Opponent"}</span>
              <div className="flex gap-1 mt-1 justify-end">
                {Array.from({ length: maxAttempts }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full border ${
                      i < (playerNumber === 1 ? p2Attempts : p1Attempts)
                        ? "bg-slate-300 border-slate-400"
                        : "bg-rose-500 border-rose-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Guess History */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-100">
          <span>Live Match History</span>
          <span className="text-slate-400 font-normal">
            {state?.history.length || 0} moves recorded
          </span>
        </div>

        {state?.history.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">
            No guesses yet. Take the first turn!
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {state?.history.map((record, index) => {
              const isMine = record.player === playerNumber;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    record.type === "correct"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      : record.type === "hot"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        isMine
                          ? "bg-violet-100 text-violet-800 border border-violet-200"
                          : "bg-slate-200 text-slate-800 border border-slate-300"
                      }`}
                    >
                      {isMine ? "YOU" : record.playerName}
                    </span>
                    <span className="font-black text-sm">#{record.guess}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold">
                    {record.type === "correct" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : record.type === "hot" ? (
                      <Flame className="w-4 h-4 text-amber-500" />
                    ) : record.type === "too-high" ? (
                      <ArrowDown className="w-4 h-4 text-rose-500" />
                    ) : (
                      <ArrowUp className="w-4 h-4 text-sky-500" />
                    )}
                    <span>{record.hint}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
