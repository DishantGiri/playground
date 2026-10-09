"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Play,
  Pause,
  Pencil,
  Eraser,
  Undo2,
  Lightbulb,
  Clock,
  Heart,
  Sparkles,
  Keyboard,
  CheckCircle2,
} from "lucide-react";
import { sound } from "@/lib/audio";

interface Props {
  activitySlug?: string;
}

type Difficulty = "easy" | "medium" | "hard" | "expert";

// 9x9 Sudoku Helper Functions
function getBoxIndex(r: number, c: number): number {
  return Math.floor(r / 3) * 3 + Math.floor(c / 3);
}

// Generate complete valid board with backtracking
function generateFullBoard(): number[][] {
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  const isValid = (grid: number[][], r: number, c: number, num: number) => {
    for (let i = 0; i < 9; i++) {
      if (grid[r][i] === num || grid[i][c] === num) return false;
    }
    const startR = Math.floor(r / 3) * 3;
    const startC = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[startR + i][startC + j] === num) return false;
      }
    }
    return true;
  };

  const solve = (r = 0, c = 0): boolean => {
    if (r === 9) return true;
    if (c === 9) return solve(r + 1, 0);

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    for (const num of nums) {
      if (isValid(board, r, c, num)) {
        board[r][c] = num;
        if (solve(r, c + 1)) return true;
        board[r][c] = 0;
      }
    }
    return false;
  };

  solve();
  return board;
}

// Remove clues based on difficulty
function createPuzzle(fullBoard: number[][], diff: Difficulty): {
  initial: number[][];
  solution: number[][];
} {
  const puzzle = fullBoard.map((row) => [...row]);
  let cluesToRemove: number;
  switch (diff) {
    case "easy":
      cluesToRemove = 30; // 51 clues left
      break;
    case "medium":
      cluesToRemove = 40; // 41 clues left
      break;
    case "hard":
      cluesToRemove = 48; // 33 clues left
      break;
    case "expert":
      cluesToRemove = 54; // 27 clues left
      break;
  }

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  positions.sort(() => Math.random() - 0.5);

  for (let i = 0; i < cluesToRemove && i < positions.length; i++) {
    const [r, c] = positions[i];
    puzzle[r][c] = 0;
  }

  return { initial: puzzle, solution: fullBoard };
}

