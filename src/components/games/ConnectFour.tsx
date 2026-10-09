"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  MessageSquare,
  Send,
  HelpCircle,
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
  const [showRules, setShowRules] = useState(false);

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

  // In-game temporary chat state
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: "p1" | "p2" | "ai" | "system"; senderName: string; text: string; timestamp: number }[]
  >([
    {
      id: "c4_init_1",
      sender: "system",
      senderName: "Arena System",
      text: "Connect Four battle live! Drop discs to align 4 horizontally, vertically, or diagonally.",
      timestamp: Date.now(),
    },
    {
      id: "c4_init_2",
      sender: "ai",
      senderName: "Smart Bot",
      text: "Good luck! Watch your diagonals carefully 🟡🔴",
      timestamp: Date.now() + 100,
    },
  ]);
  const [chatInputText, setChatInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const addChatMessage = useCallback(
    (text: string, sender: "p1" | "p2" = "p1") => {
      sound.playClick();
      const newMsg = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        sender,
        senderName: sender === "p1" ? "Player 1 (Red)" : mode === "ai" ? "Smart Bot" : "Player 2 (Yellow)",
        text: text.slice(0, 160),
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev.slice(-30), newMsg]);

      if (mode === "ai" && sender === "p1") {
        setTimeout(() => {
          const botReplies = [
            "Nice column drop! Thinking... 🤔",
            "I see what you are setting up! 🛡️",
            "Don't forget to block me! ⚡",
            "Tactical play! Let's see your next disc 🔴",
            "Connect Four is all about foresight! 🧠",
            "GG! Excellent moves! 👏",
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
        }, 600);
      }
    },
    [mode]
  );

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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
    <div className="w-full max-w-6xl mx-auto space-y-4 select-none text-[#202124]">
      {/* 1. TOP HEADER BAR: "leavel and other" */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs space-y-3">
        {/* Row 1: Mode Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              sound.playClick();
              setMode("ai");
              resetBoard();
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
              setMode("cross-device");
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
              setMode("cross-device");
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-[#F0FDF4] text-[#16A34A] hover:bg-[#DCFCE7] border border-[#DCFCE7] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Play with Random Live</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setMode("local");
              resetBoard();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              mode === "local"
                ? "bg-[#202124] text-white shadow-xs"
                : "text-[#9CA3AF] hover:text-[#4B5563]"
            }`}
            title="Pass & play on same device"
          >
            <span>1-Device</span>
          </button>
        </div>

        {/* Row 2: AI Difficulty / Options on Left, Undo / Restart / Rules on Right */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F0F0ED] p-1 rounded-xl text-xs font-bold overflow-x-auto scrollbar-none">
            {mode === "ai" ? (
              (["easy", "medium", "hard"] as AIDifficulty[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    sound.playClick();
                    setDifficulty(lvl);
                    resetBoard();
                  }}
                  className={`px-3 py-1 rounded-lg capitalize transition-all shrink-0 cursor-pointer ${
                    difficulty === lvl
                      ? "bg-white text-[#202124] shadow-xs"
                      : "text-[#6B7280] hover:text-[#202124]"
                  }`}
                >
                  {lvl === "hard" ? "Master AI" : `${lvl} AI`}
                </button>
              ))
            ) : (
              <span className="px-3 py-1 text-[#6B7280]">
                {mode === "local" ? "Same Device Pass & Play" : "Multiplayer Live"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0 || winner !== null || isAIThinking}
              className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] hover:bg-[#E8E8E5] disabled:opacity-40 transition-colors cursor-pointer"
              title="Undo Move"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={resetBoard}
              className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] hover:bg-[#E8E8E5] transition-colors cursor-pointer"
              title="Restart Board"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowRules(!showRules)}
              className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] hover:bg-[#E8E8E5] transition-colors cursor-pointer"
              title="How to play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rules Banner (Collapsible) */}
      {showRules && (
        <div className="w-full bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl p-4 text-xs text-[#202124] space-y-1.5 animate-in fade-in">
          <h4 className="font-black text-sm text-[#F97316] flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Rules of Connect Four:
          </h4>
          <p>1. Players take turns choosing a column to drop their colored disc into.</p>
          <p>2. Discs fall to the lowest unoccupied space in the selected column.</p>
          <p>3. First player to connect 4 consecutive discs in a row horizontally, vertically, or diagonally wins!</p>
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
                Connect Four Grid (7×6)
              </span>
            </div>
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                currentTurn === 1
                  ? "bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]"
                  : "bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]"
              }`}
            >
              {currentTurn === 1 ? "Red Disc Turn" : "Yellow Disc Turn"}
            </span>
          </div>

          {/* Interactive Board Centered */}
          <div className="flex-1 flex flex-col items-center justify-center my-3 w-full">
            <div className="w-full max-w-[440px] flex flex-col items-center">
              {/* Drop Buttons Header */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full mb-2">
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
                      className={`h-9 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
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

              {/* Physical 7x6 Connect 4 Grid */}
              <div className="w-full aspect-[7/6] bg-[#4F46E5] p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-inner border-4 border-[#4338CA] flex flex-col justify-center">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 h-full">
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
            </div>
          </div>

          <div className="text-center text-[11px] text-[#9CA3AF] pt-2 border-t border-[#F0F0ED]">
            Click any column header arrow to drop your disc to the lowest open row.
          </div>

          {/* Victory Modal Overlay */}
          {winner !== null && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316]">
                <Trophy className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-black text-[#202124]">
                {winner === 1
                  ? mode === "ai"
                    ? "Victory! You Connected 4! 🏆"
                    : "Player 1 (Red) Wins! 🏆"
                  : winner === 2
                  ? mode === "ai"
                    ? "Bot Connected 4! 🤖"
                    : "Player 2 (Yellow) Wins! 🏆"
                  : "Stalemate! Epic Draw 🤝"}
              </h3>

              <p className="text-xs font-semibold text-[#6B7280]">
                {winner === 1 && mode === "ai"
                  ? "+50 XP awarded to your balance!"
                  : "Great match! Play again to test new strategies."}
              </p>

              <button
                onClick={resetBoard}
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
          {/* Player 1 Scorecard */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              currentTurn === 1 && winner === null
                ? "bg-[#FEF2F2] border-[#EF4444] shadow-xs ring-2 ring-[#EF4444]/30"
                : "bg-white border-[#E8E8E5]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EF4444] text-white font-black flex items-center justify-center text-xs shadow-xs">
                P1
              </div>
              <div>
                <span className="text-xs font-bold text-[#202124] block">
                  {mode === "ai" ? "You (Red)" : "Player 1 (Red)"}
                </span>
                <span className="text-[10px] text-[#DC2626] font-semibold flex items-center gap-1">
                  {currentTurn === 1 && winner === null ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
                      Thinking...
                    </>
                  ) : (
                    "Waiting"
                  )}
                </span>
              </div>
            </div>
            <div className="text-2xl font-black text-[#DC2626]">{scores.p1}</div>
          </div>

          {/* Player 2 / AI Scorecard */}
          <div
            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              currentTurn === 2 && winner === null
                ? "bg-[#FFFBEB] border-[#F59E0B] shadow-xs ring-2 ring-[#F59E0B]/30"
                : "bg-white border-[#E8E8E5]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F59E0B] text-white font-black flex items-center justify-center text-xs shadow-xs">
                {mode === "ai" ? "AI" : "P2"}
              </div>
              <div>
                <span className="text-xs font-bold text-[#202124] block">
                  {mode === "ai" ? "Smart Bot (Yellow)" : "Player 2 (Yellow)"}
                </span>
                <span className="text-[10px] text-[#D97706] font-semibold flex items-center gap-1">
                  {isAIThinking ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                      Calculating...
                    </>
                  ) : currentTurn === 2 && winner === null ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
                      Thinking...
                    </>
                  ) : (
                    "Waiting"
                  )}
                </span>
              </div>
            </div>
            <div className="text-2xl font-black text-[#D97706]">{scores.p2}</div>
          </div>

          {/* Turn Status Banner */}
          <div
            className={`p-3 rounded-2xl border text-center transition-all ${
              winner !== null
                ? "bg-[#F7F7F5] border-[#E8E8E5] text-[#202124]"
                : currentTurn === 1
                ? "bg-[#FEF2F2] border-[#FEE2E2] text-[#991B1B]"
                : "bg-[#FFFBEB] border-[#FEF3C7] text-[#92400E]"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
              Current Turn
            </span>
            <span className="text-xs font-black">
              {winner !== null
                ? "Match Finished"
                : isAIThinking
                ? "🤖 Bot Calculating Strategy..."
                : currentTurn === 1
                ? "🎯 Red Disc's Turn"
                : "🎯 Yellow Disc's Turn"}
            </span>
          </div>

          {/* Game Details Summary Card */}
          <div className="bg-white border border-[#E8E8E5] rounded-2xl p-4 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#202124]">Discs Dropped</span>
                <span className="text-xs font-mono font-bold text-[#6B7280]">
                  {moveHistory.length} / 42
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-[#F0F0ED] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(moveHistory.length / 42) * 100}%` }}
                  className="bg-[#6366F1] transition-all duration-300"
                />
              </div>

              <div className="space-y-1.5 text-[11px] text-[#6B7280] font-medium pt-1">
                <div className="flex items-center justify-between">
                  <span>Draws:</span>
                  <span className="font-bold text-[#202124]">{scores.draws} ties</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Win Condition:</span>
                  <span className="font-bold text-emerald-600">4 in a row</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Board Size:</span>
                  <span className="font-bold text-[#202124]">7 Cols × 6 Rows</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#F0F0ED]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleUndo}
                  disabled={moveHistory.length === 0 || winner !== null || isAIThinking}
                  className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-[#F7F7F5] hover:bg-[#EEF2FF] hover:text-[#6366F1] text-[#202124] disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
                <button
                  onClick={resetBoard}
                  className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-[#F7F7F5] hover:bg-[#EEF2FF] hover:text-[#6366F1] text-[#202124] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              </div>

              <button
                onClick={() => setShowRewardedAd(true)}
                className="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold text-[#C2410C] bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FFEDD5] transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Gift className="w-3 h-3 text-[#F97316]" />
                <span>Claim +50 XP</span>
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
              {["👏", "🔥", "😂", "😎", "🤯", "🎉", "💀", "🚀"].map((emoji) => (
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
              {["Connect 4! 🔥", "Watch diagonal! ⚡", "Nice drop! 👏", "Good game! 🎉"].map((taunt) => (
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

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onRewardClaimed={(bonus) => setEarnedXp((prev) => prev + bonus)}
      />
    </div>
  );
}


