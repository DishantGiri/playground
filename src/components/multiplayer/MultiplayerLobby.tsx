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
  Sliders,
  Globe,
  Lock,
  Clock,
  Compass,
  Radio,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trophy,
  Crown,
} from "lucide-react";
import {
  MultiplayerGameType,
  MultiplayerRoom,
  CustomRoomOptions,
} from "@/lib/multiplayerStore";
import { MultiplayerHeader } from "./MultiplayerHeader";
import { QuickEmoteBar } from "./QuickEmoteBar";
import { OnlineNumberGuess } from "./OnlineNumberGuess";
import { OnlineTicTacToe } from "./OnlineTicTacToe";
import { OnlineReactionDuel } from "./OnlineReactionDuel";
import { OnlineConnectFour } from "./OnlineConnectFour";
import { OnlineMemoryDuel } from "./OnlineMemoryDuel";
import { OnlineDotsAndBoxes } from "./OnlineDotsAndBoxes";
import { OnlineNineMensMorris } from "./OnlineNineMensMorris";
import { sound } from "@/lib/audio";

interface Props {
  defaultGameType?: MultiplayerGameType;
  initialRoomCode?: string;
}

interface OpenRoomInfo {
  code: string;
  gameType: MultiplayerGameType;
  hostName: string;
  createdAt: number;
  customOptions?: CustomRoomOptions;
}

type GameCategory = "all" | "strategy" | "reflex" | "memory";

const AVAILABLE_GAMES: {
  id: MultiplayerGameType;
  title: string;
  description: string;
  icon: typeof Binary;
  badge: string;
  category: "strategy" | "reflex" | "memory";
}[] = [
  {
    id: "dots-and-boxes",
    title: "Dots & Boxes Duel",
    description: "Claim grid edges, complete squares, and earn extra turns across 2 screens!",
    icon: Grid3X3,
    badge: "Strategy 1v1",
    category: "strategy",
  },
  {
    id: "nine-mens-morris",
    title: "Nine Men's Morris",
    description: "Ancient 24-point tactical board duel. Form mills and capture enemy tokens!",
    icon: Crown,
    badge: "Board Strategy",
    category: "strategy",
  },
  {
    id: "connect-4",
    title: "Connect 4 Duel",
    description: "Drop colored discs into 7 columns and connect 4 in a line across 2 screens!",
    icon: CircleDot,
    badge: "Tactical 1v1",
    category: "strategy",
  },
  {
    id: "memory-duel",
    title: "Memory Card Duel",
    description: "Take turns flipping cards across 2 screens. Who can match the most pairs?",
    icon: Layers,
    badge: "Memory 1v1",
    category: "memory",
  },
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe Blitz",
    description: "Classic 3x3 tactical showdown across 2 phones or laptops. Real-time sync!",
    icon: Grid3X3,
    badge: "Fast 1v1",
    category: "strategy",
  },
  {
    id: "reaction-duel",
    title: "Reflex Tap Duel",
    description: "Wait for green and tap your screen! Fastest reaction time takes the trophy.",
    icon: Zap,
    badge: "Speed Test",
    category: "reflex",
  },
  {
    id: "number-guess",
    title: "Number Guess Duel",
    description: "Take turns guessing the secret number with hot/cold hints. 5 attempts each!",
    icon: Binary,
    badge: "Turn-Based",
    category: "memory",
  },
];

