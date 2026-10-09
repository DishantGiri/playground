"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Swords,
  Users,
  Smartphone,
  Laptop,
  Plus,
  LogIn,
  Binary,
  Grid3X3,
  Zap,
  CircleDot,
  Layers,
  ArrowRight,
  Shield,
  Sparkles,
  Wifi,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { MultiplayerGameType, MultiplayerRoom } from "@/lib/multiplayerStore";
import { MultiplayerHeader } from "./MultiplayerHeader";
import { QuickEmoteBar } from "./QuickEmoteBar";
import { OnlineNumberGuess } from "./OnlineNumberGuess";
import { OnlineTicTacToe } from "./OnlineTicTacToe";
import { OnlineReactionDuel } from "./OnlineReactionDuel";
import { OnlineConnectFour } from "./OnlineConnectFour";
import { OnlineMemoryDuel } from "./OnlineMemoryDuel";
import { sound } from "@/lib/audio";

interface Props {
  defaultGameType?: MultiplayerGameType;
  initialRoomCode?: string;
}

const AVAILABLE_GAMES: {
  id: MultiplayerGameType;
  title: string;
  description: string;
  icon: typeof Binary;
  badge: string;
}[] = [
  {
    id: "memory-duel",
    title: "Memory Card Duel",
    description: "Take turns flipping cards across 2 screens. Who can remember and match the most pairs?",
    icon: Layers,
    badge: "Memory 1v1",
  },
  {
    id: "connect-4",
    title: "Connect 4 Duel",
    description: "Drop colored discs into 7 columns and connect 4 in a line across 2 screens!",
    icon: CircleDot,
    badge: "Tactical 1v1",
  },
  {
    id: "number-guess",
    title: "Number Guess Duel",
    description: "Take turns guessing the secret number with hot/cold hints. 5 attempts each!",
    icon: Binary,
    badge: "Turn-Based",
  },
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe Blitz",
    description: "Classic 3x3 tactical showdown across 2 phones or laptops. Real-time sync!",
    icon: Grid3X3,
    badge: "Fast 1v1",
  },
  {
    id: "reaction-duel",
    title: "Reflex Tap Duel",
    description: "Wait for green and tap your screen! Fastest reaction time takes the trophy.",
    icon: Zap,
    badge: "Speed Test",
  },
];

