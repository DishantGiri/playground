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
    <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Room Info & Live Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#6366F1] shrink-0">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-[#202124] capitalize">
                {room.gameType.replace(/-/g, " ")} Duel
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6366F1] bg-[#EEF2FF] px-2 py-0.5 rounded-lg border border-[#C7D2FE]">
                Online Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#16A34A] mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span>2-Device Session Synced</span>
            </div>
          </div>
        </div>

        {/* Room Code Pill & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#F0F0ED] px-3 py-1.5 rounded-xl border border-[#E8E8E5] text-xs font-bold">
            <span className="text-[#6B7280] text-[10px] uppercase">Room Code</span>
            <span className="font-mono text-sm text-[#202124] tracking-wider">{room.code}</span>
            <button
              onClick={handleCopyCode}
              title="Copy Room Code"
              className="p-1 text-[#6B7280] hover:text-[#202124] hover:bg-white rounded-md transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#6B7280] bg-[#F0F0ED] hover:bg-[#E8E8E5] hover:text-[#202124] border border-[#E8E8E5] transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
          </button>

          {room.status === "finished" && onRematch && (
            <button
              onClick={onRematch}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rematch</span>
            </button>
          )}

          <button
            onClick={onLeave}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FCA5A5] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
}
