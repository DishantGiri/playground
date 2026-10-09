"use client";

import { useState } from "react";
import { Copy, Check, Share2, LogOut, Swords, Wifi, User, Trophy, RotateCcw } from "lucide-react";
import { MultiplayerRoom } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  room: MultiplayerRoom;
  playerNumber: 1 | 2;
  playerToken: string;
  onLeave: () => void;
  onRematch?: () => void;
}

export function MultiplayerHeader({ room, playerNumber, playerToken, onLeave, onRematch }: Props) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const p1 = room.players.find((p) => p.playerNumber === 1);
  const p2 = room.players.find((p) => p.playerNumber === 2);

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    sound.playClick();
    const url = `${window.location.origin}/multiplayer?room=${room.code}&game=${room.gameType}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Room Info & Code */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Room Code:</span>
              <span className="text-sm font-black text-slate-900 tracking-wider bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {room.code}
              </span>
              <button
                onClick={handleCopyCode}
                title="Copy Room Code"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live 2-Device Session</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
          </button>

          {room.status === "finished" && onRematch && (
            <button
              onClick={onRematch}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rematch</span>
            </button>
          )}

          <button
            onClick={onLeave}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Players Bar & Match Score */}
      <div className="grid grid-cols-3 items-center bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs">
        {/* Player 1 */}
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black ${
            playerNumber === 1
              ? "bg-violet-600 text-white shadow-xs"
              : "bg-slate-200 text-slate-700"
          }`}>
            P1
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-800 truncate flex items-center gap-1">
              <span>{p1?.name || "Player 1"}</span>
              {playerNumber === 1 && (
                <span className="text-[10px] text-violet-700 font-bold bg-violet-100/70 px-1.5 py-0.2 rounded">
                  YOU
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Host</span>
          </div>
        </div>

        {/* Center Score */}
        <div className="text-center font-black text-slate-800 flex items-center justify-center gap-2">
          <span className="text-base text-violet-700">{room.scores.p1}</span>
          <span className="text-slate-300 font-normal">:</span>
          <span className="text-base text-rose-700">{room.scores.p2}</span>
        </div>

        {/* Player 2 */}
        <div className="flex items-center justify-end gap-2 text-right">
          <div className="min-w-0">
            <div className="font-bold text-slate-800 truncate flex items-center justify-end gap-1">
              {playerNumber === 2 && (
                <span className="text-[10px] text-rose-700 font-bold bg-rose-100/70 px-1.5 py-0.2 rounded">
                  YOU
                </span>
              )}
              <span>{p2 ? p2.name : "Waiting..."}</span>
            </div>
            <span className="text-[10px] text-slate-400">{p2 ? "Challenger" : "Not connected"}</span>
          </div>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black ${
            playerNumber === 2
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-slate-200 text-slate-700"
          }`}>
            P2
          </div>
        </div>
      </div>
    </div>
  );
}
