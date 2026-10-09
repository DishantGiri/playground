"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  Smile,
  Sparkles,
  ShieldAlert,
  Clock,
  Volume2,
} from "lucide-react";
import { QuickMessage } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";

interface Props {
  messages: QuickMessage[];
  playerNumber: 1 | 2;
  playerName: string;
  opponentName: string;
  onSendMessage: (text: string) => void;
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
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [latestToast, setLatestToast] = useState<QuickMessage | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastProcessedMsgId = useRef<string | null>(null);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // When a new message arrives from the OPPONENT:
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const latest = messages[messages.length - 1];

    if (latest && latest.id !== lastProcessedMsgId.current) {
      lastProcessedMsgId.current = latest.id;

      if (latest.sender !== playerNumber) {
        // Show pop-up toast
        setLatestToast(latest);
        sound.playTurnChime();

        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }

        const timer = setTimeout(() => {
          setLatestToast(null);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, playerNumber, isOpen]);

  // Reset unread count when chat opens
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
    <div className="w-full relative mt-3 select-none">
      {/* Toast Alert Pop-up from Opponent (when chat is closed or open) */}
      {latestToast && (
        <div
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
          }}
          className="mb-2.5 p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top-2 cursor-pointer hover:opacity-95 transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs min-w-0">
              <span className="font-bold opacity-80 block truncate">
                {latestToast.senderName}
              </span>
              <p className="font-semibold text-sm truncate">&ldquo;{latestToast.text}&rdquo;</p>
            </div>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
            Open Chat
          </span>
        </div>
      )}

      {/* Main Chat Container / Accordion Dock */}
      <div className="rounded-2xl border border-[#E8E8E5] bg-white shadow-xs overflow-hidden transition-all">
        {/* Header Bar */}
        <div
          onClick={handleToggleOpen}
          className="p-3 bg-[#F7F7F5] border-b border-[#E8E8E5] flex items-center justify-between cursor-pointer hover:bg-[#F0F0ED] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-[#4F46E5]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#202124] uppercase tracking-wider">
                Live Match Chat
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Temporary (In-Memory)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#6B7280]">
            <span>{messages.length} messages</span>
            {isOpen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Expanded Chat Drawer */}
        {isOpen && (
          <div className="flex flex-col">
            {/* Ephemeral Notice */}
            <div className="px-3.5 py-1.5 bg-[#FFFBEB] border-b border-[#FEF3C7] text-[10px] text-[#92400E] flex items-center gap-1.5 font-medium">
              <Clock className="w-3 h-3 text-[#D97706] shrink-0" />
              <span>
                Temporary chat session. Messages vanish automatically when the match ends.
              </span>
            </div>

            {/* Scrollable Message History */}
            <div className="p-3.5 space-y-2.5 max-h-[220px] overflow-y-auto bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#9CA3AF] space-y-1">
                  <p className="font-bold">No messages yet.</p>
                  <p className="text-[11px]">Say hi to your opponent or click a quick reaction below!</p>
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
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emoji Reactions Bar */}
            <div className="px-3 py-1.5 bg-white border-t border-[#E8E8E5] flex items-center gap-1 overflow-x-auto scrollbar-none">
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
            <div className="px-3 py-1.5 bg-[#F7F7F5] border-t border-[#E8E8E5] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
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
            <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-[#E8E8E5] flex items-center gap-2">
              <input
                type="text"
                maxLength={160}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message to opponent... (Enter to send)"
                className="flex-1 text-xs font-medium py-2 px-3 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#4F46E5] focus:bg-white focus:outline-hidden text-[#202124]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="py-2 px-3.5 rounded-xl font-bold text-xs bg-[#4F46E5] hover:bg-[#4338CA] text-white disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* Collapsed State: Quick Emoji Bar directly accessible without opening drawer */}
        {!isOpen && (
          <div className="p-2 bg-white flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {["Nice move! 🔥", "Thinking... 🤔", "Good game! 🎉", "👏", "😎", "🚀"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleQuickEmote(t)}
                  className="px-2 py-1 rounded-lg bg-[#F7F7F5] hover:bg-indigo-50 hover:text-indigo-600 text-[#4B5563] border border-[#E8E8E5] text-[11px] font-bold shrink-0 cursor-pointer active:scale-95 transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleToggleOpen}
              className="text-[11px] font-bold text-[#4F46E5] hover:underline shrink-0 px-2 cursor-pointer"
            >
              Open Full Chat 💬
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
