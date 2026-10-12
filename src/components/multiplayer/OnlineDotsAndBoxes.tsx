"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Clock, Zap, Users } from "lucide-react";
import { MultiplayerRoom } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  room: MultiplayerRoom;
  playerNumber: 1 | 2;
  onAction: (action: string, payload?: any) => Promise<void>;
  isSubmitting: boolean;
}

export function OnlineDotsAndBoxes({ room, playerNumber, onAction, isSubmitting }: Props) {
  const state = room.dotsAndBoxes;
  const isMyTurn = room.status === "playing" && state?.currentTurn === playerNumber;
  const isWaitingForGuest = room.status === "waiting";
  const isFinished = room.status === "finished";

  const p1 = room.players.find((p) => p.playerNumber === 1);
  const p2 = room.players.find((p) => p.playerNumber === 2);

  const gridSize = state?.gridSize || 3;
  const edgesSet = new Set(state?.edges || []);
  const boxes = state?.boxes || {};

  const totalBoxes = (gridSize - 1) * (gridSize - 1);
  const p1Score = state?.p1Score || 0;
  const p2Score = state?.p2Score || 0;
  const openBoxes = Math.max(0, totalBoxes - (p1Score + p2Score));

  // Dynamic board dimensions based on gridSize
  const cellSize =
    gridSize <= 4 ? 68 :
    gridSize <= 5 ? 56 :
    gridSize <= 6 ? 48 :
    gridSize <= 7 ? 42 :
    gridSize <= 9 ? 36 : 30;

  const dotSize =
    gridSize <= 5 ? 14 :
    gridSize <= 7 ? 12 :
    gridSize <= 9 ? 10 : 8;

  const edgeThickness =
    gridSize <= 5 ? 7 :
    gridSize <= 7 ? 5 :
    gridSize <= 9 ? 4 : 3;

  const offset = 16;
  const boardWidth = (gridSize - 1) * cellSize + offset * 2;
  const boardHeight = (gridSize - 1) * cellSize + offset * 2;

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

  const handleClaimEdge = async (edgeKey: string) => {
    if (!isMyTurn || isSubmitting || edgesSet.has(edgeKey)) return;
    sound.playClick();
    await onAction("claim_edge", { edge: edgeKey });
  };

  if (isWaitingForGuest) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-[#E8E8E5] shadow-xs text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-[#202124]">
          Waiting for Opponent to Join...
        </h3>
        <p className="text-sm text-[#6B7280] max-w-md mx-auto">
          Share your 4-digit Room Code{" "}
          <span className="font-mono font-bold bg-orange-100 text-[#C2410C] px-2.5 py-1 rounded-lg border border-[#FFEDD5]">
            {room.code}
          </span>{" "}
          with a friend on another device, or wait for a live player!
        </p>
      </div>
    );
  }

  if (!state) return null;

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#E8E8E5] shadow-xs space-y-5">
      {/* Scoreboard and Turn Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E5]">
        {/* Players Score Cards */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          {/* P1 Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              state.currentTurn === 1 && !isFinished
                ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                : "bg-white border-[#E8E8E5]"
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-[#6366F1] text-white flex items-center justify-center text-xs font-black">
              P1
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#202124] max-w-[90px] truncate">
                {p1?.name || "Player 1"} {playerNumber === 1 && "(You)"}
              </span>
              <span className="text-xs font-black text-[#6366F1]">
                {p1Score} {p1Score === 1 ? "box" : "boxes"}
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-[#9CA3AF]">vs</span>

          {/* P2 Badge */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              state.currentTurn === 2 && !isFinished
                ? "bg-orange-50 border-orange-300 ring-2 ring-orange-200"
                : "bg-white border-[#E8E8E5]"
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-[#F97316] text-white flex items-center justify-center text-xs font-black">
              P2
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#202124] max-w-[90px] truncate">
                {p2?.name || "Player 2"} {playerNumber === 2 && "(You)"}
              </span>
              <span className="text-xs font-black text-[#F97316]">
                {p2Score} {p2Score === 1 ? "box" : "boxes"}
              </span>
            </div>
          </div>
        </div>

        {/* Turn Status and Open Squares */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="text-[11px] font-mono font-bold text-[#F97316] bg-[#FFF7ED] px-2.5 py-1 rounded-lg border border-[#FFEDD5]">
            {openBoxes} open {openBoxes === 1 ? "box" : "boxes"}
          </span>

          <span
            className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
              isFinished
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : isMyTurn
                ? "bg-emerald-100 text-emerald-700 border border-emerald-300 animate-pulse"
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
              ? "Your Turn"
              : "Opponent's Turn"}
          </span>
        </div>
      </div>

      {/* Dots and Boxes Pixel-Perfect Interactive Board */}
      <div className="flex justify-center p-3 sm:p-5 bg-[#F7F7F5] rounded-3xl border border-[#E8E8E5] overflow-auto max-w-full select-none">
        <div
          className="relative inline-block my-2"
          style={{
            width: `${boardWidth}px`,
            height: `${boardHeight}px`,
          }}
        >
          {/* Claimed Box Backgrounds */}
          {Array.from({ length: gridSize - 1 }).map((_, r) =>
            Array.from({ length: gridSize - 1 }).map((_, c) => {
              const boxKey = `${r}-${c}`;
              const owner = boxes[boxKey];
              if (!owner) return null;
              return (
                <div
                  key={`box-${boxKey}`}
                  className={`absolute rounded-md sm:rounded-xl flex items-center justify-center font-black transition-all duration-300 shadow-xs ${
                    owner === 1
                      ? "bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/40"
                      : "bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/40"
                  } ${
                    gridSize >= 10
                      ? "text-[9px]"
                      : gridSize >= 7
                      ? "text-xs"
                      : gridSize >= 5
                      ? "text-sm"
                      : "text-base"
                  }`}
                  style={{
                    left: `${c * cellSize + offset + Math.round(dotSize / 2)}px`,
                    top: `${r * cellSize + offset + Math.round(dotSize / 2)}px`,
                    width: `${cellSize - dotSize}px`,
                    height: `${cellSize - dotSize}px`,
                  }}
                >
                  {owner === 1 ? "P1" : "P2"}
                </div>
              );
            })
          )}

          {/* Horizontal Edges */}
          {Array.from({ length: gridSize }).map((_, r) =>
            Array.from({ length: gridSize - 1 }).map((_, c) => {
              const edgeKey = `h-${r}-${c}`;
              const isClaimed = edgesSet.has(edgeKey);
              const isLast = state.lastEdge === edgeKey;

              return (
                <button
                  key={edgeKey}
                  type="button"
                  disabled={!isMyTurn || isClaimed || isSubmitting || isFinished}
                  onClick={() => handleClaimEdge(edgeKey)}
                  className={`absolute rounded-full transition-all ${
                    isClaimed
                      ? isLast
                        ? "bg-[#4F46E5] ring-2 ring-indigo-300 ring-offset-1 shadow-xs z-10"
                        : "bg-[#6366F1] shadow-xs z-10"
                      : isMyTurn
                      ? "bg-[#D1D5DB] hover:bg-[#6366F1]/60 cursor-pointer z-10"
                      : "bg-[#E5E7EB] cursor-not-allowed opacity-80"
                  }`}
                  style={{
                    left: `${c * cellSize + offset + Math.round(dotSize / 3)}px`,
                    top: `${r * cellSize + offset - Math.round(edgeThickness / 2)}px`,
                    width: `${cellSize - Math.round((dotSize * 2) / 3)}px`,
                    height: `${isClaimed ? edgeThickness : Math.max(edgeThickness - 2, 2.5)}px`,
                  }}
                  aria-label={`Horizontal edge row ${r} col ${c}`}
                />
              );
            })
          )}

          {/* Vertical Edges */}
          {Array.from({ length: gridSize - 1 }).map((_, r) =>
            Array.from({ length: gridSize }).map((_, c) => {
              const edgeKey = `v-${r}-${c}`;
              const isClaimed = edgesSet.has(edgeKey);
              const isLast = state.lastEdge === edgeKey;

              return (
                <button
                  key={edgeKey}
                  type="button"
                  disabled={!isMyTurn || isClaimed || isSubmitting || isFinished}
                  onClick={() => handleClaimEdge(edgeKey)}
                  className={`absolute rounded-full transition-all ${
                    isClaimed
                      ? isLast
                        ? "bg-[#4F46E5] ring-2 ring-indigo-300 ring-offset-1 shadow-xs z-10"
                        : "bg-[#6366F1] shadow-xs z-10"
                      : isMyTurn
                      ? "bg-[#D1D5DB] hover:bg-[#6366F1]/60 cursor-pointer z-10"
                      : "bg-[#E5E7EB] cursor-not-allowed opacity-80"
                  }`}
                  style={{
                    left: `${c * cellSize + offset - Math.round(edgeThickness / 2)}px`,
                    top: `${r * cellSize + offset + Math.round(dotSize / 3)}px`,
                    width: `${isClaimed ? edgeThickness : Math.max(edgeThickness - 2, 2.5)}px`,
                    height: `${cellSize - Math.round((dotSize * 2) / 3)}px`,
                  }}
                  aria-label={`Vertical edge row ${r} col ${c}`}
                />
              );
            })
          )}

          {/* Dots on Grid Intersections */}
          {Array.from({ length: gridSize }).map((_, r) =>
            Array.from({ length: gridSize }).map((_, c) => (
              <div
                key={`dot-${r}-${c}`}
                className="absolute rounded-full bg-[#1E293B] shadow-xs border-2 border-white pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: `${c * cellSize + offset}px`,
                  top: `${r * cellSize + offset}px`,
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Completion Modal */}
      {isFinished && (
        <div className="p-6 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#FFEDD5] flex items-center justify-center mx-auto text-[#F97316]">
            <Trophy className="w-6 h-6 animate-bounce" />
          </div>
          <h4 className="text-xl font-black text-[#202124]">Game Over!</h4>
          <p className="text-xs text-[#6B7280]">{room.winReason}</p>
        </div>
      )}
    </div>
  );
}
