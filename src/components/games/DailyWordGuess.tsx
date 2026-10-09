"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Share2,
  Calendar,
  Zap,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { sound } from "@/lib/audio";

interface Props {
  activitySlug?: string;
}

// Curated 5-letter Target Words Pool
const WORDS = [
  "REACT", "GAMES", "PIXEL", "SWORD", "CLOUD", "BRAIN", "LOGIC", "POWER",
  "SPEED", "FLASH", "CHESS", "BLOCK", "STARS", "NIGHT", "DREAM", "FLAME",
  "WATER", "EARTH", "MAGIC", "GHOST", "TIGER", "EAGLE", "ROBOT", "SPACE",
  "SHINE", "TRACK", "POINT", "SCORE", "QUEST", "LEVEL", "CANDY", "FRUIT",
  "BEACH", "MONEY", "HOUSE", "LIGHT", "MUSIC", "SOUND", "COLOR", "RIVER",
  "OCEAN", "CLOCK", "TRAIN", "PLANE", "STORM", "HAPPY", "SMILE", "PEACE",
];

const VALID_GUESSES = new Set([
  ...WORDS,
  "ABOUT", "OTHER", "WHICH", "THEIR", "THERE", "FIRST", "WOULD", "THESE",
  "CLICK", "BRICK", "TRICK", "STACK", "SHOCK", "BLACK", "WHITE", "GREEN",
  "CLEAR", "CLEAN", "DRIVE", "FORCE", "BOARD", "CHAIR", "TABLE", "PHONE",
  "SMART", "BRAVE", "SWEET", "BREAD", "APPLE", "DRINK", "FLOOR", "PAPER",
]);

type LetterStatus = "correct" | "present" | "absent" | "empty";

