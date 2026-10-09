"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Bot,
  Users,
  HelpCircle,
  ShieldAlert,
  Sword,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Zap,
  MessageSquare,
  Send,
} from "lucide-react";
import { sound } from "@/lib/audio";
import { MultiplayerLobby } from "@/components/multiplayer/MultiplayerLobby";

interface Props {
  activitySlug?: string;
}

type Player = 1 | 2; // 1: Blue/Cyan, 2: Orange/Red (or AI)
type Phase = 1 | 2 | 3; // 1: Placing, 2: Moving, 3: Flying (at 3 pieces)
type GameMode = "pvp" | "ai" | "online";

// 24 Board Points Coordinates (SVG viewBox 0 0 400 400)
const POINTS = [
  // Outer square (0 - 7)
  { id: 0, x: 40, y: 40 },
  { id: 1, x: 200, y: 40 },
  { id: 2, x: 360, y: 40 },
  { id: 3, x: 360, y: 200 },
  { id: 4, x: 360, y: 360 },
  { id: 5, x: 200, y: 360 },
  { id: 6, x: 40, y: 360 },
  { id: 7, x: 40, y: 200 },

  // Middle square (8 - 15)
  { id: 8, x: 90, y: 90 },
  { id: 9, x: 200, y: 90 },
  { id: 10, x: 310, y: 90 },
  { id: 11, x: 310, y: 200 },
  { id: 12, x: 310, y: 310 },
  { id: 13, x: 200, y: 310 },
  { id: 14, x: 90, y: 310 },
  { id: 15, x: 90, y: 200 },

  // Inner square (16 - 23)
  { id: 16, x: 140, y: 140 },
  { id: 17, x: 200, y: 140 },
  { id: 18, x: 260, y: 140 },
  { id: 19, x: 260, y: 200 },
  { id: 20, x: 260, y: 260 },
  { id: 21, x: 200, y: 260 },
  { id: 22, x: 140, y: 260 },
  { id: 23, x: 140, y: 200 },
];

// Adjacency connections for regular moves (Phase 2)
const ADJACENCY: Record<number, number[]> = {
  0: [1, 7],
  1: [0, 2, 9],
  2: [1, 3],
  3: [2, 4, 11],
  4: [3, 5],
  5: [4, 6, 13],
  6: [5, 7],
  7: [0, 6, 15],

  8: [9, 15],
  9: [1, 8, 10, 17],
  10: [9, 11],
  11: [3, 10, 12, 19],
  12: [11, 13],
  13: [5, 12, 14, 21],
  14: [13, 15],
  15: [7, 8, 14, 23],

  16: [17, 23],
  17: [9, 16, 18],
  18: [17, 19],
  19: [11, 18, 20],
  20: [19, 21],
  21: [13, 20, 22],
  22: [21, 23],
  23: [15, 16, 22],
};

// All 16 possible Mill configurations (3 in a line)
const MILLS: number[][] = [
  // Outer
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
  [6, 7, 0],
  // Middle
  [8, 9, 10],
  [10, 11, 12],
  [12, 13, 14],
  [14, 15, 8],
  // Inner
  [16, 17, 18],
  [18, 19, 20],
  [20, 21, 22],
  [22, 23, 16],
  // Cross bridges
  [1, 9, 17],
  [3, 11, 19],
  [5, 13, 21],
  [7, 15, 23],
];

