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
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 select-none">
      {/* Top Header Bar with 3 Unified Modes */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-2.5 sm:p-3 shadow-xs flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              setMode("ai");
              resetGame();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-[#FFF7ED] text-[#F97316] hover:bg-[#FFEDD5] border border-[#FFEDD5] cursor-pointer"
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
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7] border border-[#DCFCE7] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Play with Random Live</span>
          </button>

          <button
            onClick={() => {
              setMode("pvp");
              resetGame();
            }}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              mode === "pvp"
                ? "bg-[#202124] text-white shadow-xs"
                : "text-[#9CA3AF] hover:text-[#4B5563]"
            }`}
            title="Pass & play on same device"
          >
            <span>1-Device</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={resetGame}
            className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] transition-colors"
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRules(!showRules)}
            className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] transition-colors"
            title="Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rules Popup */}
      {showRules && (
        <div className="w-full bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl p-4 text-xs text-[#202124] space-y-2">
          <h4 className="font-black text-sm text-[#F97316] flex items-center gap-1.5">
            <Sword className="w-4 h-4" /> Rules of Nine Men&apos;s Morris:
          </h4>
          <p>
            • <strong>Phase 1 (Place):</strong> Players alternate placing 9 pieces each on empty intersections.
          </p>
          <p>
            • <strong>Phase 2 (Move):</strong> Move 1 piece along lines to adjacent empty spots.
          </p>
          <p>
            • <strong>Phase 3 (Fly):</strong> When down to 3 pieces, your pieces can jump/fly to any vacant spot!
          </p>
          <p>
            • <strong>Mills:</strong> 3 in a line along a segment forms a MILL, granting removal of 1 opponent piece (protected if in mill).
          </p>
          <p>
            • <strong>Win:</strong> Reduce opponent to &lt;3 pieces or block them completely!
          </p>
        </div>
      )}

      {/* Status Alert Bar */}
      <div
        className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold text-center border transition-all ${
          mustRemoveOpponent
            ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
            : turn === 1
            ? "bg-[#EEF2FF] text-[#6366F1] border-[#C7D2FE]"
            : "bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5]"
        }`}
      >
        {statusMessage}
      </div>

      {/* Score / Piece Counters */}
      <div className="w-full grid grid-cols-2 gap-3">
        {/* Player 1 Card */}
        <div
          className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
            turn === 1 && !gameOver
              ? "bg-[#EEF2FF] border-[#6366F1] ring-2 ring-[#6366F1]/30"
              : "bg-white border-[#E8E8E5]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              P1
            </div>
            <div>
              <span className="text-xs font-bold text-[#202124] block">Player 1</span>
              <span className="text-[10px] text-[#6B7280]">
                {unplacedP1 > 0 ? `${unplacedP1} to place` : `${piecesOnBoard.p1} on board`}
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-[#6366F1] px-2 py-1 rounded-lg bg-white border border-[#C7D2FE]">
            {getPlayerPhase(1) === 1 ? "Placing" : getPlayerPhase(1) === 3 ? "Flying" : "Moving"}
          </span>
        </div>

        {/* Player 2 Card */}
        <div
          className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
            turn === 2 && !gameOver
              ? "bg-[#FFF7ED] border-[#F97316] ring-2 ring-[#F97316]/30"
              : "bg-white border-[#E8E8E5]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {mode === "ai" ? "AI" : "P2"}
            </div>
            <div>
              <span className="text-xs font-bold text-[#202124] block">
                {mode === "ai" ? "Bot" : "Player 2"}
              </span>
              <span className="text-[10px] text-[#6B7280]">
                {unplacedP2 > 0 ? `${unplacedP2} to place` : `${piecesOnBoard.p2} on board`}
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-[#F97316] px-2 py-1 rounded-lg bg-white border border-[#FFEDD5]">
            {getPlayerPhase(2) === 1 ? "Placing" : getPlayerPhase(2) === 3 ? "Flying" : "Moving"}
          </span>
        </div>
      </div>

      {/* Main SVG Board */}
      <div className="bg-white border border-[#E8E8E5] rounded-3xl p-4 sm:p-6 shadow-sm relative w-full flex items-center justify-center">
        <svg
          viewBox="0 0 400 400"
          className="w-full max-w-[380px] aspect-square overflow-visible"
        >
          {/* Board Line Squares */}
          {/* Outer Square */}
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
          {/* Middle Square */}
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
          {/* Inner Square */}
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
              All 3 phases successfully completed.
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
    </div>
  );
}