export function DailyWordGuess({ activitySlug = "daily-word-guess" }: Props) {
  const [isDaily, setIsDaily] = useState(true);
  const [targetWord, setTargetWord] = useState<string>("REACT");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isWin, setIsWin] = useState<boolean>(false);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ played: 0, wins: 0, streak: 0 });

  const MAX_ATTEMPTS = 6;
  const WORD_LENGTH = 5;

  // Pick deterministic daily word based on date
  const getDailyWord = useCallback(() => {
    const today = new Date();
    const daySeed =
      today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return WORDS[daySeed % WORDS.length];
  }, []);

  // Initialize word
  const initGame = useCallback(
    (daily = isDaily) => {
      sound.playClick();
      setIsDaily(daily);
      const chosen = daily
        ? getDailyWord()
        : WORDS[Math.floor(Math.random() * WORDS.length)];
      setTargetWord(chosen);
      setGuesses([]);
      setCurrentInput("");
      setGameOver(false);
      setIsWin(false);
      setCopied(false);
    },
    [getDailyWord, isDaily]
  );

  useEffect(() => {
    initGame(true);
  }, [initGame]);

  // Load stats
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bored_wordle_stats");
        if (saved) setStats(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 1800);
  };

  // Evaluate single row guesses with correct handling of duplicate letters
  const evaluateGuess = useCallback(
    (guess: string): LetterStatus[] => {
      const result: LetterStatus[] = Array(WORD_LENGTH).fill("absent");
      const targetLetters = targetWord.split("");
      const guessLetters = guess.split("");

      // 1. First pass: exact matches (Green)
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessLetters[i] === targetLetters[i]) {
          result[i] = "correct";
          targetLetters[i] = "#"; // consumed
        }
      }

      // 2. Second pass: present letters in wrong positions (Yellow)
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (result[i] !== "correct") {
          const matchIdx = targetLetters.indexOf(guessLetters[i]);
          if (matchIdx !== -1) {
            result[i] = "present";
            targetLetters[matchIdx] = "#"; // consumed
          }
        }
      }

      return result;
    },
    [targetWord]
  );

  // Status for each letter on on-screen keyboard
  const keyboardLetterStatus = useMemo(() => {
    const map: Record<string, LetterStatus> = {};

    guesses.forEach((guess) => {
      const evaluation = evaluateGuess(guess);
      guess.split("").forEach((letter, i) => {
        const current = map[letter];
        const status = evaluation[i];
        if (status === "correct") {
          map[letter] = "correct";
        } else if (status === "present" && current !== "correct") {
          map[letter] = "present";
        } else if (!current) {
          map[letter] = "absent";
        }
      });
    });

    return map;
  }, [evaluateGuess, guesses]);

  // Submit current guess
  const submitGuess = useCallback(() => {
    if (gameOver) return;

    if (currentInput.length !== WORD_LENGTH) {
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      showToast("Word must be 5 letters");
      return;
    }

    if (!VALID_GUESSES.has(currentInput) && !WORDS.includes(currentInput)) {
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      showToast("Not in word list");
      return;
    }

    sound.playClick();
    const nextGuesses = [...guesses, currentInput];
    setGuesses(nextGuesses);
    setCurrentInput("");

    if (currentInput === targetWord) {
      setIsWin(true);
      setGameOver(true);
      confetti({ particleCount: 75, spread: 60 });

      setStats((prev) => {
        const updated = {
          played: prev.played + 1,
          wins: prev.wins + 1,
          streak: prev.streak + 1,
        };
        try {
          localStorage.setItem("bored_wordle_stats", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else if (nextGuesses.length >= MAX_ATTEMPTS) {
      setGameOver(true);
      setStats((prev) => {
        const updated = {
          played: prev.played + 1,
          wins: prev.wins,
          streak: 0,
        };
        try {
          localStorage.setItem("bored_wordle_stats", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [currentInput, gameOver, guesses, targetWord]);

  // Handle letter key press
  const handleKey = useCallback(
    (key: string) => {
      if (gameOver) return;

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE" || key === "DEL") {
        setCurrentInput((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentInput.length < WORD_LENGTH) {
        setCurrentInput((prev) => prev + key);
      }
    },
    [currentInput.length, gameOver, submitGuess]
  );

  // Physical keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleKey("ENTER");
      else if (e.key === "Backspace") handleKey("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKey]);

  // Copy share result
  const copyShareResult = () => {
    const emojiMap = {
      correct: "🟩",
      present: "🟨",
      absent: "⬛",
      empty: "⬜",
    };

    let text = `Daily Word Guess ${isWin ? guesses.length : "X"}/${MAX_ATTEMPTS}\n\n`;
    guesses.forEach((g) => {
      text += evaluateGuess(g).map((st) => emojiMap[st]).join("") + "\n";
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
  ];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 select-none">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-20 z-50 px-4 py-2 rounded-xl bg-black/90 text-white font-bold text-xs shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Mode & Streak Header */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => initGame(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isDaily
                ? "bg-[#6366F1] text-white shadow-xs"
                : "bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily</span>
          </button>
          <button
            onClick={() => initGame(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              !isDaily
                ? "bg-[#6366F1] text-white shadow-xs"
                : "bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Practice</span>
          </button>
        </div>

        {/* Streak Stats */}
        <div className="flex items-center gap-3 text-xs font-bold text-[#6B7280]">
          <div>
            Streak: <span className="text-[#F97316] font-black">{stats.streak}🔥</span>
          </div>
          <div>
            Win %:{" "}
            <span className="text-[#202124] font-black">
              {stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Main 6x5 Letter Grid */}
      <div className="grid grid-rows-6 gap-2 w-full max-w-[320px]">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
          const guess = guesses[rowIdx];
          const isCurrentRow = rowIdx === guesses.length;
          const evaluation = guess ? evaluateGuess(guess) : null;
          const isShaking = shakeRow === rowIdx;

          return (
            <div
              key={rowIdx}
              className={`grid grid-cols-5 gap-2 ${
                isShaking ? "animate-shake" : ""
              }`}
            >
              {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => {
                let letter = "";
                let status: LetterStatus = "empty";

                if (guess) {
                  letter = guess[colIdx];
                  status = evaluation ? evaluation[colIdx] : "empty";
                } else if (isCurrentRow) {
                  letter = currentInput[colIdx] || "";
                }

                const bgColors = {
                  correct: "bg-emerald-500 text-white border-emerald-600 shadow-xs",
                  present: "bg-amber-400 text-white border-amber-500 shadow-xs",
                  absent: "bg-zinc-600 text-white border-zinc-700",
                  empty: "bg-white border-[#D1D5DB] text-[#202124]",
                };

                return (
                  <div
                    key={colIdx}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-300 ${
                      bgColors[status]
                    } ${letter && status === "empty" ? "border-[#202124] scale-105" : ""}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Game Over Banner */}
      {gameOver && (
        <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center space-y-2 animate-in fade-in">
          <h3 className="text-xl font-black text-[#202124]">
            {isWin ? "Splendid! 🎉" : "Good Try! 💔"}
          </h3>
          <p className="text-xs text-[#6B7280]">
            The word was: <strong className="text-base text-[#6366F1] font-black">{targetWord}</strong>
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={copyShareResult}
              className="px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Share Result"}</span>
            </button>
            <button
              onClick={() => initGame(false)}
              className="px-4 py-2 rounded-xl bg-[#F0F0ED] hover:bg-[#E8E8E5] text-[#202124] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Next Word</span>
            </button>
          </div>
        </div>
      )}

      {/* On-screen QWERTY Keyboard */}
      <div className="w-full flex flex-col items-center gap-1.5 mt-1">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 w-full justify-center">
            {row.map((k) => {
              const status = keyboardLetterStatus[k];
              const isSpecial = k === "ENTER" || k === "DEL";

              const keyColor =
                status === "correct"
                  ? "bg-emerald-500 text-white"
                  : status === "present"
                  ? "bg-amber-400 text-white"
                  : status === "absent"
                  ? "bg-zinc-400 text-white"
                  : "bg-[#E8E8E5] text-[#202124] hover:bg-[#D1D5DB]";

              return (
                <button
                  key={k}
                  onClick={() => handleKey(k)}
                  className={`h-11 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs ${keyColor} ${
                    isSpecial ? "px-2.5 text-[11px]" : "flex-1 max-w-[36px]"
                  }`}
                >
                  {k}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
