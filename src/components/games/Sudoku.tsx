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
  Redo2,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
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
  // Notes: each cell can have a set of candidates
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
      setHistory([{ grid: initial.map((row) => [...row]), notes: [] }]);
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

      // Check mistake vs true solution
      if (num !== solutionGrid[r][c]) {
        setMistakes((m) => m + 1);
      }

      // Record History
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push({
        grid: newGrid.map((row) => [...row]),
        notes: notes.map((row) => row.map((cell) => [...cell])),
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
        confetti({ particleCount: 80, spread: 70 });
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
    setNotes((prev) => {
      const next = prev.map((row) => row.map((cell) => [...cell]));
      next[r][c] = [];
      return next;
    });
  }, [currentGrid, initialGrid, isCompleted, isPaused, selectedCell]);

  // Hint: fills the selected or first empty cell with solution
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
  };

  // Keyboard navigation & number entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || isPaused) return;

      if (e.key >= "1" && e.key <= "9") {
        handleInputNumber(parseInt(e.key, 10));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleErase();
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
  }, [handleErase, handleInputNumber, isCompleted, isPaused, selectedCell]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 select-none">
      {/* Top Header / Difficulty Selector */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-[#F0F0ED] p-1 rounded-xl text-xs font-bold">
          {(["easy", "medium", "hard", "expert"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => startNewPuzzle(d)}
              className={`px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] transition-all cursor-pointer ${
                difficulty === d ? "bg-white text-[#202124] shadow-xs" : "text-[#6B7280]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Timer & Mistakes */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="text-[#6B7280]">
            Mistakes: <span className="text-rose-600 font-black">{mistakes}/3</span>
          </div>
          <div className="bg-[#F0F0ED] px-3 py-1 rounded-lg font-mono text-[#202124]">
            {formatTime(timerSeconds)}
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-lg hover:bg-[#F0F0ED] text-[#6B7280] cursor-pointer"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main 9x9 Sudoku Grid */}
      <div className="relative bg-white border-2 border-[#202124] rounded-2xl p-2 sm:p-3 shadow-sm aspect-square w-full max-w-[420px]">
        <div className="grid grid-cols-9 grid-rows-9 w-full h-full border border-[#202124]">
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
              const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? "border-b-2 border-b-[#202124]" : "border-b border-[#E8E8E5]";
              const borderRight = (c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-r-[#202124]" : "border-r border-[#E8E8E5]";

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => setSelectedCell([r, c])}
                  className={`relative flex items-center justify-center font-bold text-base sm:text-lg cursor-pointer transition-colors ${borderBottom} ${borderRight} ${
                    isSelected
                      ? "bg-[#6366F1] text-white shadow-xs"
                      : hasConflict
                      ? "bg-rose-100 text-rose-700 font-black"
                      : isSameNum
                      ? "bg-[#EEF2FF] text-[#6366F1]"
                      : isSameRowOrCol || isSameBox
                      ? "bg-[#F7F7F5]"
                      : "bg-white"
                  } ${
                    isInitial
                      ? isSelected
                        ? "text-white"
                        : "text-[#202124]"
                      : isSelected
                      ? "text-white"
                      : "text-[#4F46E5]"
                  }`}
                >
                  {val > 0 ? (
                    val
                  ) : notes[r][c].length > 0 ? (
                    // Display mini notes candidates
                    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 text-[8px] leading-none text-[#6B7280] font-normal pointer-events-none">
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
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-30 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316]">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-[#202124]">Sudoku Solved! 🎉</h3>
            <p className="text-xs text-[#6B7280]">
              Completed in {formatTime(timerSeconds)} on {difficulty.toUpperCase()} difficulty.
            </p>
            <button
              onClick={() => startNewPuzzle()}
              className="mt-2 px-6 py-2.5 rounded-xl bg-[#F97316] text-white font-bold text-xs shadow-md"
            >
              Play Another Puzzle
            </button>
          </div>
        )}
      </div>

      {/* Control Action Tools */}
      <div className="w-full max-w-[420px] flex items-center justify-between gap-2">
        <button
          onClick={handleErase}
          className="flex-1 py-2.5 rounded-xl bg-white border border-[#E8E8E5] text-xs font-bold text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <Eraser className="w-4 h-4" />
          <span>Erase</span>
        </button>

        <button
          onClick={() => setNotesMode(!notesMode)}
          className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
            notesMode
              ? "bg-[#6366F1] text-white border-[#6366F1]"
              : "bg-white border-[#E8E8E5] text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED]"
          }`}
        >
          <Pencil className="w-4 h-4" />
          <span>Notes {notesMode ? "ON" : "OFF"}</span>
        </button>

        <button
          onClick={handleHint}
          disabled={hintsLeft <= 0}
          className="flex-1 py-2.5 rounded-xl bg-white border border-[#E8E8E5] text-xs font-bold text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Hint ({hintsLeft})</span>
        </button>

        <button
          onClick={() => startNewPuzzle()}
          className="p-2.5 rounded-xl bg-white border border-[#E8E8E5] text-[#6B7280] hover:text-[#202124] hover:bg-[#F0F0ED] shadow-2xs transition-colors cursor-pointer"
          title="New Puzzle"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 1-9 Number Keypad */}
      <div className="w-full max-w-[420px] grid grid-cols-9 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleInputNumber(num)}
            className="py-3 rounded-xl bg-white border border-[#E8E8E5] text-base font-black text-[#202124] hover:bg-[#6366F1] hover:text-white hover:border-[#6366F1] shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
