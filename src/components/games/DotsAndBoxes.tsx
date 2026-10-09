"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Bot,
  Users,
  Undo2,
  Volume2,
  VolumeX,
  HelpCircle,
  Play,
  Award,
  Zap,
  Wifi,
} from "lucide-react";
import { sound } from "@/lib/audio";
import { MultiplayerLobby } from "@/components/multiplayer/MultiplayerLobby";

interface Props {
  activitySlug?: string;
}

type GridSize = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11; // 3=2x2, 4=3x3, 5=4x4, 6=5x5, 7=6x6, 9=8x8, 11=10x10 boxes
type Player = 1 | 2; // 1: Player 1 (Indigo/Blue), 2: Player 2 / AI (Orange/Red)
type GameMode = "pvp" | "ai" | "online";
type AIDifficulty = "easy" | "medium" | "hard";

interface Edge {
  type: "h" | "v";
  row: number;
  col: number;
  owner: Player | null;
}

interface Box {
  row: number;
  col: number;
  owner: Player | null;
}

export function DotsAndBoxes({ activitySlug = "dots-and-boxes" }: Props) {
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [mode, setMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<AIDifficulty>("medium");
  const [turn, setTurn] = useState<Player>(1);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Horizontal edges: gridSize rows, gridSize - 1 cols
  // Vertical edges: gridSize - 1 rows, gridSize cols
  const [hEdges, setHEdges] = useState<(Player | null)[][]>(() =>
    Array.from({ length: 4 }, () => Array(3).fill(null))
  );
  const [vEdges, setVEdges] = useState<(Player | null)[][]>(() =>
    Array.from({ length: 3 }, () => Array(4).fill(null))
  );
  // Boxes: (gridSize - 1) x (gridSize - 1)
  const [boxes, setBoxes] = useState<(Player | null)[][]>(() =>
    Array.from({ length: 3 }, () => Array(3).fill(null))
  );

  const totalBoxes = (gridSize - 1) * (gridSize - 1);

  // Initialize/Reset game
  const resetGame = useCallback(
    (size = gridSize) => {
      sound.playClick();
      setGridSize(size);
      setHEdges(Array.from({ length: size }, () => Array(size - 1).fill(null)));
      setVEdges(Array.from({ length: size - 1 }, () => Array(size).fill(null)));
      setBoxes(Array.from({ length: size - 1 }, () => Array(size - 1).fill(null)));
      setTurn(1);
      setP1Score(0);
      setP2Score(0);
      setGameOver(false);
      setWinner(null);
      setIsAIThinking(false);
    },
    [gridSize]
  );

  // Check if a specific box [r, c] is completed
  const isBoxComplete = (
    r: number,
    c: number,
    h: (Player | null)[][],
    v: (Player | null)[][]
  ): boolean => {
    return (
      h[r][c] !== null &&
      h[r + 1][c] !== null &&
      v[r][c] !== null &&
      v[r][c + 1] !== null
    );
  };

  // Human / AI clicks edge
  const makeMove = useCallback(
    (type: "h" | "v", r: number, c: number, player: Player) => {
      if (gameOver) return;

      const newH = hEdges.map((row) => [...row]);
      const newV = vEdges.map((row) => [...row]);
      const newBoxes = boxes.map((row) => [...row]);

      if (type === "h") {
        if (newH[r][c] !== null) return;
        newH[r][c] = player;
      } else {
        if (newV[r][c] !== null) return;
        newV[r][c] = player;
      }

      sound.playClick();

      // Check if any box was just completed by this edge
      let boxesCompleted = 0;
      const bRows = gridSize - 1;
      const bCols = gridSize - 1;

      // Affected boxes by horizontal edge (r, c):
      // box above (r-1, c) and box below (r, c)
      if (type === "h") {
        if (r > 0 && newBoxes[r - 1][c] === null && isBoxComplete(r - 1, c, newH, newV)) {
          newBoxes[r - 1][c] = player;
          boxesCompleted++;
        }
        if (r < bRows && newBoxes[r][c] === null && isBoxComplete(r, c, newH, newV)) {
          newBoxes[r][c] = player;
          boxesCompleted++;
        }
      } else {
        // Affected boxes by vertical edge (r, c):
        // box left (r, c-1) and box right (r, c)
        if (c > 0 && newBoxes[r][c - 1] === null && isBoxComplete(r, c - 1, newH, newV)) {
          newBoxes[r][c - 1] = player;
          boxesCompleted++;
        }
        if (c < bCols && newBoxes[r][c] === null && isBoxComplete(r, c, newH, newV)) {
          newBoxes[r][c] = player;
          boxesCompleted++;
        }
      }

      setHEdges(newH);
      setVEdges(newV);
      setBoxes(newBoxes);

      const nextP1 = player === 1 ? p1Score + boxesCompleted : p1Score;
      const nextP2 = player === 2 ? p2Score + boxesCompleted : p2Score;
      if (boxesCompleted > 0) {
        if (player === 1) setP1Score(nextP1);
        else setP2Score(nextP2);
      }

      // Check Game Over
      if (nextP1 + nextP2 >= totalBoxes) {
        setGameOver(true);
        if (nextP1 > nextP2) {
          setWinner(1);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } else if (nextP2 > nextP1) {
          setWinner(2);
        } else {
          setWinner("draw");
        }
        return;
      }

      // If player completed a box, they get another turn! Otherwise switch turn.
      if (boxesCompleted === 0) {
        setTurn(player === 1 ? 2 : 1);
      }
    },
    [boxes, gameOver, gridSize, hEdges, p1Score, p2Score, totalBoxes, vEdges]
  );

  // AI Logic
  useEffect(() => {
    if (mode !== "ai" || turn !== 2 || gameOver) return;

    setIsAIThinking(true);
    const timer = setTimeout(() => {
      // Find all available moves
      const availableMoves: { type: "h" | "v"; r: number; c: number; score: number }[] = [];
      const bRows = gridSize - 1;
      const bCols = gridSize - 1;

      // Helper: evaluate how many sides a box has
      const countBoxSides = (
        br: number,
        bc: number,
        h: (Player | null)[][],
        v: (Player | null)[][]
      ) => {
        let count = 0;
        if (h[br][bc] !== null) count++;
        if (h[br + 1][bc] !== null) count++;
        if (v[br][bc] !== null) count++;
        if (v[br][bc + 1] !== null) count++;
        return count;
      };

      // Check all horizontal edges
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize - 1; c++) {
          if (hEdges[r][c] === null) {
            let score = 0;
            // Check box above
            if (r > 0) {
              const sides = countBoxSides(r - 1, c, hEdges, vEdges);
              if (sides === 3) score += 100; // Completes a box!
              else if (sides === 2 && difficulty !== "easy") score -= 50; // Don't give opponent 3rd side
            }
            // Check box below
            if (r < bRows) {
              const sides = countBoxSides(r, c, hEdges, vEdges);
              if (sides === 3) score += 100;
              else if (sides === 2 && difficulty !== "easy") score -= 50;
            }
            availableMoves.push({ type: "h", r, c, score });
          }
        }
      }

      // Check all vertical edges
      for (let r = 0; r < gridSize - 1; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (vEdges[r][c] === null) {
            let score = 0;
            // Check box left
            if (c > 0) {
              const sides = countBoxSides(r, c - 1, hEdges, vEdges);
              if (sides === 3) score += 100;
              else if (sides === 2 && difficulty !== "easy") score -= 50;
            }
            // Check box right
            if (c < bCols) {
              const sides = countBoxSides(r, c, hEdges, vEdges);
              if (sides === 3) score += 100;
              else if (sides === 2 && difficulty !== "easy") score -= 50;
            }
            availableMoves.push({ type: "v", r, c, score });
          }
        }
      }

      if (availableMoves.length === 0) {
        setIsAIThinking(false);
        return;
      }

      // Pick move based on difficulty
      let chosenMove = availableMoves[0];

      if (difficulty === "easy") {
        // Random move, but 50% chance to claim if completion exists
        const winningMoves = availableMoves.filter((m) => m.score >= 100);
        if (winningMoves.length > 0 && Math.random() > 0.5) {
          chosenMove = winningMoves[Math.floor(Math.random() * winningMoves.length)];
        } else {
          chosenMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
      } else {
        // Sort descending by score
        availableMoves.sort((a, b) => b.score - a.score);
        const topScore = availableMoves[0].score;
        const bestMoves = availableMoves.filter((m) => m.score === topScore);
        chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
      }

      setIsAIThinking(false);
      makeMove(chosenMove.type, chosenMove.r, chosenMove.c, 2);
    }, 400);

    return () => clearTimeout(timer);
  }, [difficulty, gameOver, gridSize, hEdges, makeMove, mode, turn, vEdges]);

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
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#F97316] bg-[#FFF7ED] px-2.5 py-0.5 rounded-full border border-[#FFEDD5]">
            Online Dots & Boxes Duel
          </span>
        </div>
        <MultiplayerLobby defaultGameType="dots-and-boxes" />
      </div>
    );
  }

  // Dynamic dimensions based on gridSize
  const cellSize =
    gridSize <= 4 ? 72 :
    gridSize <= 5 ? 62 :
    gridSize <= 6 ? 54 :
    gridSize <= 7 ? 46 :
    gridSize <= 9 ? 38 : 34;

  const dotSize =
    gridSize <= 5 ? 16 :
    gridSize <= 7 ? 14 :
    gridSize <= 9 ? 12 : 10;

  const edgeThickness =
    gridSize <= 5 ? 8 :
    gridSize <= 7 ? 6 :
    gridSize <= 9 ? 5 : 4;

  const offset = 16;
  const boardWidth = (gridSize - 1) * cellSize + offset * 2;
  const boardHeight = (gridSize - 1) * cellSize + offset * 2;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 select-none">
      {/* Top Controls Bar */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2 flex-wrap">
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
            <span>vs AI</span>
          </button>
          <button
            onClick={() => {
              setMode("pvp");
              resetGame();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === "pvp"
                ? "bg-[#6366F1] text-white shadow-xs"
                : "bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2 Player</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setMode("online");
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-[#FFF7ED] text-[#F97316] hover:bg-[#FFEDD5] border border-[#FFEDD5] cursor-pointer"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>2 Devices (Live)</span>
          </button>
        </div>

        {/* Board size selector */}
        <div className="flex items-center gap-1 bg-[#F0F0ED] p-1 rounded-xl text-xs font-bold overflow-x-auto max-w-full">
          {([3, 4, 5, 6, 7, 9, 11] as GridSize[]).map((s) => (
            <button
              key={s}
              onClick={() => resetGame(s)}
              className={`px-2 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                gridSize === s ? "bg-white text-[#202124] shadow-xs" : "text-[#6B7280] hover:text-[#202124]"
              }`}
            >
              {s - 1}×{s - 1}
            </button>
          ))}
        </div>

        {/* Reset & Rules */}
        <div className="flex items-center gap-1.5">
          {mode === "ai" && (
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as AIDifficulty)}
              className="text-xs font-bold bg-[#F0F0ED] border border-[#E8E8E5] rounded-xl px-2 py-1.5 text-[#202124]"
            >
              <option value="easy">Easy AI</option>
              <option value="medium">Medium AI</option>
              <option value="hard">Master AI</option>
            </select>
          )}
          <button
            onClick={() => resetGame()}
            className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] hover:bg-[#E8E8E5] transition-colors cursor-pointer"
            title="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRules(!showRules)}
            className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] transition-colors cursor-pointer"
            title="How to play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="w-full bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl p-4 text-xs text-[#202124] space-y-2">
          <h4 className="font-black text-sm text-[#F97316] flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Rules of Dots & Boxes:
          </h4>
          <p>
            1. Players take turns drawing a single line between two adjacent unlinked dots.
          </p>
          <p>
            2. When you complete the 4th side of a 1×1 box, you claim it and <strong>get another turn immediately</strong>!
          </p>
          <p>
            3. The player with the most claimed boxes when the grid is full wins!
          </p>
        </div>
      )}

      {/* Score & Turn Banner */}
      <div className="w-full grid grid-cols-2 gap-3">
        {/* Player 1 Card */}
        <div
          className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
            turn === 1 && !gameOver
              ? "bg-[#EEF2FF] border-[#6366F1] shadow-xs ring-2 ring-[#6366F1]/30"
              : "bg-white border-[#E8E8E5]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6366F1] text-white font-black flex items-center justify-center text-xs shadow-xs">
              P1
            </div>
            <div>
              <span className="text-xs font-bold text-[#202124] block">Player 1</span>
              <span className="text-[10px] text-[#6366F1] font-semibold">
                {turn === 1 && !gameOver ? "Thinking..." : "Waiting"}
              </span>
            </div>
          </div>
          <div className="text-xl font-black text-[#6366F1]">{p1Score}</div>
        </div>

        {/* Player 2 / AI Card */}
        <div
          className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
            turn === 2 && !gameOver
              ? "bg-[#FFF7ED] border-[#F97316] shadow-xs ring-2 ring-[#F97316]/30"
              : "bg-white border-[#E8E8E5]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F97316] text-white font-black flex items-center justify-center text-xs shadow-xs">
              {mode === "ai" ? "AI" : "P2"}
            </div>
            <div>
              <span className="text-xs font-bold text-[#202124] block">
                {mode === "ai" ? "Smart Bot" : "Player 2"}
              </span>
              <span className="text-[10px] text-[#F97316] font-semibold">
                {isAIThinking
                  ? "Calculating..."
                  : turn === 2 && !gameOver
                  ? "Thinking..."
                  : "Waiting"}
              </span>
            </div>
          </div>
          <div className="text-xl font-black text-[#F97316]">{p2Score}</div>
        </div>
      </div>

      {/* Main Interactive Board */}
      <div className="bg-white border border-[#E8E8E5] rounded-3xl p-4 sm:p-6 shadow-sm flex items-center justify-center relative w-full overflow-x-auto max-w-full">
        <div
          className="relative inline-block my-2"
          style={{
            width: `${boardWidth}px`,
            height: `${boardHeight}px`,
          }}
        >
          {/* Claimed Box Backgrounds */}
          {Array.from({ length: gridSize - 1 }).map((_, r) =>
            Array.from({ length: gridSize - 1 }).map((_, c) => {
              const owner = boxes[r][c];
              return (
                <div
                  key={`box-${r}-${c}`}
                  className={`absolute rounded-md sm:rounded-xl flex items-center justify-center font-black transition-all duration-300 ${
                    owner === 1
                      ? "bg-[#6366F1]/20 text-[#6366F1] scale-100"
                      : owner === 2
                      ? "bg-[#F97316]/20 text-[#F97316] scale-100"
                      : "scale-95 opacity-0"
                  } ${
                    gridSize >= 10
                      ? "text-[9px]"
                      : gridSize >= 7
                      ? "text-xs"
                      : gridSize >= 5
                      ? "text-sm"
                      : "text-lg"
                  }`}
                  style={{
                    left: `${c * cellSize + offset + Math.round(dotSize / 2)}px`,
                    top: `${r * cellSize + offset + Math.round(dotSize / 2)}px`,
                    width: `${cellSize - dotSize}px`,
                    height: `${cellSize - dotSize}px`,
                  }}
                >
                  {owner === 1 ? "P1" : owner === 2 ? (mode === "ai" ? "AI" : "P2") : ""}
                </div>
              );
            })
          )}

          {/* Horizontal Edges */}
          {Array.from({ length: gridSize }).map((_, r) =>
            Array.from({ length: gridSize - 1 }).map((_, c) => {
              const owner = hEdges[r][c];
              return (
                <button
                  key={`h-${r}-${c}`}
                  type="button"
                  disabled={owner !== null || (mode === "ai" && turn === 2) || gameOver}
                  onClick={() => makeMove("h", r, c, turn)}
                  className={`absolute rounded-full transition-all cursor-pointer ${
                    owner === 1
                      ? "bg-[#6366F1] shadow-xs"
                      : owner === 2
                      ? "bg-[#F97316] shadow-xs"
                      : "bg-[#E8E8E5] hover:bg-[#6366F1]/60"
                  }`}
                  style={{
                    left: `${c * cellSize + offset + Math.round(dotSize / 3)}px`,
                    top: `${r * cellSize + offset - Math.round(edgeThickness / 2)}px`,
                    width: `${cellSize - Math.round(dotSize * 2 / 3)}px`,
                    height: `${owner !== null ? edgeThickness : Math.max(edgeThickness - 2, 2.5)}px`,
                  }}
                  aria-label={`Horizontal edge row ${r} col ${c}`}
                />
              );
            })
          )}

          {/* Vertical Edges */}
          {Array.from({ length: gridSize - 1 }).map((_, r) =>
            Array.from({ length: gridSize }).map((_, c) => {
              const owner = vEdges[r][c];
              return (
                <button
                  key={`v-${r}-${c}`}
                  type="button"
                  disabled={owner !== null || (mode === "ai" && turn === 2) || gameOver}
                  onClick={() => makeMove("v", r, c, turn)}
                  className={`absolute rounded-full transition-all cursor-pointer ${
                    owner === 1
                      ? "bg-[#6366F1] shadow-xs"
                      : owner === 2
                      ? "bg-[#F97316] shadow-xs"
                      : "bg-[#E8E8E5] hover:bg-[#6366F1]/60"
                  }`}
                  style={{
                    left: `${c * cellSize + offset - Math.round(edgeThickness / 2)}px`,
                    top: `${r * cellSize + offset + Math.round(dotSize / 3)}px`,
                    width: `${owner !== null ? edgeThickness : Math.max(edgeThickness - 2, 2.5)}px`,
                    height: `${cellSize - Math.round(dotSize * 2 / 3)}px`,
                  }}
                  aria-label={`Vertical edge row ${r} col ${c}`}
                />
              );
            })
          )}

          {/* Dots on Grid Intersections */}
          {Array.from({ length: gridSize }).map((_, r) =>
            Array.from({ length: gridSize }).map((_, c) => (
              <div
                key={`dot-${r}-${c}`}
                className="absolute rounded-full bg-[#202124] shadow-xs border-2 border-white pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${c * cellSize + offset}px`,
                  top: `${r * cellSize + offset}px`,
                  width: `${dotSize}px`,
                  height: `${dotSize}px`,
                }}
              />
            ))
          )}
        </div>

        {/* Game Over Modal Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316]">
              <Trophy className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-black text-[#202124]">
              {winner === 1
                ? "Player 1 Wins! 🏆"
                : winner === 2
                ? mode === "ai"
                  ? "Bot Takes the Match! 🤖"
                  : "Player 2 Wins! 🏆"
                : "It's an Epic Draw! 🤝"}
            </h3>

            <p className="text-xs font-semibold text-[#6B7280]">
              Final score: Player 1 ({p1Score}) vs {mode === "ai" ? "Bot" : "Player 2"} ({p2Score})
            </p>

            <button
              onClick={() => resetGame()}
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