export function MultiplayerLobby({ defaultGameType = "dots-and-boxes", initialRoomCode = "" }: Props) {
  const [selectedGame, setSelectedGame] = useState<MultiplayerGameType>(defaultGameType);
  const [categoryFilter, setCategoryFilter] = useState<GameCategory>("all");

  // Player Names
  const [hostName, setHostName] = useState("Player 1");
  const [guestName, setGuestName] = useState("Player 2");
  const [joinCode, setJoinCode] = useState(initialRoomCode);

  // Custom Room Options
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [customRoomCode, setCustomRoomCode] = useState("");
  const [isPublicRoom, setIsPublicRoom] = useState(true);
  const [turnTimerSeconds, setTurnTimerSeconds] = useState<number>(0);
  const [dotsGridSize, setDotsGridSize] = useState<number>(3);
  const [memoryGridSize, setMemoryGridSize] = useState<string>("4x4");
  const [morrisFlyAllowed, setMorrisFlyAllowed] = useState(true);
  const [reactionTargetScore, setReactionTargetScore] = useState(3);
  const [numberGuessMaxAttempts, setNumberGuessMaxAttempts] = useState(5);

  // Live Matchmaking / Open Rooms
  const [openRooms, setOpenRooms] = useState<OpenRoomInfo[]>([]);
  const [isLoadingOpenRooms, setIsLoadingOpenRooms] = useState(false);
  const [isQuickMatching, setIsQuickMatching] = useState(false);

  // Active Session state
  const [activeRoom, setActiveRoom] = useState<MultiplayerRoom | null>(null);
  const [playerToken, setPlayerToken] = useState<string>("");
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lobbyRoomsPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Prepopulate saved player name from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("bored_player_name");
      if (savedName) {
        setHostName(savedName);
        setGuestName(savedName);
      }

      // Check query parameter ?room=...
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get("room");
      const gameFromUrl = urlParams.get("game") as MultiplayerGameType;
      if (codeFromUrl) {
        setJoinCode(codeFromUrl.toUpperCase());
      }
      if (gameFromUrl && AVAILABLE_GAMES.some((g) => g.id === gameFromUrl)) {
        setSelectedGame(gameFromUrl);
      }
    }
  }, []);

  const savePlayerName = (name: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bored_player_name", name);
    }
  };

  // Fetch Open Public Rooms
  const fetchOpenRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/multiplayer/room?mode=open");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.rooms)) {
        setOpenRooms(data.rooms);
      }
    } catch (err) {
      // ignore background poll errors
    }
  }, []);

  // Poll open rooms in lobby when NOT in an active room
  useEffect(() => {
    if (!activeRoom) {
      fetchOpenRooms();
      lobbyRoomsPollingRef.current = setInterval(fetchOpenRooms, 2500);
    }
    return () => {
      if (lobbyRoomsPollingRef.current) clearInterval(lobbyRoomsPollingRef.current);
    };
  }, [activeRoom, fetchOpenRooms]);

  // Poll active room state every 600ms
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
  const handleCreateRoom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    sound.playClick();
    savePlayerName(hostName);

    const customOptions: CustomRoomOptions = {
      isPublic: isPublicRoom,
      timerSeconds: turnTimerSeconds,
      dotsGridSize,
      memoryGridSize,
      morrisFlyAllowed,
      reactionTargetScore,
      numberGuessMaxAttempts,
    };

    try {
      const res = await fetch("/api/multiplayer/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: selectedGame,
          playerName: hostName || "Player 1",
          preferredCode: customRoomCode.trim() ? customRoomCode.trim().toUpperCase() : undefined,
          customOptions,
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

  // Join room by code
  const handleJoinRoom = async (codeToJoin?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    const targetCode = (codeToJoin || joinCode).trim().toUpperCase();

    if (!targetCode) {
      setErrorMessage("Please enter a room code");
      return;
    }

    setIsLoading(true);
    sound.playClick();
    savePlayerName(guestName);

    try {
      const res = await fetch("/api/multiplayer/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: targetCode,
          playerName: guestName || "Player 2",
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

  // ⚡ Quick Match: Play with Live Player
  const handleQuickMatch = async () => {
    setIsQuickMatching(true);
    setErrorMessage("");
    sound.playClick();

    try {
      // 1. Fetch fresh open rooms
      const res = await fetch("/api/multiplayer/room?mode=open");
      const data = await res.json();
      const rooms: OpenRoomInfo[] = data.rooms || [];

      // Find matching game room first, or any open room
      const matching = rooms.find((r) => r.gameType === selectedGame) || rooms[0];

      if (matching) {
        // Join immediately!
        await handleJoinRoom(matching.code);
      } else {
        // No room waiting: create a public room for others to join!
        setIsPublicRoom(true);
        await handleCreateRoom();
      }
    } catch (err) {
      setErrorMessage("Matchmaking error. Please try again.");
    } finally {
      setIsQuickMatching(false);
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
        setTimeout(() => setErrorMessage(""), 3500);
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

  // Filter games
  const filteredGames = AVAILABLE_GAMES.filter((g) => {
    if (categoryFilter === "all") return true;
    return g.category === categoryFilter;
  });

  // If in an active room, render live match UI
  if (activeRoom) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold text-center animate-in fade-in">
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

        {activeRoom.gameType === "dots-and-boxes" && (
          <OnlineDotsAndBoxes
            room={activeRoom}
            playerNumber={playerNumber}
            onAction={handleGameAction}
            isSubmitting={isSubmittingAction}
          />
        )}

        {activeRoom.gameType === "nine-mens-morris" && (
          <OnlineNineMensMorris
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

        {activeRoom.gameType === "tic-tac-toe" && (
          <OnlineTicTacToe
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

        {activeRoom.gameType === "number-guess" && (
          <OnlineNumberGuess
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

  // Otherwise, render Full Multiplayer Lobby
  return (
    <div className="w-full min-w-0 space-y-5 select-none text-[#202124]">
      {/* Top Matchmaking Quick Bar */}
      <div className="rounded-2xl border border-[#E8E8E5] bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 p-4 sm:p-5 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
              Live Cross-Device Matchmaking
            </span>
            {openRooms.length > 0 && (
              <span className="text-[11px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                {openRooms.length} Waiting
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Play with Live Players Worldwide
          </h2>
          <p className="text-xs text-white/90">
            Instantly pair with any active opponent, or create a custom room with your rules.
          </p>
        </div>

        <button
          onClick={handleQuickMatch}
          disabled={isQuickMatching || isLoading}
          className="shrink-0 py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-[#C2410C] bg-white hover:bg-orange-50 active:scale-95 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 fill-current text-orange-500" />
          <span>{isQuickMatching ? "Finding Opponent..." : "⚡ Quick Match / Find Live Player"}</span>
        </button>
      </div>

      {/* 2-Card Full-Width Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 w-full items-stretch">
        {/* Left Card: Create New Room (Host Game) */}
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

              {/* Host Name Input */}
              <div>
                <label className="block text-xs font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                  Your Player Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full text-sm font-bold py-3 px-4 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#F97316] focus:bg-white focus:outline-hidden transition-all text-[#202124]"
                />
              </div>

              {/* Category Filter Pills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    Choose Game Duel ({AVAILABLE_GAMES.length} Available)
                  </label>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "All Duels" },
                    { id: "strategy", label: "Strategy & Board" },
                    { id: "reflex", label: "Speed & Reflex" },
                    { id: "memory", label: "Memory & Mind" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setCategoryFilter(cat.id as GameCategory);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        categoryFilter === cat.id
                          ? "bg-[#202124] text-white"
                          : "bg-[#F7F7F5] text-[#6B7280] hover:bg-[#E8E8E5] border border-[#E8E8E5]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Cards List */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {filteredGames.map((game) => {
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
                          ? "border-[#F97316] bg-[#FFF7ED] shadow-2xs ring-2 ring-orange-400/20"
                          : "border-[#E8E8E5] bg-[#F7F7F5] hover:border-[#D1D5DB] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
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
                          <div className="flex items-center gap-1.5 flex-wrap">
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

              {/* ⚙️ Custom Room Options Accordion */}
              <div className="rounded-xl border border-[#E8E8E5] bg-[#F7F7F5] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowCustomOptions(!showCustomOptions)}
                  className="w-full p-3 flex items-center justify-between font-bold text-xs text-[#202124] hover:bg-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#F97316]" />
                    <span>⚙️ Custom Room Options & Settings</span>
                    <span className="text-[10px] font-normal text-[#6B7280]">
                      ({isPublicRoom ? "Public" : "Private"},{" "}
                      {turnTimerSeconds > 0 ? `${turnTimerSeconds}s Timer` : "No Timer"})
                    </span>
                  </div>
                  {showCustomOptions ? (
                    <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                  )}
                </button>

                {showCustomOptions && (
                  <div className="p-3.5 pt-2 border-t border-[#E8E8E5] space-y-3.5 bg-white text-xs">
                    {/* Preferred Custom Code */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#6B7280] mb-1 uppercase tracking-wider">
                        Custom Room Code (Optional)
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={customRoomCode}
                        onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase())}
                        placeholder="e.g. EPIC, 7777, ACE (Leave empty for random)"
                        className="w-full text-xs font-mono font-bold py-2 px-3 rounded-lg bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#F97316] focus:outline-hidden uppercase"
                      />
                    </div>

                    {/* Room Visibility Toggle */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                        Room Visibility
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPublicRoom(true)}
                          className={`p-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                            isPublicRoom
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "bg-[#F7F7F5] border-[#E8E8E5] text-[#6B7280]"
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Public (Live Players)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsPublicRoom(false)}
                          className={`p-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                            !isPublicRoom
                              ? "bg-amber-50 border-amber-300 text-amber-800"
                              : "bg-[#F7F7F5] border-[#E8E8E5] text-[#6B7280]"
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Private (Code Only)</span>
                        </button>
                      </div>
                    </div>

                    {/* Turn Timer */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                        Turn Timer
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { val: 0, label: "Unlimited" },
                          { val: 15, label: "15s Blitz" },
                          { val: 30, label: "30s Fast" },
                          { val: 60, label: "60s Normal" },
                        ].map((t) => (
                          <button
                            key={t.val}
                            type="button"
                            onClick={() => setTurnTimerSeconds(t.val)}
                            className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                              turnTimerSeconds === t.val
                                ? "bg-[#F97316] text-white border-[#EA580C]"
                                : "bg-[#F7F7F5] border-[#E8E8E5] text-[#6B7280]"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Game-specific modifiers */}
                    {selectedGame === "dots-and-boxes" && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                          Dots Grid Size
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { val: 3, label: "3x3 (4 Squares)" },
                            { val: 4, label: "4x4 (9 Squares)" },
                            { val: 5, label: "5x5 (16 Squares)" },
                          ].map((g) => (
                            <button
                              key={g.val}
                              type="button"
                              onClick={() => setDotsGridSize(g.val)}
                              className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                                dotsGridSize === g.val
                                  ? "bg-[#F97316] text-white border-[#EA580C]"
                                  : "bg-[#F7F7F5] border-[#E8E8E5] text-[#6B7280]"
                              }`}
                            >
                              {g.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedGame === "memory-duel" && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                          Memory Card Deck Size
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { val: "3x4", label: "6 Pairs (12 Cards)" },
                            { val: "4x4", label: "8 Pairs (16 Cards)" },
                            { val: "4x6", label: "12 Pairs (24 Cards)" },
                          ].map((m) => (
                            <button
                              key={m.val}
                              type="button"
                              onClick={() => setMemoryGridSize(m.val)}
                              className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                                memoryGridSize === m.val
                                  ? "bg-[#F97316] text-white border-[#EA580C]"
                                  : "bg-[#F7F7F5] border-[#E8E8E5] text-[#6B7280]"
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedGame === "nine-mens-morris" && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                          Flying Phase (Phase 3)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setMorrisFlyAllowed(true)}
                            className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                              morrisFlyAllowed
                                ? "bg-cyan-500 text-white border-cyan-600"
                                : "bg-[#F7F7F5] border-[#E8E8E5] text-[#6B7280]"
                            }`}
                          >
                            Enabled (Fly at 3 pieces)
                          </button>
                          <button
                            type="button"
                            onClick={() => setMorrisFlyAllowed(false)}
                            className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                              !morrisFlyAllowed
                                ? "bg-slate-700 text-white border-slate-800"
                                : "bg-[#F7F7F5] border-[#E8E8E5] text-[#6B7280]"
                            }`}
                          >
                            Classic (Adjacent only)
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedGame === "reaction-duel" && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                          Winning Target Score
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[3, 5, 7].map((pts) => (
                            <button
                              key={pts}
                              type="button"
                              onClick={() => setReactionTargetScore(pts)}
                              className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                                reactionTargetScore === pts
                                  ? "bg-[#F97316] text-white border-[#EA580C]"
                                  : "bg-[#F7F7F5] border-[#E8E8E5] text-[#6B7280]"
                              }`}
                            >
                              First to {pts}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedGame === "number-guess" && (
                      <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                          Max Guess Attempts
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[5, 7, 10].map((att) => (
                            <button
                              key={att}
                              type="button"
                              onClick={() => setNumberGuessMaxAttempts(att)}
                              className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                                numberGuessMaxAttempts === att
                                  ? "bg-[#F97316] text-white border-[#EA580C]"
                                  : "bg-[#F7F7F5] border-[#E8E8E5] text-[#6B7280]"
                              }`}
                            >
                              {att} Attempts
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !hostName}
              className="w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Generating Room..." : "Create Room & Host Match"}</span>
            </button>
          </form>
        </div>

        {/* Right Card: Join Duel & Open Public Rooms Browser */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6366F1] bg-[#EEF2FF] border border-[#C7D2FE] px-2 py-0.5 rounded-lg">
                  Join Duel
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                  Enter Room Code
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

            <form onSubmit={(e) => handleJoinRoom(undefined, e)} className="space-y-3.5">
              {/* Room Code Input */}
              <div>
                <label className="block text-xs font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                  Room Code (4-8 Characters)
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 4829 or EPIC"
                  className="w-full text-center text-3xl font-black tracking-widest py-3 px-4 rounded-xl bg-[#F7F7F5] border-2 border-[#E8E8E5] focus:border-[#6366F1] focus:bg-white focus:outline-hidden transition-all text-[#202124] uppercase font-mono"
                />
                <p className="text-[11px] text-[#6B7280] mt-1.5 text-center">
                  Get this code from the host player on another phone or laptop.
                </p>
              </div>

              {/* Player 2 Name Input */}
              <div>
                <label className="block text-xs font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                  Your Player Name (Player 2)
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Sam"
                  className="w-full text-sm font-bold py-3 px-4 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#6366F1] focus:bg-white focus:outline-hidden transition-all text-[#202124]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !joinCode || !guestName}
                className="w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-50 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? "Connecting Devices..." : "Connect & Join Duel"}</span>
              </button>
            </form>

            {/* 🌐 Open Live Rooms List */}
            <div className="border-t border-[#E8E8E5] pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#202124]">
                    🌐 Open Live Rooms ({openRooms.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchOpenRooms}
                  className="p-1 rounded-md text-[#6B7280] hover:text-[#202124] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                  title="Refresh open rooms"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {openRooms.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F7F7F5] border border-dashed border-[#CBD5E1] text-center space-y-1">
                  <p className="text-xs font-bold text-[#6B7280]">
                    No live players currently waiting.
                  </p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    Create a public room on the left, or click Quick Match to be first!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {openRooms.map((r) => {
                    const gameObj = AVAILABLE_GAMES.find((g) => g.id === r.gameType);
                    const Icon = gameObj?.icon || Swords;
                    return (
                      <div
                        key={r.code}
                        className="p-2.5 rounded-xl border border-[#E8E8E5] bg-[#F7F7F5] flex items-center justify-between gap-3 hover:bg-white hover:border-[#CBD5E1] transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-left min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#202124] truncate">
                                {gameObj?.title || r.gameType}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-[#6366F1] bg-[#EEF2FF] px-1.5 py-0.2 rounded border border-[#C7D2FE]">
                                {r.code}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#6B7280]">
                              Host: <strong className="text-[#202124]">{r.hostName}</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleJoinRoom(r.code)}
                          disabled={isLoading}
                          className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Join</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* How 2-Device Arena Works */}
          <div className="bg-[#F7F7F5] border border-[#E8E8E5] rounded-xl p-3.5 text-xs text-[#202124] space-y-1.5 mt-2">
            <div className="font-bold text-[#202124] flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="text-xs">How 2-Device Play Works:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[#6B7280] text-[11px] leading-relaxed">
              <li><strong>Device 1:</strong> Select any game and click &ldquo;Create Room&rdquo;.</li>
              <li><strong>Device 2:</strong> Type the code or click &ldquo;Join&rdquo; from the live list.</li>
              <li><strong>Play Instantly:</strong> Both devices sync moves in real-time!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
