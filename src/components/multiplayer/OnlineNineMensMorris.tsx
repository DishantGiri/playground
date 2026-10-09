"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, Clock, Sparkles, Layers, ShieldAlert } from "lucide-react";
import { MultiplayerRoom } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  room: MultiplayerRoom;
  playerNumber: 1 | 2;
  onAction: (action: string, payload?: any) => Promise<void>;
  isSubmitting: boolean;
}

const POSITIONS = [
  // Outer ring (0-7)
  { id: 0, x: 50, y: 50 },
  { id: 1, x: 250, y: 50 },
  { id: 2, x: 450, y: 50 },
  { id: 3, x: 450, y: 250 },
  { id: 4, x: 450, y: 450 },
  { id: 5, x: 250, y: 450 },
  { id: 6, x: 50, y: 450 },
  { id: 7, x: 50, y: 250 },
  // Middle ring (8-15)
  { id: 8, x: 115, y: 115 },
  { id: 9, x: 250, y: 115 },
  { id: 10, x: 385, y: 115 },
  { id: 11, x: 385, y: 250 },
  { id: 12, x: 385, y: 385 },
  { id: 13, x: 250, y: 385 },
  { id: 14, x: 115, y: 385 },
  { id: 15, x: 115, y: 250 },
  // Inner ring (16-23)
  { id: 16, x: 180, y: 180 },
  { id: 17, x: 250, y: 180 },
  { id: 18, x: 320, y: 180 },
  { id: 19, x: 320, y: 250 },
  { id: 20, x: 320, y: 320 },
  { id: 21, x: 250, y: 320 },
  { id: 22, x: 180, y: 320 },
  { id: 23, x: 180, y: 250 },
];

