"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, Clock, Sparkles, CircleDot, Users } from "lucide-react";
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

  const me = room.players.find((p) => p.playerNumber === playerNumber);
  const opponent = room.players.find((p) => p.playerNumber !== playerNumber);

  const gridSize = state?.gridSize || 3;
  const edgesSet = new Set(state?.edges || []);
  const boxes = state?.boxes || {};

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
    <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#E8E8E5] shadow-xs space-y-6">
      {/* Compact Interactive Board Header */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E5]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#202124]">
            {gridSize}×{gridSize} Grid Arena
          </span>
          <span className="text-[10px] text-[#6B7280]">
            ({gridSize * gridSize} Dots)
          </span>
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
            ? "Your Turn — Click a Line"
            : "Opponent's Turn"}
        </span>
      </div>

      {/* Dots and Boxes Interactive Board */}
      <div className="flex justify-center p-3 sm:p-5 bg-[#F7F7F5] rounded-3xl border border-[#E8E8E5] overflow-auto max-w-full select-none">
        <div
          className="inline-block relative my-2"
          style={{
            padding: "16px",
          }}
        >
          {Array.from({ length: gridSize }).map((_, r) => (
            <div key={`row-${r}`} className="flex flex-col">
              {/* Dots & Horizontal Lines Row */}
              <div className="flex items-center">
                {Array.from({ length: gridSize }).map((_, c) => {
                  const hKey = `h-${r}-${c}`;
                  const isHClaimed = edgesSet.has(hKey);
                  const isLargeGrid = gridSize >= 8;
                  const isMediumGrid = gridSize >= 6;

                  return (
                    <div key={`node-${r}-${c}`} className="flex items-center">
                      {/* The Dot */}
                      <div
                        className={`rounded-full bg-[#1E293B] shadow-sm z-20 shrink-0 border border-white ${
                          isLargeGrid ? "w-2.5 h-2.5" : isMediumGrid ? "w-3 h-3" : "w-4 h-4"
                        }`}
                      />

                      {/* Horizontal Line (if not last col) */}
                      {c < gridSize - 1 && (
                        <button
                          type="button"
                          disabled={!isMyTurn || isHClaimed || isSubmitting || isFinished}
                          onClick={() => handleClaimEdge(hKey)}
                          className={`transition-all rounded-full z-10 mx-[-2px] ${
                            isLargeGrid
                              ? "h-1.5 w-7 sm:w-8"
                              : isMediumGrid
                              ? "h-2 w-10 sm:w-12"
                              : "h-3 w-14 sm:w-20"
                          } ${
                            isHClaimed
                              ? "bg-indigo-600 shadow-xs"
                              : isMyTurn
                              ? "bg-[#D1D5DB] hover:bg-indigo-400 cursor-pointer"
                              : "bg-[#E5E7EB] cursor-not-allowed"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Vertical Lines & Box Territory Row (if not last row) */}
              {r < gridSize - 1 && (
                <div className="flex items-center">
                  {Array.from({ length: gridSize }).map((_, c) => {
                    const vKey = `v-${r}-${c}`;
                    const isVClaimed = edgesSet.has(vKey);
                    const boxKey = `${r}-${c}`;
                    const claimedOwner = boxes[boxKey];
                    const isLargeGrid = gridSize >= 8;
                    const isMediumGrid = gridSize >= 6;

                    return (
                      <div key={`vcol-${r}-${c}`} className="flex items-center">
                        {/* Vertical Line */}
                        <button
                          type="button"
                          disabled={!isMyTurn || isVClaimed || isSubmitting || isFinished}
                          onClick={() => handleClaimEdge(vKey)}
                          className={`transition-all rounded-full z-10 my-[-2px] ml-[2px] ${
                            isLargeGrid
                              ? "w-1.5 h-7 sm:h-8"
                              : isMediumGrid
                              ? "w-2 h-10 sm:h-12"
                              : "w-3 h-14 sm:h-20"
                          } ${
                            isVClaimed
                              ? "bg-indigo-600 shadow-xs"
                              : isMyTurn
                              ? "bg-[#D1D5DB] hover:bg-indigo-400 cursor-pointer"
                              : "bg-[#E5E7EB] cursor-not-allowed"
                          }`}
                        />

                        {/* Box Territory Interior (if not last col) */}
                        {c < gridSize - 1 && (
                          <div
                            className={`flex items-center justify-center font-black transition-all rounded-md sm:rounded-xl border border-dashed border-[#CBD5E1] mx-[-2px] ${
                              isLargeGrid
                                ? "w-7 sm:w-8 h-7 sm:h-8 text-[9px]"
                                : isMediumGrid
                                ? "w-10 sm:w-12 h-10 sm:h-12 text-xs"
                                : "w-14 sm:w-20 h-14 sm:h-20 text-sm"
                            } ${
                              claimedOwner === 1
                                ? "bg-blue-100 border-blue-400 text-blue-700 font-black scale-95 shadow-inner"
                                : claimedOwner === 2
                                ? "bg-rose-100 border-rose-400 text-rose-700 font-black scale-95 shadow-inner"
                                : "bg-white/40"
                            }`}
                          >
                            {claimedOwner === 1 ? (
                              <span className="uppercase text-blue-700">P1</span>
                            ) : claimedOwner === 2 ? (
                              <span className="uppercase text-rose-700">P2</span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
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
