"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Zap, Trophy, RotateCcw, Clock, AlertTriangle } from "lucide-react";
import { MultiplayerRoom } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  room: MultiplayerRoom;
  playerNumber: 1 | 2;
  onAction: (action: string, payload?: any) => Promise<void>;
  isSubmitting: boolean;
}

export function OnlineReactionDuel({ room, playerNumber, onAction, isSubmitting }: Props) {
  const state = room.reactionDuel;
  const isWaitingForGuest = room.status === "waiting";
  const isFinished = room.status === "finished";

  const me = room.players.find((p) => p.playerNumber === playerNumber);
  const opponent = room.players.find((p) => p.playerNumber !== playerNumber);

  useEffect(() => {
    if (state?.phase === "go") {
      sound.playTurnChime();
    }
  }, [state?.phase]);

  useEffect(() => {
    if (isFinished && room.winner === playerNumber) {
      sound.playWin();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } else if (isFinished && room.winner && room.winner !== playerNumber) {
      sound.playIncorrect();
    }
  }, [isFinished, room.winner, playerNumber]);

  const handleTap = async () => {
    if (isSubmitting || !state || isFinished) return;
    if (state.phase === "ready") {
      // Early tap penalty
      sound.playError();
      await onAction("tap");
    } else if (state.phase === "go") {
      sound.playSuccess();
      await onAction("tap");
    }
  };

  const handleNextRound = async () => {
    if (isSubmitting) return;
    sound.playClick();
    await onAction("start_round");
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
      {/* Target points */}
      <div className="flex items-center justify-between px-3 py-2 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
        <span>First to 3 points wins match</span>
        <div className="flex items-center gap-3">
          <span className="text-violet-700">P1: {room.scores.p1}/3</span>
          <span className="text-slate-300">vs</span>
          <span className="text-rose-700">P2: {room.scores.p2}/3</span>
        </div>
      </div>

      {/* Finished Banner */}
      {isFinished ? (
        <div
          className={`p-6 rounded-3xl border text-center space-y-3 ${
            room.winner === playerNumber
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-xs bg-white">
            <Trophy className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black">
              {room.winner === playerNumber
                ? "VICTORY! YOU WON THE DUEL!"
                : `${opponent?.name || "Opponent"} Won!`}
            </h3>
            <p className="text-sm font-medium mt-1">
              {room.winReason || "Lightning reflexes!"}
            </p>
          </div>

          <button
            onClick={() => onAction("rematch")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-700 shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rematch</span>
          </button>
        </div>
      ) : (
        /* Reflex Tap Button Screen */
        <div
          onClick={handleTap}
          className={`min-h-[320px] rounded-3xl border-2 p-6 flex flex-col items-center justify-center text-center transition-all select-none cursor-pointer active:scale-[0.99] shadow-sm ${
            state?.phase === "go"
              ? "bg-emerald-500 border-emerald-600 text-white"
              : state?.phase === "ready"
              ? "bg-rose-500 border-rose-600 text-white animate-pulse"
              : "bg-slate-50 border-slate-200 text-slate-800"
          }`}
        >
          {state?.phase === "ready" && (
            <div className="space-y-3">
              <AlertTriangle className="w-12 h-12 mx-auto animate-bounce" />
              <h3 className="text-3xl font-black tracking-tight">WAIT FOR GREEN!</h3>
              <p className="text-xs font-semibold text-rose-100 max-w-xs mx-auto">
                Do NOT tap yet! Tapping now causes a false-start penalty!
              </p>
            </div>
          )}

          {state?.phase === "go" && (
            <div className="space-y-3">
              <Zap className="w-16 h-16 mx-auto animate-ping" />
              <h3 className="text-4xl font-black tracking-tight">TAP NOW!</h3>
              <p className="text-sm font-bold text-emerald-100">
                Tap anywhere on your screen as fast as possible!
              </p>
            </div>
          )}

          {state?.phase === "round-over" && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/80 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black">
                {state.roundWinner === playerNumber
                  ? "You Won This Round!"
                  : `${opponent?.name || "Opponent"} Won Round!`}
              </h3>

              <div className="flex items-center justify-center gap-4 text-xs font-bold pt-1">
                <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700">
                  You: {playerNumber === 1 ? (state.p1TapTime === -1 ? "False Start" : `${state.p1TapTime}ms`) : (state.p2TapTime === -1 ? "False Start" : `${state.p2TapTime}ms`)}
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700">
                  {opponent?.name || "Opponent"}: {playerNumber === 1 ? (state.p2TapTime === -1 ? "False Start" : `${state.p2TapTime}ms`) : (state.p1TapTime === -1 ? "False Start" : `${state.p1TapTime}ms`)}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextRound();
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-all cursor-pointer"
                >
                  Start Next Round
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
