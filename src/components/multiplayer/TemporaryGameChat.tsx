"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { QuickMessage } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  messages: QuickMessage[];
  playerNumber: 1 | 2;
  playerName: string;
  opponentName: string;
  onSendMessage: (text: string) => void;
  defaultOpen?: boolean;
  isOpenControlled?: boolean;
  onToggleControlled?: (open: boolean) => void;
}

const PRESET_TAUNTS = [
  "Nice move! 🔥",
  "Thinking... 🤔",
  "Hurry up! ⚡",
  "Good try! 👏",
  "Almost had me! 😅",
  "Good game! 🎉",
  "Rematch after this? 🔄",
  "Hello! 👋",
];

const EMOJI_BUTTONS = ["👏", "🔥", "😂", "😎", "🤯", "🎉", "❤️", "👍", "💀", "🚀"];

export function TemporaryGameChat({
  messages,
  playerNumber,
  playerName,
  opponentName,
  onSendMessage,
  defaultOpen = false,
  isOpenControlled,
  onToggleControlled,
}: Props) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalIsOpen;

  const [inputText, setInputText] = useState("");
  const [latestToast, setLatestToast] = useState<QuickMessage | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesCountRef = useRef<number>(0);
  const lastProcessedMsgId = useRef<string | null>(null);

  const setIsOpen = (nextState: boolean) => {
    if (onToggleControlled) {
      onToggleControlled(nextState);
    } else {
      setInternalIsOpen(nextState);
    }
  };

  // Auto-scroll to bottom of chat container ONLY
  useEffect(() => {
    if (isOpen && chatScrollContainerRef.current) {
      const count = messages?.length || 0;
      if (count > 0 && count !== prevMessagesCountRef.current) {
        prevMessagesCountRef.current = count;
        chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  // When a new message arrives from the OPPONENT
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const latest = messages[messages.length - 1];

    if (latest && latest.id !== lastProcessedMsgId.current) {
      lastProcessedMsgId.current = latest.id;

      if (latest.sender !== playerNumber) {
        // Show pop-up toast above the floating trigger
        setLatestToast(latest);
        sound.playTurnChime();

        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }

        const timer = setTimeout(() => {
          setLatestToast(null);
        }, 4500);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, playerNumber, isOpen]);

  const handleToggleOpen = () => {
    sound.playClick();
    if (!isOpen) {
      setUnreadCount(0);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    sound.playClick();
    onSendMessage(trimmed);
    setInputText("");
  };

  const handleQuickEmote = (text: string) => {
    sound.playClick();
    onSendMessage(text);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none flex flex-col items-end pointer-events-auto">
      {/* Toast Alert Pop-up from Opponent (when chat is closed) */}
      {!isOpen && latestToast && (
        <div
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
            setLatestToast(null);
          }}
          className="mb-2.5 p-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 cursor-pointer hover:scale-102 transition-all max-w-[320px] border border-white/20"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs min-w-0">
              <span className="font-bold opacity-80 block truncate">
                {latestToast.senderName}
              </span>
              <p className="font-semibold text-sm truncate">&ldquo;{latestToast.text}&rdquo;</p>
            </div>
          </div>
          <span className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 transition-colors">
            Open
          </span>
        </div>
      )}

      {/* Floating Pop-up Window when OPEN */}
      {isOpen ? (
        <div className="w-80 sm:w-96 max-w-[calc(100vw-2.5rem)] h-[490px] max-h-[calc(100vh-6rem)] rounded-3xl border border-[#E8E8E5] bg-white shadow-2xl overflow-hidden transition-all flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header Bar */}
          <div className="p-3.5 bg-[#F7F7F5] border-b border-[#E8E8E5] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 text-[#4F46E5] flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#202124] uppercase tracking-wider">
                    Live Chat
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 uppercase">
                    Temp
                  </span>
                </div>
                <span className="text-[10px] text-[#6B7280] block truncate">
                  vs {opponentName || "Opponent"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-[#6B7280] mr-1">
                {messages.length} msgs
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#E8E8E5] text-[#6B7280] hover:text-[#202124] transition-colors cursor-pointer"
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ephemeral Notice */}
          <div className="px-3.5 py-1.5 bg-[#FFFBEB] border-b border-[#FEF3C7] text-[10px] text-[#92400E] flex items-center gap-1.5 font-medium shrink-0">
            <Clock className="w-3 h-3 text-[#D97706] shrink-0" />
            <span className="truncate">
              Messages vanish automatically when match ends.
            </span>
          </div>

          {/* Scrollable Message History */}
          <div
            ref={chatScrollContainerRef}
            className="p-3.5 space-y-2.5 flex-1 min-h-0 overflow-y-auto bg-slate-50/50"
          >
            {messages.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#9CA3AF] space-y-1">
                <p className="font-bold">No messages yet.</p>
                <p className="text-[11px]">Say hi to your opponent or pick a quick reaction below!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === playerNumber;
                const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-[#9CA3AF] mb-0.5 px-1">
                      <span className="font-bold text-[#6B7280]">
                        {isMe ? "You" : msg.senderName}
                      </span>
                      <span>•</span>
                      <span>{timeStr}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs font-semibold leading-relaxed shadow-2xs ${
                        isMe
                          ? "bg-[#4F46E5] text-white rounded-br-xs"
                          : "bg-white text-[#202124] border border-[#E8E8E5] rounded-bl-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Emoji Reactions Bar */}
          <div className="px-3 py-1.5 bg-white border-t border-[#E8E8E5] flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
            {EMOJI_BUTTONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleQuickEmote(emoji)}
                className="w-7 h-7 rounded-lg hover:bg-[#F0F0ED] text-sm flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all"
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Quick Taunt / Cheer Buttons */}
          <div className="px-3 py-1.5 bg-[#F7F7F5] border-t border-[#E8E8E5] flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {PRESET_TAUNTS.map((taunt) => (
              <button
                key={taunt}
                type="button"
                onClick={() => handleQuickEmote(taunt)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-600 text-[#4B5563] border border-[#E8E8E5] text-[11px] font-bold shrink-0 cursor-pointer active:scale-95 transition-all"
              >
                {taunt}
              </button>
            ))}
          </div>

          {/* Message Input & Send Form */}
          <form
            onSubmit={handleSend}
            className="p-2.5 bg-white border-t border-[#E8E8E5] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              maxLength={160}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message opponent... (Enter to send)"
              className="flex-1 text-xs font-medium py-2 px-3 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#4F46E5] focus:bg-white focus:outline-hidden text-[#202124]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="py-2 px-3.5 rounded-xl font-bold text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      ) : (
        /* Floating Bottom-Right Launcher Button when CLOSED */
        <button
          type="button"
          onClick={handleToggleOpen}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#1E293B] hover:bg-[#0F172A] text-white shadow-xl hover:shadow-2xl border border-white/10 transition-all cursor-pointer active:scale-95 hover:scale-105"
          title="Open Live Chat"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center animate-bounce shadow-md">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-black tracking-wide pr-0.5">
            Live Chat
          </span>
          {messages.length > 0 && (
            <span className="text-[10px] font-mono text-slate-300 bg-white/15 px-2 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