export function MultiplayerLobby({ defaultGameType = "number-guess", initialRoomCode = "" }: Props) {
  const [tab, setTab] = useState<"create" | "join">(initialRoomCode ? "join" : "create");
  const [selectedGame, setSelectedGame] = useState<MultiplayerGameType>(defaultGameType);
  const [playerName, setPlayerName] = useState("Player 1");
  const [joinCode, setJoinCode] = useState(initialRoomCode);
  const [memoryGridSize, setMemoryGridSize] = useState<string>("4x4");

  // Active Session state
  const [activeRoom, setActiveRoom] = useState<MultiplayerRoom | null>(null);
  const [playerToken, setPlayerToken] = useState<string>("");
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Prepopulate saved player name from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("bored_player_name");
      if (savedName) setPlayerName(savedName);

      // Check query parameter ?room=...
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get("room");
      if (codeFromUrl) {
        setJoinCode(codeFromUrl.toUpperCase());
        setTab("join");
      }
    }
  }, []);

  const savePlayerName = (name: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bored_player_name", name);
    }
  };

  // Poll room updates every 600ms
  const pollRoomState = useCallback(async (code: string, token: string) => {
    try {
      const res = await fetch(`/api/multiplayer/room/${code}?token=${token}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.room) {
        setActiveRoom(data.room);
        if (data.playerNumber) {
          setPlayerNumber(data.playerNumber);
        }
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, []);

  useEffect(() => {
    if (activeRoom && playerToken) {
      pollingRef.current = setInterval(() => {
        pollRoomState(activeRoom.code, playerToken);
      }, 600);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeRoom?.code, playerToken, pollRoomState]);

  // Create room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    sound.playClick();
    savePlayerName(playerName);

    try {
      const res = await fetch("/api/multiplayer/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: selectedGame,
          playerName: playerName || "Player 1",
          config: selectedGame === "memory-duel" ? { gridSize: memoryGridSize } : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveRoom(data.room);
        setPlayerToken(data.playerToken);
        setPlayerNumber(1);
      } else {
        setErrorMessage(data.error || "Failed to create room");
      }
    } catch (err) {
      setErrorMessage("Network error creating room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Join room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!joinCode.trim()) {
      setErrorMessage("Please enter a room code");
      return;
    }

    setIsLoading(true);
    sound.playClick();
    savePlayerName(playerName);

    try {
      const res = await fetch("/api/multiplayer/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: joinCode.trim().toUpperCase(),
          playerName: playerName || "Player 2",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveRoom(data.room);
        setPlayerToken(data.playerToken);
        setPlayerNumber(2);
      } else {
        setErrorMessage(data.error || "Failed to join room");
      }
    } catch (err) {
      setErrorMessage("Network error joining room. Please check the code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Action dispatch
  const handleGameAction = async (action: string, payload?: any) => {
    if (!activeRoom || !playerToken) return;
    setIsSubmittingAction(true);
    try {
      const res = await fetch(`/api/multiplayer/room/${activeRoom.code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerToken,
          action,
          payload,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setActiveRoom(data.room);
      } else if (data.error) {
        setErrorMessage(data.error);
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (err) {
      console.error("Action error:", err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Leave room
  const handleLeaveRoom = () => {
    sound.playClick();
    if (pollingRef.current) clearInterval(pollingRef.current);
    setActiveRoom(null);
    setPlayerToken("");
    setErrorMessage("");
  };

  // If in an active room, show match UI
  if (activeRoom) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <MultiplayerHeader
          room={activeRoom}
          playerNumber={playerNumber}
          playerToken={playerToken}
          onLeave={handleLeaveRoom}
          onRematch={() => handleGameAction("rematch")}
        />

        {activeRoom.gameType === "number-guess" && (
          <OnlineNumberGuess
            room={activeRoom}
            playerNumber={playerNumber}
            onAction={handleGameAction}
            isSubmitting={isSubmittingAction}
          />
        )}

        {activeRoom.gameType === "tic-tac-toe" && (
          <OnlineTicTacToe
            room={activeRoom}
            playerNumber={playerNumber}
            onAction={handleGameAction}
            isSubmitting={isSubmittingAction}
          />
        )}

        {activeRoom.gameType === "connect-4" && (
          <OnlineConnectFour
            room={activeRoom}
            playerNumber={playerNumber}
            onAction={handleGameAction}
            isSubmitting={isSubmittingAction}
          />
        )}

        {activeRoom.gameType === "memory-duel" && (
          <OnlineMemoryDuel
            room={activeRoom}
            playerNumber={playerNumber}
            onAction={handleGameAction}
            isSubmitting={isSubmittingAction}
          />
        )}

        {activeRoom.gameType === "reaction-duel" && (
          <OnlineReactionDuel
            room={activeRoom}
            playerNumber={playerNumber}
            onAction={handleGameAction}
            isSubmitting={isSubmittingAction}
          />
        )}

        <QuickEmoteBar
          messages={activeRoom.messages}
          playerNumber={playerNumber}
          onSendMessage={(text) => handleGameAction("send_message", { text })}
        />
      </div>
    );
  }

  // Otherwise, render Room Setup Lobby
  return (
    <div className="w-full min-w-0 rounded-2xl sm:rounded-3xl border border-[#E8E8E5] bg-[#F7F7F5] p-3 sm:p-4 lg:p-5 shadow-2xs select-none text-[#202124]">
      {/* 2-Card Full-Width Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 w-full items-stretch">
        
        {/* Left Card: Create New Room (Host) */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          <form onSubmit={handleCreateRoom} className="space-y-4 flex flex-col justify-between flex-1">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
                    Host Game
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                    Create New Room
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316] shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
              </div>

              {/* Player Name */}
              <div>
                <label className="block text-xs font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                  Your Player Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full text-sm font-bold py-3 px-4 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#F97316] focus:bg-white focus:outline-hidden transition-all text-[#202124]"
                />
              </div>

              {/* Select Game */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  Choose Game Duel
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {AVAILABLE_GAMES.map((game) => {
                    const Icon = game.icon;
                    const isSelected = selectedGame === game.id;
                    return (
                      <div
                        key={game.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedGame(game.id);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-[#F97316] bg-[#FFF7ED] shadow-2xs"
                            : "border-[#E8E8E5] bg-[#F7F7F5] hover:border-[#D1D5DB] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${
                              isSelected
                                ? "bg-[#F97316] text-white border-[#EA580C]"
                                : "bg-white text-[#6B7280] border-[#E8E8E5]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-left min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-bold text-[#202124] truncate">
                                {game.title}
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white text-[#6B7280] border border-[#E8E8E5] shrink-0">
                                {game.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-1">
                              {game.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !playerName}
              className="w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Generating Room..." : "Create Room & Get 4-Digit Code"}</span>
            </button>
          </form>
        </div>

        {/* Right Card: Join Room & How to Play (Guest) */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          
          <form onSubmit={handleJoinRoom} className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6366F1] bg-[#EEF2FF] border border-[#C7D2FE] px-2 py-0.5 rounded-lg">
                  Join Duel
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                  Enter 4-Digit Code
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#6366F1] shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
            </div>

            {/* Error banner if present */}
            {errorMessage && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] rounded-xl text-xs font-semibold text-center animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* Room Code Input */}
            <div>
              <label className="block text-xs font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                Enter Room Code
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. 4829"
                className="w-full text-center text-3xl font-black tracking-widest py-3 px-4 rounded-xl bg-[#F7F7F5] border-2 border-[#E8E8E5] focus:border-[#6366F1] focus:bg-white focus:outline-hidden transition-all text-[#202124] uppercase font-mono"
              />
              <p className="text-[11px] text-[#6B7280] mt-1.5 text-center">
                Get this 4-digit code from Player 1 on the other phone or laptop.
              </p>
            </div>

            {/* Player Name Input */}
            <div>
              <label className="block text-xs font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                Your Player Name (Player 2)
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Sam"
                className="w-full text-sm font-bold py-3 px-4 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#6366F1] focus:bg-white focus:outline-hidden transition-all text-[#202124]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !joinCode || !playerName}
              className="w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-50 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? "Connecting Devices..." : "Connect & Join Duel"}</span>
            </button>
          </form>

          {/* How 2-Device Arena Works */}
          <div className="bg-[#F7F7F5] border border-[#E8E8E5] rounded-xl p-4 text-xs text-[#202124] space-y-2 mt-4">
            <div className="font-bold text-[#202124] flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-[#16A34A]" />
              <span>How 2-Device Play Works:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[#6B7280] text-[11px] leading-relaxed">
              <li><strong>Device 1:</strong> Select a game and click &ldquo;Create Room&rdquo; to get your 4-digit code.</li>
              <li><strong>Device 2:</strong> Type the code into the box above and click &ldquo;Connect&rdquo;.</li>
              <li><strong>Play Together:</strong> Both screens sync moves, cards, and turns instantly in real-time!</li>
            </ol>
          </div>

        </div>

      </div>
    </div>
  );
}
