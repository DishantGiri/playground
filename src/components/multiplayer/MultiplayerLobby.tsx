"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Bot,
  Search,
  Play,
  Share2,
} from "lucide-react";
import {
  MultiplayerGameType,
  MultiplayerRoom,
  CustomRoomOptions,
} from "@/lib/multiplayerStore";
import { MultiplayerHeader } from "./MultiplayerHeader";
import { TemporaryGameChat } from "./TemporaryGameChat";
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
  initialMode?: "random" | "friends" | "ai";
}

interface OpenRoomInfo {
  code: string;
  gameType: MultiplayerGameType;
  hostName: string;
  createdAt: number;
  customOptions?: CustomRoomOptions;
}

type GameCategory = "all" | "strategy" | "reflex" | "memory";
export type LobbyPlayMode = "random" | "friends" | "ai";

export const AVAILABLE_GAMES: {
  id: MultiplayerGameType;
  title: string;
  description: string;
  icon: typeof Binary;
  badge: string;
  category: "strategy" | "reflex" | "memory";
  slug: string;
}[] = [
  {
    id: "dots-and-boxes",
    title: "Dots & Boxes Duel",
    description: "Claim grid edges, complete squares, and earn extra turns across 2 screens!",
    icon: Grid3X3,
    badge: "Strategy 1v1",
    category: "strategy",
    slug: "dots-and-boxes",
  },
  {
    id: "nine-mens-morris",
    title: "Nine Men's Morris",
    description: "Ancient 24-point tactical board duel. Form mills and capture enemy tokens!",
    icon: Crown,
    badge: "Board Strategy",
    category: "strategy",
    slug: "nine-mens-morris",
  },
  {
    id: "connect-4",
    title: "Connect 4 Duel",
    description: "Drop colored discs into 7 columns and connect 4 in a line across 2 screens!",
    icon: CircleDot,
    badge: "Tactical 1v1",
    category: "strategy",
    slug: "connect-4",
  },
  {
    id: "memory-duel",
    title: "Memory Card Duel",
    description: "Take turns flipping cards across 2 screens. Who can match the most pairs?",
    icon: Layers,
    badge: "Memory 1v1",
    category: "memory",
    slug: "memory-game",
  },
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe Blitz",
    description: "Classic 3x3 tactical showdown across 2 phones or laptops. Real-time sync!",
    icon: Grid3X3,
    badge: "Fast 1v1",
    category: "strategy",
    slug: "dots-and-boxes",
  },
  {
    id: "reaction-duel",
    title: "Reflex Tap Duel",
    description: "Wait for green and tap your screen! Fastest reaction time takes the trophy.",
    icon: Zap,
    badge: "Speed Test",
    category: "reflex",
    slug: "reaction-test",
  },
  {
    id: "number-guess",
    title: "Number Guess Duel",
    description: "Take turns guessing the secret number with hot/cold hints. 5 attempts each!",
    icon: Binary,
    badge: "Turn-Based",
    category: "memory",
    slug: "number-guess",
  },
];