export function NineMensMorris({ activitySlug = "nine-mens-morris" }: Props) {
  const [mode, setMode] = useState<GameMode>("ai");
  const [onlineInitialMode, setOnlineInitialMode] = useState<"friends" | "random">("friends");
  const [board, setBoard] = useState<(Player | null)[]>(() => Array(24).fill(null));

  // Pieces left to place in Phase 1
  const [unplacedP1, setUnplacedP1] = useState(9);
  const [unplacedP2, setUnplacedP2] = useState(9);

  const [turn, setTurn] = useState<Player>(1);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  // When player completes a mill, they must remove an opponent piece
  const [mustRemoveOpponent, setMustRemoveOpponent] = useState(false);

  const [winner, setWinner] = useState<Player | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Phase 1: Place your pieces on the board.");

  // In-game temporary chat state
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: "p1" | "p2" | "ai" | "system"; senderName: string; text: string; timestamp: number }[]
  >([
    {
      id: "morris_init_1",
      sender: "system",
      senderName: "Arena System",
      text: "Nine Men's Morris battle begun! Place 9 pieces each to form mills.",
      timestamp: Date.now(),
    },
    {
      id: "morris_init_2",
      sender: "ai",
      senderName: "Smart Bot",
      text: "Salve! Form 3 in a row to capture my tokens. May the best strategist win 🏛️",
      timestamp: Date.now() + 100,
    },
  ]);
  const [chatInputText, setChatInputText] = useState("");
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);

  const addChatMessage = useCallback(
    (text: string, sender: "p1" | "p2" = "p1") => {
      sound.playClick();
      const newMsg = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        sender,
        senderName: sender === "p1" ? "Player 1" : mode === "ai" ? "Smart Bot" : "Player 2",
        text: text.slice(0, 160),
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev.slice(-30), newMsg]);

      if (mode === "ai" && sender === "p1") {
        setTimeout(() => {
          const botReplies = [
            "Good move! I'm planning my mill... 🏛️",
            "You won't capture my pieces that easily! ⚔️",
            "Be careful not to leave open paths! 🛡️",
            "Tactical move! Let us see your next placement 🎯",
            "Ancient Roman tacticians would be impressed 👏",
            "Defend your flanks! ⚡",
          ];
          const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
          setChatMessages((prev) => [
            ...prev.slice(-30),
            {
              id: "msg_" + Math.random().toString(36).substring(2, 9),
              sender: "ai",
              senderName: "Smart Bot",
              text: randomReply,
              timestamp: Date.now(),
            },
          ]);
          sound.playTurnChime();
        }, 650);
      }
    },
    [mode]
  );

  // Count active pieces on board
  const piecesOnBoard = useMemo(() => {
    let p1 = 0;
    let p2 = 0;
    board.forEach((val) => {
      if (val === 1) p1++;
      if (val === 2) p2++;
    });
    return { p1, p2 };
  }, [board]);

  // Current Phase of a player
  const getPlayerPhase = useCallback(
    (player: Player): Phase => {
      const unplaced = player === 1 ? unplacedP1 : unplacedP2;
      if (unplaced > 0) return 1;
      const count = player === 1 ? piecesOnBoard.p1 : piecesOnBoard.p2;
      if (count === 3) return 3; // Flying phase
      return 2; // Moving phase
    },
    [piecesOnBoard.p1, piecesOnBoard.p2, unplacedP1, unplacedP2]
  );

  // Check if position `pos` belongs to a formed mill on `b`
  const isPartOfMill = useCallback((pos: number, b: (Player | null)[]): boolean => {
    const player = b[pos];
    if (!player) return false;
    return MILLS.some(
      (m) => m.includes(pos) && m.every((idx) => b[idx] === player)
    );
  }, []);

  // Check if all of `player` pieces are currently in mills
  const areAllPiecesInMills = useCallback(
    (player: Player, b: (Player | null)[]): boolean => {
      const playerPieces = b
        .map((p, idx) => (p === player ? idx : null))
        .filter((idx): idx is number => idx !== null);

      if (playerPieces.length === 0) return false;
      return playerPieces.every((pos) => isPartOfMill(pos, b));
    },
    [isPartOfMill]
  );

  // Reset Game
  const resetGame = useCallback(() => {
    sound.playClick();
    setBoard(Array(24).fill(null));
    setUnplacedP1(9);
    setUnplacedP2(9);
    setTurn(1);
    setSelectedPoint(null);
    setMustRemoveOpponent(false);
    setWinner(null);
    setGameOver(false);
    setIsAIThinking(false);
    setStatusMessage("Phase 1: Place your pieces on the board.");
  }, []);

  // Check if a player has any legal moves left in Phase 2
  const hasLegalMoves = useCallback(
    (player: Player, b: (Player | null)[]): boolean => {
      const phase = getPlayerPhase(player);
      if (phase === 1 || phase === 3) return true; // Placing or Flying always has empty spots if alive

      for (let pos = 0; pos < 24; pos++) {
        if (b[pos] === player) {
          const adj = ADJACENCY[pos];
          if (adj.some((target) => b[target] === null)) {
            return true;
          }
        }
      }
      return false;
    },
    [getPlayerPhase]
  );

  // Check game victory conditions
  const checkVictory = useCallback(
    (nextBoard: (Player | null)[], nextTurn: Player) => {
      // In phase 2/3, if opponent has < 3 pieces
      const p1Alive = nextBoard.filter((p) => p === 1).length;
      const p2Alive = nextBoard.filter((p) => p === 2).length;

      if (unplacedP1 === 0 && p1Alive < 3) {
        setWinner(2);
        setGameOver(true);
        setStatusMessage("Player 2 Wins! Player 1 reduced to under 3 pieces.");
        return true;
      }
      if (unplacedP2 === 0 && p2Alive < 3) {
        setWinner(1);
        setGameOver(true);
        confetti({ particleCount: 70, spread: 60 });
        setStatusMessage("Player 1 Wins! Player 2 reduced to under 3 pieces.");
        return true;
      }

      // Check if nextTurn player has no legal moves
      if (
        (nextTurn === 1 ? unplacedP1 === 0 : unplacedP2 === 0) &&
        !hasLegalMoves(nextTurn, nextBoard)
      ) {
        const winP = nextTurn === 1 ? 2 : 1;
        setWinner(winP);
        setGameOver(true);
        if (winP === 1) confetti({ particleCount: 70, spread: 60 });
        setStatusMessage(`Player ${winP} Wins! Opponent has no legal moves.`);
        return true;
      }

      return false;
    },
    [hasLegalMoves, unplacedP1, unplacedP2]
  );

  // Player action: Click a point
  const handlePointClick = useCallback(
    (pos: number) => {
      if (gameOver || isAIThinking) return;

      const currentPhase = getPlayerPhase(turn);
      const opponent: Player = turn === 1 ? 2 : 1;

      // ==========================================
      // STATE A: REMOVING AN OPPONENT PIECE (MILL)
      // ==========================================
      if (mustRemoveOpponent) {
        if (board[pos] !== opponent) {
          setStatusMessage("Select an OPPONENT piece to remove!");
          return;
        }

        // Rule: cannot remove from mill unless all opponent pieces are in mills
        const inMill = isPartOfMill(pos, board);
        const allInMills = areAllPiecesInMills(opponent, board);

        if (inMill && !allInMills) {
          setStatusMessage("Cannot remove a piece from a Mill unless all pieces are in mills!");
          return;
        }

        // Remove piece
        const newBoard = [...board];
        newBoard[pos] = null;
        setBoard(newBoard);
        sound.playClick();
        setMustRemoveOpponent(false);

        // Check if game won by capture
        if (checkVictory(newBoard, opponent)) return;

        // Turn completes -> switch to opponent
        setTurn(opponent);
        setStatusMessage(`Piece removed! Turn switches to Player ${opponent}.`);
        return;
      }

      // ==========================================
      // PHASE 1: PLACING PIECES (First 9 moves each)
      // ==========================================
      if (currentPhase === 1) {
        if (board[pos] !== null) {
          setStatusMessage("Position occupied! Choose an empty spot.");
          return;
        }

        const newBoard = [...board];
        newBoard[pos] = turn;
        setBoard(newBoard);
        sound.playClick();

        if (turn === 1) setUnplacedP1((prev) => prev - 1);
        else setUnplacedP2((prev) => prev - 1);

        // Check if this placement formed a mill
        if (isPartOfMill(pos, newBoard)) {
          setMustRemoveOpponent(true);
          sound.playClick();
          setStatusMessage(`MILL FORMED! 🎯 Player ${turn}, select an opponent piece to capture.`);
          return;
        }

        // Turn ends
        setTurn(opponent);
        setStatusMessage(`Player ${turn} placed a piece. Player ${opponent}'s turn.`);
        return;
      }

      // ==========================================
      // PHASE 2 & 3: SELECTING OR MOVING A PIECE
      // ==========================================
      if (selectedPoint === null) {
        // Must select own piece
        if (board[pos] !== turn) {
          setStatusMessage(`Select one of your pieces (Player ${turn}) to move.`);
          return;
        }
        setSelectedPoint(pos);
        sound.playClick();
        setStatusMessage(
          currentPhase === 3
            ? `Piece ${pos} selected. FLY anywhere on empty spots!`
            : `Piece ${pos} selected. Choose an adjacent empty spot.`
        );
        return;
      }

      // Already selected a piece:
      if (pos === selectedPoint) {
        // Deselect
        setSelectedPoint(null);
        return;
      }

      // Can switch selection to another of own pieces
      if (board[pos] === turn) {
        setSelectedPoint(pos);
        sound.playClick();
        return;
      }

      // Must be empty spot to move into
      if (board[pos] !== null) {
        setStatusMessage("Destination must be empty!");
        return;
      }

      // In Phase 2: must be adjacent. In Phase 3 (flying): can be anywhere.
      if (currentPhase === 2 && !ADJACENCY[selectedPoint].includes(pos)) {
        setStatusMessage("Can only move to adjacent connected positions!");
        return;
      }

      // Perform move
      const newBoard = [...board];
      newBoard[selectedPoint] = null;
      newBoard[pos] = turn;
      setBoard(newBoard);
      setSelectedPoint(null);
      sound.playClick();

      // Check mill formation
      if (isPartOfMill(pos, newBoard)) {
        setMustRemoveOpponent(true);
        setStatusMessage(`MILL FORMED! 🎯 Player ${turn}, select an opponent piece to capture.`);
        return;
      }

      // Check victory
      if (checkVictory(newBoard, opponent)) return;

      setTurn(opponent);
      setStatusMessage(`Player ${turn} moved. Turn switches to Player ${opponent}.`);
    },
    [
      areAllPiecesInMills,
      board,
      checkVictory,
      gameOver,
      getPlayerPhase,
      isAIThinking,
      isPartOfMill,
      mustRemoveOpponent,
      selectedPoint,
      turn,
    ]
  );

  // ==========================================
  // AI OPPONENT LOGIC (Player 2)
  // ==========================================
  useEffect(() => {
    if (mode !== "ai" || turn !== 2 || gameOver) return;

    setIsAIThinking(true);
    const timer = setTimeout(() => {
      // 1. If AI must remove an opponent piece
      if (mustRemoveOpponent) {
        // Find removable pieces (prefer pieces not in mill, or any if all in mill)
        const allInMills = areAllPiecesInMills(1, board);
        const candidates = board
          .map((p, idx) => (p === 1 ? idx : null))
          .filter((idx): idx is number => idx !== null)
          .filter((pos) => allInMills || !isPartOfMill(pos, board));

        const target =
          candidates.length > 0
            ? candidates[Math.floor(Math.random() * candidates.length)]
            : 0;

        setIsAIThinking(false);
        handlePointClick(target);
        return;
      }

      const phase = getPlayerPhase(2);

      // Phase 1: Placement
      if (phase === 1) {
        const emptyPoints = board
          .map((p, idx) => (p === null ? idx : null))
          .filter((idx): idx is number => idx !== null);

        // Try to form mill or block opponent mill
        let bestPos = emptyPoints[0];
        for (const pos of emptyPoints) {
          const testBoard = [...board];
          testBoard[pos] = 2;
          if (isPartOfMill(pos, testBoard)) {
            bestPos = pos;
            break;
          }
        }

        setIsAIThinking(false);
        handlePointClick(bestPos);
        return;
      }

      // Phase 2 or 3: Moving or Flying
      const aiPieces = board
        .map((p, idx) => (p === 2 ? idx : null))
        .filter((idx): idx is number => idx !== null);

      let foundMove: { from: number; to: number } | null = null;

      for (const from of aiPieces) {
        const validTargets =
          phase === 3
            ? board.map((p, idx) => (p === null ? idx : null)).filter((i): i is number => i !== null)
            : ADJACENCY[from].filter((to) => board[to] === null);

        for (const to of validTargets) {
          const testBoard = [...board];
          testBoard[from] = null;
          testBoard[to] = 2;

          // Check if forms mill
          if (isPartOfMill(to, testBoard)) {
            foundMove = { from, to };
            break;
          }
          if (!foundMove) foundMove = { from, to };
        }
        if (foundMove && isPartOfMill(foundMove.to, board)) break;
      }

      setIsAIThinking(false);
      if (foundMove) {
        // Select then move
        handlePointClick(foundMove.from);
        setTimeout(() => {
          handlePointClick(foundMove!.to);
        }, 150);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [
    areAllPiecesInMills,
    board,
    gameOver,
    getPlayerPhase,
    handlePointClick,
    isPartOfMill,
    mode,
    mustRemoveOpponent,
    turn,
  ]);

  if (mode === "online") {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              sound.playClick();
              setMode("ai");
            }}
            className="text-xs font-bold text-[#6B7280] hover:text-[#202124] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Back to Solo / Same-Device</span>
          </button>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6366F1] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-[#C7D2FE]">
            Online Nine Men&apos;s Morris Duel
          </span>
        </div>
        <MultiplayerLobby defaultGameType="nine-mens-morris" initialMode={onlineInitialMode} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 select-none text-[#202124]">
      {/* 1. TOP HEADER BAR: "leavel and other" */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs space-y-3">
        {/* Row 1: Mode Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setMode("ai");
              resetGame();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === "ai"
                ? "bg-[#6366F1] text-white shadow-xs"
                : "bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124]"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Play with AI</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setOnlineInitialMode("friends");
              setMode("online");
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-[#FFF7ED] text-[#F97316] hover:bg-[#FFEDD5] border border-[#FFEDD5] cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Play with Friends</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setOnlineInitialMode("random");
              setMode("online");
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7] border border-[#DCFCE7] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Play with Random Live</span>
          </button>

          <button
            onClick={() => {
              setMode("pvp");
              resetGame();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              mode === "pvp"
                ? "bg-[#202124] text-white shadow-xs"
                : "text-[#9CA3AF] hover:text-[#4B5563]"
            }`}
            title="Pass & play on same device"
          >
            <span>1-Device</span>
          </button>
        </div>

        {/* Row 2: Phase pills on Left, Restart & Rules on Right */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F0F0ED] p-1 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
            <span
              className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                unplacedP1 > 0 || unplacedP2 > 0
                  ? "bg-white text-[#202124] shadow-xs"
                  : "text-[#6B7280]"
              }`}
            >
              Phase 1: Placing (9 Men)
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                unplacedP1 === 0 &&
                unplacedP2 === 0 &&
                piecesOnBoard.p1 > 3 &&
                piecesOnBoard.p2 > 3
                  ? "bg-white text-[#202124] shadow-xs"
                  : "text-[#6B7280]"
              }`}
            >
              Phase 2: Moving
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                piecesOnBoard.p1 === 3 || piecesOnBoard.p2 === 3
                  ? "bg-white text-[#F97316] shadow-xs"
                  : "text-[#6B7280]"
              }`}
            >
              Phase 3: Flying
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={resetGame}
              className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] hover:bg-[#E8E8E5] transition-colors cursor-pointer"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowRules(!showRules)}
              className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] hover:bg-[#E8E8E5] transition-colors cursor-pointer"
              title="Rules"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rules Banner (Collapsible) */}
      {showRules && (
        <div className="w-full bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl p-4 text-xs text-[#202124] space-y-2 animate-in fade-in">
          <h4 className="font-black text-sm text-[#F97316] flex items-center gap-1.5">
            <Sword className="w-4 h-4" /> Rules of Nine Men&apos;s Morris:
          </h4>
          <p>• <strong>Phase 1 (Place):</strong> Players alternate placing 9 pieces each on empty intersections.</p>
          <p>• <strong>Phase 2 (Move):</strong> Move 1 piece along lines to adjacent empty spots.</p>
          <p>• <strong>Phase 3 (Fly):</strong> When reduced to 3 pieces, your men can fly to any vacant spot!</p>
          <p>• <strong>Mills:</strong> 3 in a line along a segment forms a MILL, allowing you to capture 1 opponent piece!</p>
          <p>• <strong>Win:</strong> Reduce opponent to &lt;3 pieces or completely block all their legal moves!</p>
        </div>
      )}

      {/* 2. MAIN 3-COLUMN ARENA: [game] | [game details] | [chat] */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* COLUMN 1: "game" (Left / Largest) */}
        <div className="lg:col-span-6 bg-white border border-[#E8E8E5] rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between relative min-h-[480px]">
          {/* Header info */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-[#F0F0ED]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-[#202124] uppercase tracking-wider">
                Nine Men&apos;s Morris Board
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#6366F1] bg-[#EEF2FF] px-2 py-0.5 rounded-lg border border-[#C7D2FE]">
              {turn === 1 ? "Player 1 Turn" : mode === "ai" ? "Smart Bot Turn" : "Player 2 Turn"}
            </span>
          </div>

          {/* Centered SVG Board */}
          <div className="flex-1 flex items-center justify-center my-3">
            <svg
              viewBox="0 0 400 400"
              className="w-full max-w-[380px] aspect-square overflow-visible"
            >
              {/* Board Line Squares */}
              <rect
                x="40"
                y="40"
                width="320"
                height="320"
                fill="none"
                stroke="#202124"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <rect
                x="90"
                y="90"
                width="220"
                height="220"
                fill="none"
                stroke="#202124"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <rect
                x="140"
                y="140"
                width="120"
                height="120"
                fill="none"
                stroke="#202124"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Connecting Cross Lines */}
              <line x1="200" y1="40" x2="200" y2="140" stroke="#202124" strokeWidth="3.5" />
              <line x1="200" y1="260" x2="200" y2="360" stroke="#202124" strokeWidth="3.5" />
              <line x1="40" y1="200" x2="140" y2="200" stroke="#202124" strokeWidth="3.5" />
              <line x1="260" y1="200" x2="360" y2="200" stroke="#202124" strokeWidth="3.5" />

              {/* 24 Intersection Points & Pieces */}
              {POINTS.map((pt) => {
                const piece = board[pt.id];
                const isSelected = selectedPoint === pt.id;
                const inMill = isPartOfMill(pt.id, board);
                const isRemovableCandidate =
                  mustRemoveOpponent &&
                  piece === (turn === 1 ? 2 : 1) &&
                  (areAllPiecesInMills(turn === 1 ? 2 : 1, board) || !inMill);

                return (
                  <g
                    key={`point-${pt.id}`}
                    className="cursor-pointer"
                    onClick={() => handlePointClick(pt.id)}
                  >
                    {/* Empty point base */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      fill="#E8E8E5"
                      stroke="#202124"
                      strokeWidth="2"
                      className="transition-transform hover:scale-125"
                    />

                    {/* Candidate highlight if removing opponent */}
                    {isRemovableCandidate && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="19"
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="2.5"
                        strokeDasharray="4 3"
                        className="animate-spin origin-center"
                        style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                      />
                    )}

                    {/* Selected Piece Ring */}
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="19"
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="3"
                        className="animate-pulse"
                      />
                    )}

                    {/* Placed Piece */}
                    {piece !== null && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="14"
                        fill={piece === 1 ? "#6366F1" : "#F97316"}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        className="transition-all hover:scale-110 drop-shadow-sm"
                      />
                    )}

                    {/* Golden Crown badge if part of active mill */}
                    {inMill && piece !== null && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4"
                        fill="#FDE047"
                        className="pointer-events-none"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-center text-[11px] text-[#9CA3AF] pt-2 border-t border-[#F0F0ED]">
            {mustRemoveOpponent
              ? "⚡ MILL FORMED! Select an opponent piece to capture."
              : "Align 3 pieces in a straight row to form a Mill and capture enemy pieces."}
          </div>

          {/* Victory Modal */}
          {gameOver && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316]">
                <Trophy className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-black text-[#202124]">
                {winner === 1
                  ? "Player 1 Wins! 🏆"
                  : mode === "ai"
                  ? "Bot Takes the Game! 🤖"
                  : "Player 2 Wins! 🏆"}
              </h3>

              <p className="text-xs font-semibold text-[#6B7280]">
                All 3 strategic phases successfully completed.
              </p>

              <button
                onClick={resetGame}
                className="mt-2 px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          )}
        </div>

        {/* COLUMN 2: "game details" (Middle) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3">
          {/* Player 1 Card */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              turn === 1 && !gameOver
                ? "bg-[#EEF2FF] border-[#6366F1] shadow-xs ring-2 ring-[#6366F1]/30"
                : "bg-white border-[#E8E8E5]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#6366F1] text-white font-black flex items-center justify-center text-xs shadow-xs">
                P1
              </div>
              <div>
                <span className="text-xs font-bold text-[#202124] block">Player 1</span>
                <span className="text-[10px] text-[#6366F1] font-semibold flex items-center gap-1">
                  {turn === 1 && !gameOver ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-ping" />
                      Thinking...
                    </>
                  ) : (
                    "Waiting"
                  )}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-[#6366F1] block">
                {getPlayerPhase(1) === 1 ? "Placing" : getPlayerPhase(1) === 3 ? "Flying" : "Moving"}
              </span>
              <span className="text-[10px] text-[#6B7280]">
                {unplacedP1 > 0 ? `${unplacedP1} to place` : `${piecesOnBoard.p1} on board`}
              </span>
            </div>
          </div>

          {/* Player 2 / AI Card */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              turn === 2 && !gameOver
                ? "bg-[#FFF7ED] border-[#F97316] shadow-xs ring-2 ring-[#F97316]/30"
                : "bg-white border-[#E8E8E5]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F97316] text-white font-black flex items-center justify-center text-xs shadow-xs">
                {mode === "ai" ? "AI" : "P2"}
              </div>
              <div>
                <span className="text-xs font-bold text-[#202124] block">
                  {mode === "ai" ? "Smart Bot" : "Player 2"}
                </span>
                <span className="text-[10px] text-[#F97316] font-semibold flex items-center gap-1">
                  {turn === 2 && !gameOver ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-ping" />
                      Thinking...
                    </>
                  ) : (
                    "Waiting"
                  )}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-[#F97316] block">
                {getPlayerPhase(2) === 1 ? "Placing" : getPlayerPhase(2) === 3 ? "Flying" : "Moving"}
              </span>
              <span className="text-[10px] text-[#6B7280]">
                {unplacedP2 > 0 ? `${unplacedP2} to place` : `${piecesOnBoard.p2} on board`}
              </span>
            </div>
          </div>

          {/* Action / Turn Status Banner */}
          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              mustRemoveOpponent
                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                : turn === 1
                ? "bg-[#EEF2FF] border-[#C7D2FE] text-[#4F46E5]"
                : "bg-[#FFF7ED] border-[#FFEDD5] text-[#C2410C]"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
              Current Directive
            </span>
            <span className="text-xs font-black">{statusMessage}</span>
          </div>

          {/* Game Details Summary Card */}
          <div className="bg-white border border-[#E8E8E5] rounded-2xl p-4 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#202124]">Pieces on Board</span>
                <span className="text-xs font-mono font-bold text-[#6B7280]">
                  {piecesOnBoard.p1 + piecesOnBoard.p2} / 18
                </span>
              </div>

              {/* Progress Bar of pieces */}
              <div className="w-full h-2.5 bg-[#F0F0ED] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(piecesOnBoard.p1 / 9) * 50}%` }}
                  className="bg-[#6366F1] transition-all duration-300"
                />
                <div
                  style={{ width: `${(piecesOnBoard.p2 / 9) * 50}%` }}
                  className="bg-[#F97316] transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5 text-[11px] text-[#6B7280] font-medium pt-1">
                <div className="flex items-center justify-between">
                  <span>Player 1 Pieces:</span>
                  <span className="font-bold text-[#202124]">
                    {unplacedP1 > 0 ? `${unplacedP1} left to place` : `${piecesOnBoard.p1} active`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Opponent Pieces:</span>
                  <span className="font-bold text-[#202124]">
                    {unplacedP2 > 0 ? `${unplacedP2} left to place` : `${piecesOnBoard.p2} active`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Capture Rule:</span>
                  <span className="font-bold text-emerald-600">3-in-a-row Mill</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F0F0ED]">
              <button
                onClick={resetGame}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#F7F7F5] hover:bg-[#EEF2FF] hover:text-[#6366F1] text-[#202124] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Board</span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3: "chat" (Right) */}
        <div className="lg:col-span-3 bg-white border border-[#E8E8E5] rounded-3xl p-3 sm:p-4 shadow-xs flex flex-col justify-between min-h-[480px]">
          {/* Chat Header */}
          <div className="pb-2.5 border-b border-[#E8E8E5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black text-[#202124] block uppercase tracking-wider">
                  In-Game Chat
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  ● Temporary Session
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[#9CA3AF] font-semibold">
              {chatMessages.length} msgs
            </span>
          </div>

          {/* Messages List Area */}
          <div className="my-2.5 flex-1 max-h-[260px] overflow-y-auto space-y-2 p-2 bg-[#F7F7F5] rounded-2xl scrollbar-none">
            {chatMessages.map((msg) => {
              const isP1 = msg.sender === "p1";
              const isSystem = msg.sender === "system";
              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center my-1">
                    <span className="text-[10px] font-semibold bg-[#E8E8E5] text-[#4B5563] px-2 py-0.5 rounded-full">
                      {msg.text}
                    </span>
                  </div>
                );
              }
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isP1 ? "items-end" : "items-start"}`}
                >
                  <span className="text-[9px] font-bold text-[#9CA3AF] px-1 mb-0.5">
                    {msg.senderName}
                  </span>
                  <div
                    className={`max-w-[88%] text-xs px-3 py-1.5 rounded-2xl leading-relaxed shadow-2xs font-semibold ${
                      isP1
                        ? "bg-[#6366F1] text-white rounded-br-xs"
                        : "bg-white text-[#202124] border border-[#E8E8E5] rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Reaction Emojis & Taunts */}
          <div className="space-y-2 pt-1 border-t border-[#E8E8E5]">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {["👏", "⚔️", "🛡️", "🔥", "😂", "🎉", "💀", "🚀"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addChatMessage(emoji, "p1")}
                  className="w-7 h-7 rounded-lg hover:bg-[#F0F0ED] text-sm flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {[
                "Formed a mill! 🏛️",
                "Good move! 👏",
                "Watch your men! ⚔️",
                "Good game! 🎉",
              ].map((taunt) => (
                <button
                  key={taunt}
                  type="button"
                  onClick={() => addChatMessage(taunt, "p1")}
                  className="px-2 py-0.5 rounded-lg bg-[#F7F7F5] hover:bg-[#EEF2FF] hover:text-[#6366F1] text-[#4B5563] text-[10px] font-bold shrink-0 cursor-pointer transition-all border border-[#E8E8E5]"
                >
                  {taunt}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatInputText.trim()) {
                  addChatMessage(chatInputText.trim(), "p1");
                  setChatInputText("");
                }
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                maxLength={120}
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-xs py-1.5 px-3 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] focus:border-[#6366F1] focus:bg-white focus:outline-hidden text-[#202124]"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim()}
                className="p-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white disabled:opacity-40 transition-colors cursor-pointer"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