export function Sudoku({ activitySlug = "sudoku" }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [initialGrid, setInitialGrid] = useState<number[][]>(() =>
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [currentGrid, setCurrentGrid] = useState<number[][]>(() =>
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [solutionGrid, setSolutionGrid] = useState<number[][]>(() =>
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  // Candidate pencil notes per cell
  const [notes, setNotes] = useState<number[][][]>(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
  );

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 0]);
  const [notesMode, setNotesMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);

  // History for Undo / Redo
  const [history, setHistory] = useState<
    { grid: number[][]; notes: number[][][] }[]
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Start new puzzle
  const startNewPuzzle = useCallback(
    (diff = difficulty) => {
      sound.playClick();
      const full = generateFullBoard();
      const { initial, solution } = createPuzzle(full, diff);

      setDifficulty(diff);
      setInitialGrid(initial);
      setCurrentGrid(initial.map((row) => [...row]));
      setSolutionGrid(solution);
      setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
      setSelectedCell([0, 0]);
      setMistakes(0);
      setTimerSeconds(0);
      setIsPaused(false);
      setIsCompleted(false);
      setHintsLeft(3);
      setHistory([{ grid: initial.map((row) => [...row]), notes: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])) }]);
      setHistoryIndex(0);
    },
    [difficulty]
  );

  useEffect(() => {
    startNewPuzzle();
  }, [startNewPuzzle]);

  // Timer tick
  useEffect(() => {
    if (isPaused || isCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted, isPaused]);

  // Count placed numbers and calculate remaining instances for 1-9
  const numberStats = useMemo(() => {
    const counts: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
    };
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = currentGrid[r][c];
        if (val >= 1 && val <= 9) {
          counts[val] = (counts[val] || 0) + 1;
        }
      }
    }

    const remaining: Record<number, number> = {};
    for (let n = 1; n <= 9; n++) {
      remaining[n] = Math.max(0, 9 - (counts[n] || 0));
    }

    return { counts, remaining };
  }, [currentGrid]);

  // Check conflicts (duplicates in row, col, 3x3 box)
  const conflicts = useMemo(() => {
    const conflictSet = new Set<string>();

    // Check rows
    for (let r = 0; r < 9; r++) {
      const seen = new Map<number, number>();
      for (let c = 0; c < 9; c++) {
        const val = currentGrid[r][c];
        if (val !== 0) {
          if (seen.has(val)) {
            conflictSet.add(`${r}-${c}`);
            conflictSet.add(`${r}-${seen.get(val)}`);
          } else {
            seen.set(val, c);
          }
        }
      }
    }

    // Check cols
    for (let c = 0; c < 9; c++) {
      const seen = new Map<number, number>();
      for (let r = 0; r < 9; r++) {
        const val = currentGrid[r][c];
        if (val !== 0) {
          if (seen.has(val)) {
            conflictSet.add(`${r}-${c}`);
            conflictSet.add(`${seen.get(val)}-${c}`);
          } else {
            seen.set(val, r);
          }
        }
      }
    }

    // Check 3x3 boxes
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const seen = new Map<number, [number, number]>();
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const actualR = br * 3 + r;
            const actualC = bc * 3 + c;
            const val = currentGrid[actualR][actualC];
            if (val !== 0) {
              if (seen.has(val)) {
                conflictSet.add(`${actualR}-${actualC}`);
                const [pr, pc] = seen.get(val)!;
                conflictSet.add(`${pr}-${pc}`);
              } else {
                seen.set(val, [actualR, actualC]);
              }
            }
          }
        }
      }
    }

    return conflictSet;
  }, [currentGrid]);

  // Selected number across board
  const selectedNumber = useMemo(() => {
    if (!selectedCell) return null;
    const [r, c] = selectedCell;
    const val = currentGrid[r][c];
    return val > 0 ? val : null;
  }, [currentGrid, selectedCell]);

  // Input a number into selected cell
  const handleInputNumber = useCallback(
    (num: number) => {
      if (!selectedCell || isCompleted || isPaused) return;
      const [r, c] = selectedCell;

      // Cannot modify initial puzzle clues
      if (initialGrid[r][c] !== 0) return;

      sound.playClick();

      // NOTES MODE: Toggle candidate in notes
      if (notesMode) {
        setNotes((prevNotes) => {
          const next = prevNotes.map((row) => row.map((cell) => [...cell]));
          const currentCellNotes = next[r][c];
          if (currentCellNotes.includes(num)) {
            next[r][c] = currentCellNotes.filter((n) => n !== num);
          } else {
            next[r][c] = [...currentCellNotes, num].sort();
          }
          return next;
        });
        return;
      }

      // NORMAL MODE: Set number
      const newGrid = currentGrid.map((row) => [...row]);
      newGrid[r][c] = num;
      setCurrentGrid(newGrid);

      // Auto-clear notes in same row, column, and 3x3 box
      const nextNotes = notes.map((row) => row.map((cell) => [...cell]));
      nextNotes[r][c] = []; // clear current cell notes
      for (let i = 0; i < 9; i++) {
        nextNotes[r][i] = nextNotes[r][i].filter((n) => n !== num);
        nextNotes[i][c] = nextNotes[i][c].filter((n) => n !== num);
      }
      const boxStartR = Math.floor(r / 3) * 3;
      const boxStartC = Math.floor(c / 3) * 3;
      for (let bi = 0; bi < 3; bi++) {
        for (let bj = 0; bj < 3; bj++) {
          nextNotes[boxStartR + bi][boxStartC + bj] = nextNotes[boxStartR + bi][boxStartC + bj].filter(
            (n) => n !== num
          );
        }
      }
      setNotes(nextNotes);

      // Check mistake vs true solution
      if (num !== solutionGrid[r][c]) {
        setMistakes((m) => m + 1);
      }

      // Record History for Undo
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push({
        grid: newGrid.map((row) => [...row]),
        notes: nextNotes.map((row) => row.map((cell) => [...cell])),
      });
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);

      // Check Win Condition: full board with 0 conflicts
      let isFull = true;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (newGrid[row][col] === 0 || newGrid[row][col] !== solutionGrid[row][col]) {
            isFull = false;
            break;
          }
        }
        if (!isFull) break;
      }

      if (isFull) {
        setIsCompleted(true);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    },
    [
      currentGrid,
      history,
      historyIndex,
      initialGrid,
      isCompleted,
      isPaused,
      notes,
      notesMode,
      selectedCell,
      solutionGrid,
    ]
  );

  // Erase cell
  const handleErase = useCallback(() => {
    if (!selectedCell || isCompleted || isPaused) return;
    const [r, c] = selectedCell;
    if (initialGrid[r][c] !== 0) return;

    sound.playClick();
    const newGrid = currentGrid.map((row) => [...row]);
    newGrid[r][c] = 0;
    setCurrentGrid(newGrid);

    // Also clear notes for cell
    const nextNotes = notes.map((row) => row.map((cell) => [...cell]));
    nextNotes[r][c] = [];
    setNotes(nextNotes);

    // Save history
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push({
      grid: newGrid.map((row) => [...row]),
      notes: nextNotes,
    });
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }, [currentGrid, history, historyIndex, initialGrid, isCompleted, isPaused, notes, selectedCell]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      sound.playClick();
      const prev = history[historyIndex - 1];
      setCurrentGrid(prev.grid.map((r) => [...r]));
      setNotes(prev.notes.map((r) => r.map((c) => [...c])));
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Hint: fills selected or first empty cell with solution
  const handleHint = () => {
    if (hintsLeft <= 0 || isCompleted || isPaused) return;
    sound.playClick();

    let targetR = -1;
    let targetC = -1;

    if (selectedCell && currentGrid[selectedCell[0]][selectedCell[1]] === 0) {
      targetR = selectedCell[0];
      targetC = selectedCell[1];
    } else {
      // Find first empty
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (currentGrid[r][c] === 0) {
            targetR = r;
            targetC = c;
            break;
          }
        }
        if (targetR !== -1) break;
      }
    }

    if (targetR === -1) return;

    const newGrid = currentGrid.map((row) => [...row]);
    newGrid[targetR][targetC] = solutionGrid[targetR][targetC];
    setCurrentGrid(newGrid);
    setSelectedCell([targetR, targetC]);
    setHintsLeft((h) => h - 1);

    // Auto-clear notes
    const nextNotes = notes.map((row) => row.map((cell) => [...cell]));
    nextNotes[targetR][targetC] = [];
    setNotes(nextNotes);
  };

  // Keyboard navigation & number entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || isPaused) return;

      if (e.key >= "1" && e.key <= "9") {
        handleInputNumber(parseInt(e.key, 10));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleErase();
      } else if (e.key === "n" || e.key === "N") {
        setNotesMode((prev) => !prev);
      } else if (e.key === "h" || e.key === "H") {
        handleHint();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) {
        handleUndo();
      } else if (selectedCell) {
        const [r, c] = selectedCell;
        if (e.key === "ArrowUp") setSelectedCell([Math.max(0, r - 1), c]);
        else if (e.key === "ArrowDown") setSelectedCell([Math.min(8, r + 1), c]);
        else if (e.key === "ArrowLeft") setSelectedCell([r, Math.max(0, c - 1)]);
        else if (e.key === "ArrowRight") setSelectedCell([r, Math.min(8, c + 1)]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleErase, handleHint, handleInputNumber, handleUndo, isCompleted, isPaused, selectedCell]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* Outer Card Enclosing Entire Game Interface (Matching User's Drawn Outer Container) */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col gap-4 sm:gap-5">
        
        {/* 1. TOP HEADER BAR (Matching User's Top Horizontal Outline) */}
        <div className="w-full bg-[#F7F7F5] border border-[#E8E8E5] rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-2.5 flex-wrap">
          {/* Difficulty Pill Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl text-xs font-bold border border-[#E8E8E5] shadow-2xs">
            {(["easy", "medium", "hard", "expert"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => startNewPuzzle(d)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg uppercase tracking-wider text-[10px] sm:text-[11px] transition-all cursor-pointer ${
                  difficulty === d
                    ? "bg-[#202124] text-white shadow-xs font-black"
                    : "text-[#6B7280] hover:text-[#202124]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Timer, Mistakes & Pause Button */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-white px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#E8E8E5] text-[#6B7280]">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span className="hidden sm:inline">Mistakes:</span>
              <span className={mistakes > 0 ? "text-rose-600 font-black" : "text-[#202124] font-black"}>
                {mistakes}/3
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-white px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#E8E8E5] font-mono text-[#202124]">
              <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>{formatTime(timerSeconds)}</span>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 sm:p-2 bg-white rounded-xl border border-[#E8E8E5] hover:bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] transition-colors cursor-pointer"
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 2. SPLIT LAYOUT (Matching User's Left & Right Column Outlines) */}
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-5 sm:gap-6">
          
          {/* LEFT COLUMN: 9x9 Sudoku Board (Matching User's Left Box) */}
          <div className="flex-1 w-full max-w-[430px] sm:max-w-[450px]">
            <div className="relative bg-white border-2 border-[#1E293B] rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 shadow-md aspect-square w-full">
              {/* Paused Overlay */}
              {isPaused && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-in fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Pause className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-[#202124]">Game Paused</h3>
                  <p className="text-xs text-[#6B7280]">Take a breather! Board is concealed while paused.</p>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Resume Game</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-9 grid-rows-9 w-full h-full border border-[#1E293B] rounded-xl overflow-hidden bg-slate-100">
                {currentGrid.map((row, r) =>
                  row.map((val, c) => {
                    const isInitial = initialGrid[r][c] !== 0;
                    const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                    const isSameRowOrCol =
                      selectedCell && (selectedCell[0] === r || selectedCell[1] === c);
                    const isSameBox =
                      selectedCell &&
                      getBoxIndex(r, c) === getBoxIndex(selectedCell[0], selectedCell[1]);
                    const isSameNum = selectedNumber !== null && val === selectedNumber;
                    const hasConflict = conflicts.has(`${r}-${c}`);

                    // 3x3 Block borders
                    const borderBottom =
                      (r + 1) % 3 === 0 && r !== 8
                        ? "border-b-[2.5px] border-b-[#1E293B]"
                        : "border-b border-[#E2E8F0]";
                    const borderRight =
                      (c + 1) % 3 === 0 && c !== 8
                        ? "border-r-[2.5px] border-r-[#1E293B]"
                        : "border-r border-[#E2E8F0]";

                    return (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => {
                          sound.playClick();
                          setSelectedCell([r, c]);
                        }}
                        className={`relative flex items-center justify-center font-bold text-base sm:text-lg cursor-pointer transition-all ${borderBottom} ${borderRight} ${
                          isSelected
                            ? "bg-[#4F46E5] text-white shadow-inner font-black z-10"
                            : hasConflict
                            ? "bg-rose-100 text-rose-700 font-black animate-pulse"
                            : isSameNum
                            ? "bg-indigo-100 text-[#4338CA] font-black"
                            : isSameRowOrCol || isSameBox
                            ? "bg-[#F1F5F9]"
                            : "bg-white hover:bg-slate-50"
                        } ${
                          isInitial
                            ? isSelected
                              ? "text-white"
                              : "text-[#0F172A]"
                            : isSelected
                            ? "text-white"
                            : "text-blue-600 font-extrabold"
                        }`}
                      >
                        {val > 0 ? (
                          <span>{val}</span>
                        ) : notes[r][c].length > 0 ? (
                          // 3x3 Candidate notes grid inside empty cell
                          <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 text-[8px] sm:text-[9px] leading-none text-[#64748B] font-semibold pointer-events-none select-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                              <span key={n} className="flex items-center justify-center">
                                {notes[r][c].includes(n) ? n : ""}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Completed Modal */}
              {isCompleted && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-md">
                    <Trophy className="w-9 h-9 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-[#202124]">Sudoku Solved! 🎉</h3>
                  <p className="text-xs text-[#6B7280] max-w-xs leading-relaxed">
                    Fantastic analytical deduction! Solved in{" "}
                    <strong className="text-[#202124]">{formatTime(timerSeconds)}</strong> on{" "}
                    <span className="uppercase font-bold text-indigo-600">{difficulty}</span> mode with{" "}
                    {mistakes === 0 ? "zero mistakes!" : `${mistakes} mistake(s).`}
                  </p>
                  <button
                    onClick={() => startNewPuzzle()}
                    className="mt-2 px-6 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-md active:scale-95 cursor-pointer transition-all"
                  >
                    Play Another Puzzle
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Control Tools & 3x3 Keypad (Matching User's Right Box) */}
          <div className="w-full lg:w-[310px] xl:w-[330px] flex flex-col justify-between gap-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#F7F7F5] border border-[#E8E8E5]">
            
            {/* Action Tools Bar (Undo, Erase, Notes, Hint) */}
            <div>
              <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                Actions
              </div>
              <div className="grid grid-cols-4 gap-2">
                {/* Undo */}
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-[#E8E8E5] text-xs font-bold text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Undo [Ctrl+Z]"
                >
                  <Undo2 className="w-4 h-4" />
                  <span className="text-[10px]">Undo</span>
                </button>

                {/* Erase */}
                <button
                  onClick={handleErase}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-[#E8E8E5] text-xs font-bold text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] shadow-2xs transition-all cursor-pointer"
                  title="Erase cell [Backspace]"
                >
                  <Eraser className="w-4 h-4" />
                  <span className="text-[10px]">Erase</span>
                </button>

                {/* Notes Toggle */}
                <button
                  onClick={() => setNotesMode(!notesMode)}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border text-xs font-bold shadow-2xs transition-all cursor-pointer ${
                    notesMode
                      ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs"
                      : "bg-white border-[#E8E8E5] text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED]"
                  }`}
                  title="Toggle pencil candidate notes [N]"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="text-[10px]">{notesMode ? "Notes ON" : "Notes"}</span>
                </button>

                {/* Hint */}
                <button
                  onClick={handleHint}
                  disabled={hintsLeft <= 0}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-[#E8E8E5] text-xs font-bold text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Reveal Hint [H]"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px]">Hint ({hintsLeft})</span>
                </button>
              </div>
            </div>

            {/* 3x3 Keypad with Remaining Numbers Display */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                <span>Number Pad</span>
                <span className="text-[10px] font-normal lowercase text-[#9CA3AF]">
                  remaining count shown
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  const remaining = numberStats.remaining[num];
                  const isNumComplete = remaining === 0;
                  const isSelectedNum = selectedNumber === num;

                  return (
                    <button
                      key={num}
                      onClick={() => handleInputNumber(num)}
                      disabled={isNumComplete}
                      className={`group relative flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-2xl border transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                        isNumComplete
                          ? "bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] opacity-50 cursor-default"
                          : isSelectedNum
                          ? "bg-[#4F46E5] text-white border-[#4338CA] shadow-sm ring-2 ring-indigo-400"
                          : "bg-white border-[#E8E8E5] hover:border-[#4F46E5]/50 hover:bg-[#EEF2FF]/50 text-[#1E293B] shadow-2xs"
                      }`}
                    >
                      {/* Large Number Digit */}
                      <span className="text-xl sm:text-2xl font-black leading-none">
                        {num}
                      </span>

                      {/* Remaining Count Label or Checkmark */}
                      <span
                        className={`text-[10px] font-bold mt-1 leading-none ${
                          isNumComplete
                            ? "text-emerald-500 font-extrabold"
                            : isSelectedNum
                            ? "text-indigo-200"
                            : "text-[#64748B]"
                        }`}
                      >
                        {isNumComplete ? "✓" : `${remaining} left`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls / Pro Tips */}
            <div className="pt-2 border-t border-[#E8E8E5] flex items-center justify-between gap-2">
              <button
                onClick={() => startNewPuzzle()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#E8E8E5] hover:bg-[#F0F0ED] text-[#202124] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>New Puzzle</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white border border-[#E8E8E5] text-[10px] text-[#6B7280] font-mono shadow-2xs">
                <Keyboard className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <span>1-9 keys</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
