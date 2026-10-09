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
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Cross-Device 2-Player Arena</span>
          <Laptop className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Play From 2 Different Devices
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Create a room code on one device and enter it on a second phone or laptop to play together live in real-time!
        </p>
      </div>

      {/* Tabs: Create Room vs Join Room */}
      <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 flex">
        <button
          onClick={() => {
            sound.playClick();
            setTab("create");
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            tab === "create"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Plus className="w-4 h-4 text-violet-600" />
          <span>Create New Room</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setTab("join");
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            tab === "join"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <LogIn className="w-4 h-4 text-indigo-600" />
          <span>Join Existing Room</span>
        </button>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold text-center">
          {errorMessage}
        </div>
      )}

      {/* Tab: Create Room */}
      {tab === "create" && (
        <form onSubmit={handleCreateRoom} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          {/* Player Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Player Name:
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full text-sm font-semibold py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-violet-600 focus:bg-white focus:outline-hidden transition-all text-slate-900"
            />
          </div>

          {/* Select Game */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Select Game Mode:
            </label>
            <div className="grid grid-cols-1 gap-2.5">
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
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-violet-600 bg-violet-50/50 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isSelected
                            ? "bg-violet-600 text-white border-violet-700"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{game.title}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {game.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{game.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4x6 Board Info for Memory Duel */}
          {selectedGame === "memory-duel" && (
            <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-200 text-xs font-bold text-violet-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-ping" />
                <span>4x6 Card Arena (24 Cards • 6 on X-axis • 12 Illustrated Pairs)</span>
              </div>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-white text-violet-700 border border-violet-200">
                4x6
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !playerName}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 shadow-md shadow-violet-200 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? "Generating Room..." : "Create Room & Get Code"}</span>
          </button>
        </form>
      )}

      {/* Tab: Join Room */}
      {tab === "join" && (
        <form onSubmit={handleJoinRoom} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          {/* Room Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Enter 4-Digit Room Code:
            </label>
            <input
              type="text"
              required
              maxLength={8}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. 4829"
              className="w-full text-center text-2xl font-black tracking-widest py-3 px-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-hidden transition-all text-slate-900 uppercase"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Ask Player 1 on the other device for their Room Code or link.
            </p>
          </div>

          {/* Player Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Player Name:
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Sam"
              className="w-full text-sm font-semibold py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white focus:outline-hidden transition-all text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !joinCode || !playerName}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? "Connecting Devices..." : "Join Game Duel"}</span>
          </button>
        </form>
      )}

      {/* How it works info */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Wifi className="w-4 h-4 text-emerald-600" />
          <span>How to Play from 2 Devices:</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-slate-500 text-[11px]">
          <li><strong>Device 1 (e.g. your laptop or phone):</strong> Tap &ldquo;Create New Room&rdquo; to get a 4-digit code.</li>
          <li><strong>Device 2 (e.g. your second phone or friend&apos;s phone):</strong> Open this page and enter the code.</li>
          <li><strong>Real-Time Sync:</strong> Both screens synchronize moves, scores, and turns instantly!</li>
        </ol>
      </div>
    </div>
  );
}