export function MultiplayerLobby({
  defaultGameType = "dots-and-boxes",
  initialRoomCode = "",
  initialMode = "random",
}: Props) {
  const router = useRouter();

  // Selected Game & Selected Play Mode
  const [selectedGame, setSelectedGame] = useState<MultiplayerGameType>(defaultGameType);
  const [playMode, setPlayMode] = useState<LobbyPlayMode>(initialMode);
  const [categoryFilter, setCategoryFilter] = useState<GameCategory>("all");
  const [gameSearchQuery, setGameSearchQuery] = useState("");

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

  // Live Matchmaking / Open Rooms for Selected Game
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

  const activeGameMeta =
    AVAILABLE_GAMES.find((g) => g.id === selectedGame) || AVAILABLE_GAMES[0];

  // Prepopulate saved player name from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("bored_player_name");
      if (savedName) {
        setHostName(savedName);
        setGuestName(savedName);
      }

      // Check query parameter ?room=... and ?mode=...
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get("room");
      const gameFromUrl = urlParams.get("game") as MultiplayerGameType;
      const modeFromUrl = urlParams.get("mode") as LobbyPlayMode;

      if (codeFromUrl) {
        setJoinCode(codeFromUrl.toUpperCase());
        setPlayMode("friends");
      }
      if (gameFromUrl && AVAILABLE_GAMES.some((g) => g.id === gameFromUrl)) {
        setSelectedGame(gameFromUrl);
      }
      if (modeFromUrl && ["random", "friends", "ai"].includes(modeFromUrl)) {
        setPlayMode(modeFromUrl);
      }
    }
  }, []);

  const savePlayerName = (name: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bored_player_name", name);
    }
  };

  // Fetch Open Public Rooms (Optionally filtered for selectedGame)
  const fetchOpenRooms = useCallback(async () => {
    try {
      const res = await fetch(`/api/multiplayer/room?mode=open&gameType=${selectedGame}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.rooms)) {
        setOpenRooms(data.rooms);
      }
    } catch (err) {
      // ignore poll network errors
    }
  }, [selectedGame]);

  // Poll open rooms in lobby every 2.5s
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

  // Create room (Host)
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

  // ⚡ Play with Random Live for THIS GAME ONLY
  const handleRandomLiveMatch = async () => {
    setIsQuickMatching(true);
    setErrorMessage("");
    sound.playClick();
    const myName = guestName || hostName || "Player";
    savePlayerName(myName);

    try {
      const res = await fetch("/api/multiplayer/matchmake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType: selectedGame,
          playerName: myName,
        }),
      });

      const data = await res.json();
      if (data.success && data.room) {
        setActiveRoom(data.room);
        setPlayerToken(data.playerToken);
        setPlayerNumber(data.playerNumber);
      } else {
        setErrorMessage(data.error || "Matchmaking failed. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Network error during matchmaking. Please try again.");
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

  // Filter games by category and search term
  const filteredGames = AVAILABLE_GAMES.filter((g) => {
    const matchesCategory = categoryFilter === "all" || g.category === categoryFilter;
    const matchesSearch =
      !gameSearchQuery.trim() ||
      g.title.toLowerCase().includes(gameSearchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(gameSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter open rooms for selected game only
  const gameSpecificOpenRooms = openRooms.filter((r) => r.gameType === selectedGame);

  // If in an active room, render live match UI with TemporaryGameChat
  if (activeRoom) {
    const p1 = activeRoom.players.find((p) => p.playerNumber === 1);
    const p2 = activeRoom.players.find((p) => p.playerNumber === 2);
    const myName = playerNumber === 1 ? p1?.name || "You" : p2?.name || "You";
    const opponentName = playerNumber === 1 ? p2?.name || "Opponent" : p1?.name || "Opponent";

    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold text-center animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* 1. TOP: Level / Mode / Room Controls */}
        <MultiplayerHeader
          room={activeRoom}
          playerNumber={playerNumber}
          playerToken={playerToken}
          onLeave={handleLeaveRoom}
          onRematch={() => handleGameAction("rematch")}
        />

        {/* 2. MAIN ARENA: Game on Left, In-Game Ephemeral Chat on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-8 space-y-4">
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
          </div>

          {/* Right Panel: Docked Live Ephemeral Chat */}
          <div className="lg:col-span-4 sticky top-4">
            <TemporaryGameChat
              messages={activeRoom.messages}
              playerNumber={playerNumber}
              playerName={myName}
              opponentName={opponentName}
              onSendMessage={(text) => handleGameAction("send_chat", { text })}
              defaultOpen={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render Full Unified Game Lobby
  const GameIcon = activeGameMeta.icon;

  return (
    <div className="w-full min-w-0 space-y-5 select-none text-[#202124]">
      {/* 1. Game Selection & Search Filter Bar */}
      <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
              Step 1 • Select Game
            </span>
            <h2 className="text-lg sm:text-xl font-black text-[#202124] mt-1">
              Choose Duel: <span className="text-[#F97316]">{activeGameMeta.title}</span>
            </h2>
          </div>

          {/* Search Input for Game */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={gameSearchQuery}
              onChange={(e) => setGameSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#F97316] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Horizontal Scrollable Game Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filteredGames.map((game) => {
            const Icon = game.icon;
            const isSelected = selectedGame === game.id;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedGame(game.id);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? "bg-[#202124] text-white border-[#202124] shadow-xs"
                    : "bg-[#F7F7F5] text-[#6B7280] hover:bg-[#E8E8E5] border-[#E8E8E5]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#F97316]" : ""}`} />
                <span>{game.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Step 2: Unified 3-Mode Selector for Selected Game */}
      <div className="rounded-2xl border border-[#E8E8E5] bg-white p-2 sm:p-2.5 shadow-xs">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {/* Mode 1: Play with AI */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setPlayMode("ai");
            }}
            className={`py-3 px-2 sm:px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              playMode === "ai"
                ? "bg-[#6366F1] text-white shadow-xs scale-[1.01]"
                : "bg-[#F7F7F5] text-[#6B7280] hover:bg-[#EEF2FF] hover:text-[#6366F1]"
            }`}
          >
            <Bot className="w-4 h-4 shrink-0" />
            <span className="truncate">🤖 Play with AI</span>
          </button>

          {/* Mode 2: Play with Friends */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setPlayMode("friends");
            }}
            className={`py-3 px-2 sm:px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              playMode === "friends"
                ? "bg-[#F97316] text-white shadow-xs scale-[1.01]"
                : "bg-[#F7F7F5] text-[#6B7280] hover:bg-[#FFF7ED] hover:text-[#F97316]"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">👥 Play with Friends</span>
          </button>

          {/* Mode 3: Play with Random Live */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setPlayMode("random");
            }}
            className={`py-3 px-2 sm:px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              playMode === "random"
                ? "bg-[#16A34A] text-white shadow-xs scale-[1.01]"
                : "bg-[#F7F7F5] text-[#6B7280] hover:bg-[#F0FDF4] hover:text-[#16A34A]"
            }`}
          >
            <Zap className="w-4 h-4 shrink-0 fill-current" />
            <span className="truncate">⚡ Play with Random Live</span>
          </button>
        </div>
      </div>

      {/* 3. MODE CONTENT SECTIONS */}

      {/* MODE 1: PLAY WITH AI */}
      {playMode === "ai" && (
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-6 sm:p-8 shadow-xs text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] border border-[#C7D2FE] text-[#6366F1] flex items-center justify-center mx-auto">
            <Bot className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-[#202124]">
              Play {activeGameMeta.title} vs Smart AI
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Practice solo and test your tactics against our intelligent game algorithm.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              router.push(`/play/${activeGameMeta.slug}`);
            }}
            className="w-full py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-white bg-[#6366F1] hover:bg-[#4F46E5] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Solo {activeGameMeta.title} vs AI</span>
          </button>
        </div>
      )}

      {/* MODE 2: PLAY WITH RANDOM LIVE (Filtered for THIS GAME ONLY) */}
      {playMode === "random" && (
        <div className="space-y-4">
          {/* Matchmaking Banner Scoped to THIS GAME */}
          <div className="rounded-2xl border border-[#E8E8E5] bg-gradient-to-r from-emerald-600 to-teal-600 p-5 sm:p-6 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                  Live Matchmaking for {activeGameMeta.title} Only
                </span>
                {gameSpecificOpenRooms.length > 0 && (
                  <span className="text-[11px] font-bold bg-white text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {gameSpecificOpenRooms.length} Waiting Now
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Play {activeGameMeta.title} with a Live Random Player
              </h3>
              <p className="text-xs text-white/90">
                Click below to instantly search and pair with an active opponent who wants to play{" "}
                <strong>{activeGameMeta.title}</strong> right now.
              </p>
            </div>

            <button
              onClick={handleRandomLiveMatch}
              disabled={isQuickMatching || isLoading}
              className="shrink-0 py-4 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-[#15803D] bg-white hover:bg-emerald-50 active:scale-95 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current text-emerald-600" />
              <span>
                {isQuickMatching
                  ? "Finding Live Player..."
                  : `⚡ Find Random Live Opponent (${activeGameMeta.title})`}
              </span>
            </button>
          </div>

          {/* Open Live Rooms for THIS GAME ONLY */}
          <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#202124]">
                  🌐 Live Open Rooms for {activeGameMeta.title} ({gameSpecificOpenRooms.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={fetchOpenRooms}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#202124] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                title="Refresh rooms"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {gameSpecificOpenRooms.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#F7F7F5] border border-dashed border-[#CBD5E1] text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto text-[#6B7280] shadow-2xs">
                  <GameIcon className="w-5 h-5 text-[#16A34A]" />
                </div>
                <p className="text-xs font-bold text-[#202124]">
                  No one is currently waiting for {activeGameMeta.title}.
                </p>
                <p className="text-[11px] text-[#6B7280] max-w-md mx-auto">
                  Click &ldquo;Find Random Live Opponent&rdquo; above to create a waiting room for{" "}
                  {activeGameMeta.title} so the next player gets paired with you instantly!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {gameSpecificOpenRooms.map((r) => (
                  <div
                    key={r.code}
                    className="p-3 rounded-xl border border-[#E8E8E5] bg-[#F7F7F5] flex items-center justify-between gap-3 hover:bg-white hover:border-[#CBD5E1] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                        <GameIcon className="w-4 h-4" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#202124] truncate">
                            {r.hostName}&apos;s Room
                          </span>
                          <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {r.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6B7280]">
                          Waiting for Challenger • {activeGameMeta.title}
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
                      <span>Join Duel</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: PLAY WITH FRIENDS (Room Code & Custom Options) */}
      {playMode === "friends" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 w-full items-stretch">
          {/* Left Card: Host Friend Game */}
          <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
            <form onSubmit={handleCreateRoom} className="space-y-4 flex flex-col justify-between flex-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
                      Host Duel for Friends
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                      Create Private Room
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316] shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                </div>

                {/* Player Name */}
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                    Your Player Name (Player 1)
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

                {/* Selected Game Reminder */}
                <div className="p-3 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center">
                      <GameIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#202124] block">
                        {activeGameMeta.title}
                      </span>
                      <span className="text-[10px] text-[#C2410C] font-semibold">
                        2-Device Live Friend Match
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-white text-[#F97316] rounded-md border border-[#FFEDD5]">
                    Selected
                  </span>
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
                      <span>⚙️ Custom Room Options (Settings)</span>
                    </div>
                    {showCustomOptions ? (
                      <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                    )}
                  </button>

                  {showCustomOptions && (
                    <div className="p-3.5 pt-2 border-t border-[#E8E8E5] space-y-3.5 bg-white text-xs">
                      {/* Custom Code */}
                      <div>
                        <label className="block text-[11px] font-bold text-[#6B7280] mb-1 uppercase tracking-wider">
                          Custom Room Code (Optional)
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          value={customRoomCode}
                          onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase())}
                          placeholder="e.g. 7777, EPIC (Leave blank for random)"
                          className="w-full text-xs font-mono font-bold py-2 px-3 rounded-lg bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#F97316] uppercase"
                        />
                      </div>

                      {/* Room Visibility */}
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
                            <span>Public (Lobby Visible)</span>
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

                      {/* Dots & Boxes modifier */}
                      {selectedGame === "dots-and-boxes" && (
                        <div>
                          <label className="block text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                            Dots Grid Size
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { val: 3, label: "2x2 (4 Sq)" },
                              { val: 4, label: "3x3 (9 Sq)" },
                              { val: 5, label: "4x4 (16 Sq)" },
                              { val: 11, label: "10x10 (100 Sq)" },
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
                <span>{isLoading ? "Generating Room..." : "Create Room & Get 4-Digit Code"}</span>
              </button>
            </form>
          </div>

          {/* Right Card: Join Friend's Room */}
          <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6366F1] bg-[#EEF2FF] border border-[#C7D2FE] px-2 py-0.5 rounded-lg">
                    Join Friend&apos;s Room
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                    Enter Friend&apos;s Code
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[#6366F1] shrink-0">
                  <LogIn className="w-5 h-5" />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] rounded-xl text-xs font-semibold text-center animate-in fade-in">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={(e) => handleJoinRoom(undefined, e)} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] mb-1.5 uppercase tracking-wider">
                    Room Code
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
                    Get this code from your friend on their phone or laptop.
                  </p>
                </div>

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
                  <span>{isLoading ? "Connecting Devices..." : "Connect & Join Friend"}</span>
                </button>
              </form>
            </div>

            {/* How 2-Device Arena Works */}
            <div className="bg-[#F7F7F5] border border-[#E8E8E5] rounded-xl p-3.5 text-xs text-[#202124] space-y-1.5 mt-2">
              <div className="font-bold text-[#202124] flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="text-xs">How Playing with Friends Works:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[#6B7280] text-[11px] leading-relaxed">
                <li><strong>Host:</strong> Click &ldquo;Create Room&rdquo; to get a code.</li>
                <li><strong>Friend:</strong> Type the code above and click &ldquo;Connect&rdquo;.</li>
                <li><strong>Chat & Play:</strong> Enjoy real-time gameplay with live in-game temporary chat!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
