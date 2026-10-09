"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Sparkles, Send, Flame, Zap, Shield, Heart } from "lucide-react";
import { QuickMessage } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  messages: QuickMessage[];
  playerNumber: 1 | 2;
  onSendMessage: (text: string) => void;
}

const PRESET_MESSAGES = [
  "Thinking...",
  "Good guess!",
  "Almost had it!",
  "Hurry up!",
  "Nice move!",
  "Good game!",
];

export function QuickEmoteBar({ messages, playerNumber, onSendMessage }: Props) {
  const [latestToast, setLatestToast] = useState<QuickMessage | null>(null);

  // When a new message comes from the OTHER player, display pop-up toast and chime!
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const latest = messages[messages.length - 1];
    if (latest && latest.sender !== playerNumber && Date.now() - latest.timestamp < 3000) {
      setLatestToast(latest);
      sound.playTurnChime();
      const timer = setTimeout(() => setLatestToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [messages, playerNumber]);

  return (
    <div className="w-full relative">
      {/* Toast Alert from Opponent */}
      {latestToast && (
        <div className="mb-3 p-3 rounded-xl bg-violet-600 text-white shadow-md flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-200" />
            <span className="text-xs font-bold">
              {latestToast.senderName}: &ldquo;{latestToast.text}&rdquo;
            </span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">New Message</span>
        </div>
      )}

      {/* Preset Action Emotes */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
        <div className="flex items-center gap-2 mb-2 px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5 text-violet-600" />
          <span>Quick Chat / Reactions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_MESSAGES.map((msg) => (
            <button
              key={msg}
              onClick={() => {
                sound.playClick();
                onSendMessage(msg);
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-700 border border-slate-200 transition-colors cursor-pointer active:scale-95"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
