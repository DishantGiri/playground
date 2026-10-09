"use client";

import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Users,
  Bot,
  Smartphone,
  Laptop,
  ChevronDown,
  Gift,
  ArrowRight,
  ShieldAlert,
  Zap,
  Undo2,
} from "lucide-react";
import { checkConnectFourWinner } from "@/lib/multiplayerStore";
import { sound } from "@/lib/audio";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { MultiplayerLobby } from "@/components/multiplayer/MultiplayerLobby";
import Link from "next/link";

interface Props {
  activitySlug?: string;
}

type GameMode = "ai" | "local" | "cross-device";
type AIDifficulty = "easy" | "medium" | "hard";

const ROWS = 6;
const COLS = 7;

export function ConnectFour({ activitySlug = "connect-4" }: Props) {
  const [mode, setMode] = useState<GameMode>("ai");
  const [onlineInitialMode, setOnlineInitialMode] = useState<"friends" | "random">("friends");
  const [difficulty, setDifficulty] = useState<AIDifficulty>("medium");

  // Game board: 42 cells (6 rows x 7 cols)
  const [board, setBoard] = useState<(1 | 2 | null)[]>(() => Array(42).fill(null));
  const [currentTurn, setCurrentTurn] = useState<1 | 2>(1); // 1 = Red, 2 = Yellow
  const [winner, setWinner] = useState<1 | 2 | "draw" | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [moveHistory, setMoveHistory] = useState<number[]>([]); // list of column choices

  // Score Tracking
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  // Reset board
  const resetBoard = useCallback(() => {
    sound.playClick();
    setBoard(Array(42).fill(null));
    setCurrentTurn(1);
    setWinner(null);
    setWinningCells([]);
    setMoveHistory([]);
    setIsAIThinking(false);
  }, []);

  // Helper to find lowest available row in column
  const getLowestEmptyRow = (currentBoard: (1 | 2 | null)[], col: number): number => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (currentBoard[r * COLS + col] === null) {
        return r;
      }
    }
    return -1;
  };

  // Check valid columns
  const getValidColumns = (currentBoard: (1 | 2 | null)[]): number[] => {
    const valid: number[] = [];
    for (let c = 0; c < COLS; c++) {
      if (currentBoard[c] === null) {
        valid.push(c);
      }
    }
    return valid;
  };

  // Score a window of 4 cells for AI heuristic
  const evaluateWindow = (window: (1 | 2 | null)[], piece: 1 | 2): number => {
    let score = 0;
    const oppPiece = piece === 1 ? 2 : 1;
    const pieceCount = window.filter((p) => p === piece).length;
    const emptyCount = window.filter((p) => p === null).length;
    const oppCount = window.filter((p) => p === oppPiece).length;

    if (pieceCount === 4) score += 1000;
    else if (pieceCount === 3 && emptyCount === 1) score += 50;
    else if (pieceCount === 2 && emptyCount === 2) score += 10;

    if (oppCount === 3 && emptyCount === 1) score -= 80; // Block opponent win!

    return score;
  };

  // Evaluate entire board score for AI (Player 2)
  const scoreBoardPosition = (b: (1 | 2 | null)[], piece: 1 | 2): number => {
    let score = 0;

    // Center column preference
    const centerCol = 3;
    let centerCount = 0;
    for (let r = 0; r < ROWS; r++) {
      if (b[r * COLS + centerCol] === piece) centerCount++;
    }
    score += centerCount * 6;

    // Horizontal windows
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window = [b[r * COLS + c], b[r * COLS + c + 1], b[r * COLS + c + 2], b[r * COLS + c + 3]];
        score += evaluateWindow(window, piece);
      }
    }

    // Vertical windows
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++) {
        const window = [b[r * COLS + c], b[(r + 1) * COLS + c], b[(r + 2) * COLS + c], b[(r + 3) * COLS + c]];
        score += evaluateWindow(window, piece);
      }
    }

    // Positive diagonal
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window = [b[r * COLS + c], b[(r + 1) * COLS + c + 1], b[(r + 2) * COLS + c + 2], b[(r + 3) * COLS + c + 3]];
        score += evaluateWindow(window, piece);
      }
    }

    // Negative diagonal
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        const window = [b[r * COLS + c], b[(r - 1) * COLS + c + 1], b[(r - 2) * COLS + c + 2], b[(r - 3) * COLS + c + 3]];
        score += evaluateWindow(window, piece);
      }
    }

    return score;
  };

  // Minimax with Alpha-Beta Pruning for Master AI
  const minimax = (
    b: (1 | 2 | null)[],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): { col: number; score: number } => {
    const validCols = getValidColumns(b);
    const winInfo = checkConnectFourWinner(b);

    if (winInfo?.winner === 2) return { col: -1, score: 100000 + depth };
    if (winInfo?.winner === 1) return { col: -1, score: -100000 - depth };
    if (validCols.length === 0 || depth === 0) {
      return { col: -1, score: scoreBoardPosition(b, 2) };
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      let bestCol = validCols[Math.floor(Math.random() * validCols.length)];

      for (const col of validCols) {
        const row = getLowestEmptyRow(b, col);
        const tempBoard = [...b];
        tempBoard[row * COLS + col] = 2;
        const res = minimax(tempBoard, depth - 1, alpha, beta, false);
        if (res.score > maxScore) {
          maxScore = res.score;
          bestCol = col;
        }
        alpha = Math.max(alpha, maxScore);
        if (alpha >= beta) break;
      }
      return { col: bestCol, score: maxScore };
    } else {
      let minScore = Infinity;
      let bestCol = validCols[Math.floor(Math.random() * validCols.length)];

      for (const col of validCols) {
        const row = getLowestEmptyRow(b, col);
        const tempBoard = [...b];
        tempBoard[row * COLS + col] = 1;
        const res = minimax(tempBoard, depth - 1, alpha, beta, true);
        if (res.score < minScore) {
          minScore = res.score;
          bestCol = col;
        }
        beta = Math.min(beta, minScore);
        if (alpha >= beta) break;
      }
      return { col: bestCol, score: minScore };
    }
  };

  // Execute AI move
  const triggerAIMove = useCallback(
    (currentBoard: (1 | 2 | null)[]) => {
      const validCols = getValidColumns(currentBoard);
      if (validCols.length === 0) return;

      setIsAIThinking(true);

      setTimeout(() => {
        let chosenCol: number = validCols[0];

        if (difficulty === "easy") {
          // Casual: random column
          chosenCol = validCols[Math.floor(Math.random() * validCols.length)];
        } else if (difficulty === "medium") {
          // Tactical: Check immediate AI win or immediate block
          let moveFound = false;

          // 1. Can AI win on this turn?
          for (const col of validCols) {
            const row = getLowestEmptyRow(currentBoard, col);
            const temp = [...currentBoard];
            temp[row * COLS + col] = 2;
            if (checkConnectFourWinner(temp)?.winner === 2) {
              chosenCol = col;
              moveFound = true;
              break;
            }
          }

          // 2. Can Player win on next turn? Block it!
          if (!moveFound) {
            for (const col of validCols) {
              const row = getLowestEmptyRow(currentBoard, col);
              const temp = [...currentBoard];
              temp[row * COLS + col] = 1;
              if (checkConnectFourWinner(temp)?.winner === 1) {
                chosenCol = col;
                moveFound = true;
                break;
              }
            }
          }

          if (!moveFound) {
            // Favor center
            if (validCols.includes(3) && Math.random() < 0.6) {
              chosenCol = 3;
            } else {
              chosenCol = validCols[Math.floor(Math.random() * validCols.length)];
            }
          }
        } else {
          // Grandmaster: Minimax depth 4
          const { col } = minimax(currentBoard, 4, -Infinity, Infinity, true);
          chosenCol = col !== -1 ? col : validCols[0];
        }

        // Execute drop
        const targetRow = getLowestEmptyRow(currentBoard, chosenCol);
        if (targetRow !== -1) {
          const nextBoard = [...currentBoard];
          const cellIndex = targetRow * COLS + chosenCol;
          nextBoard[cellIndex] = 2;
          sound.playDrop();

          setBoard(nextBoard);
          setMoveHistory((prev) => [...prev, chosenCol]);

          const winInfo = checkConnectFourWinner(nextBoard);
          if (winInfo) {
            sound.playIncorrect();
            setWinner(2);
            setWinningCells(winInfo.cells);
            setScores((s) => ({ ...s, p2: s.p2 + 1 }));
          } else if (nextBoard.every((c) => c !== null)) {
            setWinner("draw");
            setScores((s) => ({ ...s, draws: s.draws + 1 }));
          } else {
            setCurrentTurn(1);
          }
        }

        setIsAIThinking(false);
      }, 450);
    },
    [difficulty]
  );

  // Handle player disc drop
  const handleDrop = (col: number) => {
    if (winner !== null || isAIThinking) return;
    if (mode === "ai" && currentTurn !== 1) return;

    const row = getLowestEmptyRow(board, col);
    if (row === -1) return; // Column full

    sound.playDrop();
    const cellIndex = row * COLS + col;
    const nextBoard = [...board];
    const playerDisc = currentTurn;
    nextBoard[cellIndex] = playerDisc;

    setBoard(nextBoard);
    setMoveHistory((prev) => [...prev, col]);

    const winInfo = checkConnectFourWinner(nextBoard);
    if (winInfo) {
      sound.playWin();
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      setWinner(playerDisc);
      setWinningCells(winInfo.cells);
      setScores((s) => ({
        ...s,
        [playerDisc === 1 ? "p1" : "p2"]: s[playerDisc === 1 ? "p1" : "p2"] + 1,
      }));

      // Award XP
      if (mode === "ai" && playerDisc === 1) {
        fetch("/api/games/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activitySlug, score: 50 }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.pointsEarned) setEarnedXp(d.pointsEarned);
          })
          .catch(console.error);
      }
    } else if (nextBoard.every((c) => c !== null)) {
      setWinner("draw");
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    } else {
      const nextTurn = currentTurn === 1 ? 2 : 1;
      setCurrentTurn(nextTurn);

      if (mode === "ai" && nextTurn === 2) {
        triggerAIMove(nextBoard);
      }
    }
  };

  // Undo move (in local or AI mode)
  const handleUndo = () => {
    if (moveHistory.length === 0 || winner !== null || isAIThinking) return;
    sound.playClick();

    // In AI mode, undo both AI move and Player move
    const stepsToUndo = mode === "ai" ? Math.min(2, moveHistory.length) : 1;
    const newHistory = moveHistory.slice(0, -stepsToUndo);

    // Replay board from scratch
    const replayBoard: (1 | 2 | null)[] = Array(42).fill(null);
    let turn: 1 | 2 = 1;
    for (const c of newHistory) {
      const r = getLowestEmptyRow(replayBoard, c);
      if (r !== -1) {
        replayBoard[r * COLS + c] = turn;
        turn = turn === 1 ? 2 : 1;
      }
    }

    setBoard(replayBoard);
    setMoveHistory(newHistory);
    setCurrentTurn(turn);
    setWinner(null);
    setWinningCells([]);
  };

  // Cross-device online arena mode
  if (mode === "cross-device") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Navigation back to local/AI mode */}
        <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              sound.playClick();
              setMode("ai");
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Switch to Solo or Same-Device Mode</span>
          </button>

          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Live 2-Device Arena
          </span>
        </div>

        <MultiplayerLobby defaultGameType="connect-4" initialMode={onlineInitialMode} />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 rounded-2xl sm:rounded-3xl border border-[#E8E8E5] bg-[#F7F7F5] p-3 sm:p-4 lg:p-5 shadow-2xs">
      
      {/* 2-Card Full-Width Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 w-full items-stretch">
        
        {/* Left Card: Controls, Modes, Scores & Status */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 order-2 lg:order-1">
          
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
                  Connect Four Battle
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#202124] mt-1">
                  Connect 4 in a Line
                </h2>
              </div>

              {/* Status pulse */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] text-xs font-bold text-[#202124]">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    currentTurn === 1 ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                  } animate-ping`}
                />
                <span>{currentTurn === 1 ? "Red Disc" : "Yellow Disc"}</span>
              </div>
            </div>

            {/* Game Mode Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Select Game Mode
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  onClick={() => {
                    sound.playClick();
                    setMode("ai");
                    resetBoard();
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    mode === "ai"
                      ? "bg-[#EEF2FF] text-[#6366F1] border-[#C7D2FE] shadow-2xs font-black"
                      : "bg-white text-[#6B7280] border-[#E8E8E5] hover:text-[#202124] hover:bg-[#F0F0ED]"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Play with AI</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setOnlineInitialMode("friends");
                    setMode("cross-device");
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5] hover:bg-[#FFEDD5]"
                >
                  <Users className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>With Friends</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setOnlineInitialMode("random");
                    setMode("cross-device");
                  }}
                  className="py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7] hover:bg-[#DCFCE7]"
                >
                  <Zap className="w-3.5 h-3.5 text-[#16A34A] fill-current" />
                  <span>Random Live</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setMode("local");
                    resetBoard();
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    mode === "local"
                      ? "bg-[#202124] text-white border-[#202124] shadow-2xs"
                      : "bg-white text-[#9CA3AF] border-[#E8E8E5] hover:text-[#202124]"
                  }`}
                  title="Pass & play on same device"
                >
                  <span>1-Device</span>
                </button>
              </div>
            </div>

            {/* AI Difficulty Selector (When Solo mode) */}
            {mode === "ai" && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                  AI Difficulty
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["easy", "medium", "hard"] as AIDifficulty[]).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        sound.playClick();
                        setDifficulty(lvl);
                        resetBoard();
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                        difficulty === lvl
                          ? "bg-[#6366F1] text-white border-[#6366F1] shadow-2xs"
                          : "bg-white text-[#6B7280] border-[#E8E8E5] hover:text-[#202124] hover:bg-[#F0F0ED]"
                      }`}
                    >
                      {lvl === "hard" ? "Master" : lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Turn Banner or Victory Announcement */}
            {winner === null ? (
              <div
                className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                  currentTurn === 1
                    ? "bg-[#FEF2F2] text-[#991B1B] border-[#FEE2E2]"
                    : "bg-[#FFFBEB] text-[#92400E] border-[#FEF3C7]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      currentTurn === 1 ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                    } animate-ping`}
                  />
                  <span>
                    {isAIThinking
                      ? "AI is calculating..."
                      : currentTurn === 1
                      ? mode === "ai"
                        ? "Your Turn (Red Disc)"
                        : "Player 1's Turn (Red)"
                      : mode === "ai"
                      ? "AI's Turn (Yellow Disc)"
                      : "Player 2's Turn (Yellow)"}
                  </span>
                </div>

                <span className="text-[11px] opacity-75 font-normal">
                  Drop into any column
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white border-2 border-[#F97316]/40 text-center space-y-2 shadow-sm animate-in fade-in">
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center bg-[#FFF7ED] border border-[#FFEDD5]">
                  <Trophy className="w-5 h-5 text-[#F97316]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#202124]">
                    {winner === 1
                      ? mode === "ai"
                        ? "Victory! You Connected 4!"
                        : "Player 1 (Red) Wins!"
                      : winner === 2
                      ? mode === "ai"
                        ? "AI Connected 4!"
                        : "Player 2 (Yellow) Wins!"
                      : "Stalemate! Draw"}
                  </h3>
                  {winner === 1 && mode === "ai" && (
                    <p className="text-[11px] text-[#16A34A] font-bold mt-0.5">
                      +50 XP awarded to your balance
                    </p>
                  )}
                </div>

                <button
                  onClick={resetBoard}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#F97316] text-white hover:bg-[#EA580C] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play Again</span>
                </button>
              </div>
            )}

            {/* Score Tracker */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Session Scoreboard
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2]">
                  <span className="text-[10px] uppercase font-bold text-[#DC2626] block">
                    {mode === "ai" ? "You (Red)" : "Player 1"}
                  </span>
                  <span className="text-xl font-black text-[#991B1B]">{scores.p1}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F0F0ED] border border-[#E8E8E5]">
                  <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                    Ties
                  </span>
                  <span className="text-xl font-black text-[#202124]">{scores.draws}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7]">
                  <span className="text-[10px] uppercase font-bold text-[#D97706] block">
                    {mode === "ai" ? "AI (Yellow)" : "Player 2"}
                  </span>
                  <span className="text-xl font-black text-[#92400E]">{scores.p2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="space-y-2 pt-2 border-t border-[#E8E8E5]">
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={moveHistory.length === 0 || winner !== null || isAIThinking}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#202124] border border-[#E8E8E5] disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Undo Move</span>
              </button>

              <button
                onClick={resetBoard}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#202124] border border-[#E8E8E5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Restart</span>
              </button>
            </div>

            <button
              onClick={() => setShowRewardedAd(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-[#C2410C] bg-[#FFF7ED] border border-[#FFEDD5] hover:bg-[#FFEDD5] transition-all cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Claim +50 Bonus XP</span>
            </button>
          </div>

        </div>

        {/* Right Card: The Game Board (Full Width of Right Panel) */}
        <div className="rounded-2xl border border-[#E8E8E5] bg-white p-4 sm:p-6 shadow-xs flex flex-col items-center justify-center min-h-[440px] order-1 lg:order-2">
          
          <div className="w-full max-w-[500px] flex flex-col items-center">
            {/* Top Column Drop Buttons Header */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full mb-2.5">
              {Array.from({ length: 7 }).map((_, col) => {
                const isFull = board[col] !== null;
                const canDrop = winner === null && !isFull && !isAIThinking;

                return (
                  <button
                    key={col}
                    onClick={() => handleDrop(col)}
                    onMouseEnter={() => setHoverCol(col)}
                    onMouseLeave={() => setHoverCol(null)}
                    disabled={!canDrop}
                    className={`h-11 rounded-xl flex items-center justify-center transition-all ${
                      canDrop
                        ? currentTurn === 1
                          ? "bg-[#FEF2F2] hover:bg-[#EF4444] hover:text-white text-[#DC2626] cursor-pointer shadow-2xs"
                          : "bg-[#FFFBEB] hover:bg-[#F59E0B] hover:text-white text-[#D97706] cursor-pointer shadow-2xs"
                        : "opacity-20 cursor-not-allowed bg-[#F0F0ED] text-[#9CA3AF]"
                    }`}
                    title={canDrop ? `Drop disc in col ${col + 1}` : "Column full"}
                    aria-label={`Drop disc in column ${col + 1}`}
                  >
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </button>
                );
              })}
            </div>

            {/* The 7x6 Connect 4 Physical Board */}
            <div className="w-full aspect-[7/6] bg-[#4F46E5] p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-inner border-4 border-[#4338CA] flex flex-col justify-center">
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 h-full">
                {Array.from({ length: 42 }).map((_, idx) => {
                  const cellVal = board[idx];
                  const isWinning = winningCells.includes(idx);
                  const col = idx % 7;
                  const isHoverPreview = hoverCol === col && cellVal === null && winner === null && !isAIThinking;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleDrop(col)}
                      onMouseEnter={() => setHoverCol(col)}
                      onMouseLeave={() => setHoverCol(null)}
                      className={`aspect-square rounded-full flex items-center justify-center cursor-pointer transition-transform ${
                        cellVal === null
                          ? "bg-[#3730A3]/50 shadow-inner"
                          : cellVal === 1
                          ? "bg-[#EF4444] shadow-md"
                          : "bg-[#F59E0B] shadow-md"
                      } ${
                        isWinning ? "ring-4 ring-white animate-pulse scale-105" : ""
                      }`}
                    >
                      {cellVal !== null && (
                        <div className="w-3/4 h-3/4 rounded-full border border-white/40" />
                      )}

                      {cellVal === null && isHoverPreview && (
                        <div
                          className={`w-3/4 h-3/4 rounded-full opacity-40 transition-opacity ${
                            currentTurn === 1 ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Board Footer status */}
            <div className="w-full flex items-center justify-between text-xs text-[#6B7280] pt-3 px-1">
              <span>{mode === "ai" ? "Red (You) vs Yellow (AI)" : "Red (P1) vs Yellow (P2)"}</span>
              <span className="font-semibold text-[#202124]">Vertical, horizontal or diagonal</span>
            </div>
          </div>

        </div>

      </div>

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onRewardClaimed={(bonus) => setEarnedXp((prev) => prev + bonus)}
      />
    </div>
  );
}