export function OnlineNineMensMorris({ room, playerNumber, onAction, isSubmitting }: Props) {
  const state = room.nineMensMorris;
  const isMyTurn = room.status === "playing" && state?.currentTurn === playerNumber;
  const isWaitingForGuest = room.status === "waiting";
  const isFinished = room.status === "finished";

  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const me = room.players.find((p) => p.playerNumber === playerNumber);
  const opponent = room.players.find((p) => p.playerNumber !== playerNumber);

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

  if (isWaitingForGuest) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E8E8E5] shadow-xs text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-[#202124]">
          Waiting for Opponent to Join...
        </h3>
        <p className="text-sm text-[#6B7280] max-w-md mx-auto">
          Share your 4-digit Room Code{" "}
          <span className="font-mono font-bold bg-indigo-100 text-[#4338CA] px-2.5 py-1 rounded-lg border border-[#C7D2FE]">
            {room.code}
          </span>{" "}
          with a friend on another device!
        </p>
      </div>
    );
  }

  if (!state) return null;

  const handleNodeClick = async (pos: number) => {
    if (!isMyTurn || isSubmitting || isFinished) return;
    sound.playClick();

    // 1. If a mill was formed, player must remove an opponent piece
    if (state.millToClaim) {
      const targetPiece = state.board[pos];
      const opponentNum = playerNumber === 1 ? 2 : 1;
      if (targetPiece === opponentNum) {
        await onAction("remove_piece", { pos });
      }
      return;
    }

    // 2. Placing Phase
    if (state.phase === "place") {
      if (state.board[pos] === null) {
        await onAction("place_piece", { pos });
      }
      return;
    }

    // 3. Moving / Flying Phase
    const currentPiece = state.board[pos];
    if (currentPiece === playerNumber) {
      // Select piece to move
      setSelectedNode(pos);
    } else if (selectedNode !== null && currentPiece === null) {
      // Move selected piece to empty spot
      await onAction("move_piece", { from: selectedNode, to: pos });
      setSelectedNode(null);
    }
  };

  const myHand = playerNumber === 1 ? state.p1Hand : state.p2Hand;
  const opponentHand = playerNumber === 1 ? state.p2Hand : state.p1Hand;

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#E8E8E5] shadow-xs space-y-5">
      {/* Turn & Status Header */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E5]">
        {/* Player 1 (White / Cyan) */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            state.currentTurn === 1
              ? "bg-cyan-600 text-white border-cyan-700 shadow-xs"
              : "bg-white text-[#6B7280] border-[#E8E8E5]"
          }`}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-200 border border-white" />
          <div className="text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {room.players[0]?.name || "P1"} {playerNumber === 1 && "(You)"}
            </div>
            <div className="text-xs font-black">
              {state.p1Hand > 0 ? `${state.p1Hand} in hand` : `${state.p1Alive} active`}
            </div>
          </div>
        </div>

        {/* Turn Status Message */}
        <div className="text-center">
          <span
            className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
              state.millToClaim
                ? "bg-amber-100 text-amber-700 border border-amber-300 animate-bounce"
                : isMyTurn
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 animate-pulse"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {state.millToClaim
              ? isMyTurn
                ? "Mill! Remove Enemy Piece"
                : "Opponent removing piece..."
              : isMyTurn
              ? "Your Turn!"
              : "Opponent's Turn"}
          </span>
        </div>

        {/* Player 2 (Dark / Indigo) */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            state.currentTurn === 2
              ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
              : "bg-white text-[#6B7280] border-[#E8E8E5]"
          }`}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-indigo-950 border border-white" />
          <div className="text-left">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {room.players[1]?.name || "P2"} {playerNumber === 2 && "(You)"}
            </div>
            <div className="text-xs font-black">
              {state.p2Hand > 0 ? `${state.p2Hand} in hand` : `${state.p2Alive} active`}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Morris Board */}
      <div className="w-full max-w-[440px] mx-auto aspect-square bg-[#F7F7F5] rounded-3xl border border-[#E8E8E5] p-3 shadow-inner relative select-none">
        <svg viewBox="0 0 500 500" className="w-full h-full stroke-[#334155] stroke-[3]">
          {/* Outer Square */}
          <rect x="50" y="50" width="400" height="400" fill="none" rx="4" />
          {/* Middle Square */}
          <rect x="115" y="115" width="270" height="270" fill="none" rx="4" />
          {/* Inner Square */}
          <rect x="180" y="180" width="140" height="140" fill="none" rx="4" />

          {/* Cross lines connecting rings */}
          <line x1="250" y1="50" x2="250" y2="180" />
          <line x1="250" y1="320" x2="250" y2="450" />
          <line x1="50" y1="250" x2="180" y2="250" />
          <line x1="320" y1="250" x2="450" y2="250" />
        </svg>

        {/* Clickable 24 Nodes */}
        {POSITIONS.map((pos) => {
          const piece = state.board[pos.id];
          const isSelected = selectedNode === pos.id;
          const leftPercent = (pos.x / 500) * 100;
          const topPercent = (pos.y / 500) * 100;

          return (
            <button
              key={pos.id}
              onClick={() => handleNodeClick(pos.id)}
              disabled={!isMyTurn || isSubmitting || isFinished}
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all cursor-pointer ${
                piece === 1
                  ? "w-8 h-8 sm:w-9 sm:h-9 bg-cyan-400 border-2 border-white shadow-md flex items-center justify-center font-bold text-xs text-white"
                  : piece === 2
                  ? "w-8 h-8 sm:w-9 sm:h-9 bg-indigo-950 border-2 border-indigo-400 shadow-md flex items-center justify-center font-bold text-xs text-white"
                  : "w-5 h-5 sm:w-6 sm:h-6 bg-slate-300 border-2 border-white hover:bg-emerald-400 hover:scale-125 shadow-xs"
              } ${isSelected ? "ring-4 ring-amber-400 animate-pulse scale-110" : ""}`}
            >
              {piece === 1 && "P1"}
              {piece === 2 && "P2"}
            </button>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isFinished && (
        <div className="p-6 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#FFEDD5] flex items-center justify-center mx-auto text-[#F97316]">
            <Trophy className="w-6 h-6 animate-bounce" />
          </div>
          <h4 className="text-xl font-black text-[#202124]">Match Over!</h4>
          <p className="text-xs text-[#6B7280]">{room.winReason}</p>
        </div>
      )}
    </div>
  );
}
