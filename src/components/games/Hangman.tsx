"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Heart,
  HelpCircle,
  Play,
} from "lucide-react";
import { sound } from "@/lib/audio";

interface Props {
  activitySlug?: string;
}

interface WordEntry {
  word: string;
  category: string;
  hint: string;
}

const WORD_BANK: WordEntry[] = [
  // Tech & Gaming
  { word: "TYPESCRIPT", category: "Tech", hint: "Superset of JavaScript with strict typing" },
  { word: "NEXTJS", category: "Tech", hint: "Popular React framework for the web" },
  { word: "ALGORITHM", category: "Tech", hint: "Step-by-step procedure for calculations" },
  { word: "DATABASE", category: "Tech", hint: "Organized collection of structured information" },
  { word: "FIREWALL", category: "Tech", hint: "Network security device that monitors traffic" },
  { word: "NINTENDO", category: "Gaming", hint: "Iconic Japanese video game company behind Mario" },
  { word: "PLAYSTATION", category: "Gaming", hint: "Sony's flagship home video game console" },
  // Animals
  { word: "CHAMELEON", category: "Animals", hint: "Lizard famous for changing skin colors" },
  { word: "PLATYPUS", category: "Animals", hint: "Egg-laying semi-aquatic mammal from Australia" },
  { word: "KANGAROO", category: "Animals", hint: "Marsupial native to Australia that hops on legs" },
  { word: "OCTOPUS", category: "Animals", hint: "Eight-limbed sea mollusk with three hearts" },
  // Science & Geography
  { word: "PHOTOSYNTHESIS", category: "Science", hint: "Process plants use to synthesize sunlight" },
  { word: "SUPERNOVA", category: "Science", hint: "Colossal explosion of a dying massive star" },
  { word: "GRAVITATION", category: "Science", hint: "Universal force pulling masses together" },
  { word: "MADAGASCAR", category: "Geography", hint: "Island nation off the coast of East Africa" },
  { word: "SWITZERLAND", category: "Geography", hint: "Alpine country famous for watches and neutrality" },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_MISTAKES = 6;

export function Hangman({ activitySlug = "hangman" }: Props) {
  const [currentEntry, setCurrentEntry] = useState<WordEntry>(WORD_BANK[0]);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Pick new word
  const startNewRound = useCallback(() => {
    sound.playClick();
    const next = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    setCurrentEntry(next);
    setGuessedLetters(new Set());
    setMistakes(0);
    setGameOver(false);
    setIsWin(false);
    setShowHint(false);
  }, []);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  // Guess a letter
  const guessLetter = useCallback(
    (letter: string) => {
      if (gameOver || guessedLetters.has(letter)) return;

      sound.playClick();
      const updated = new Set(guessedLetters);
      updated.add(letter);
      setGuessedLetters(updated);

      const isCorrect = currentEntry.word.includes(letter);

      if (!isCorrect) {
        const nextMistakes = mistakes + 1;
        setMistakes(nextMistakes);

        if (nextMistakes >= MAX_MISTAKES) {
          setGameOver(true);
          setIsWin(false);
          setStreak(0);
        }
      } else {
        // Check if all letters of word are now guessed
        const allGuessed = currentEntry.word
          .split("")
          .every((char) => updated.has(char));

        if (allGuessed) {
          setIsWin(true);
          setGameOver(true);
          setScore((s) => s + 50);
          setStreak((st) => st + 1);
          confetti({ particleCount: 70, spread: 60 });
        }
      }
    },
    [currentEntry.word, gameOver, guessedLetters, mistakes]
  );

  // Physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const char = e.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        guessLetter(char);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guessLetter]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 select-none">
      {/* Top Status Bar */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#FFF7ED] text-[#F97316] font-bold text-xs border border-[#FFEDD5]">
            {currentEntry.category}
          </span>
          <div className="text-xs font-semibold text-[#6B7280]">
            Mistakes:{" "}
            <span
              className={`font-black ${
                mistakes >= 4 ? "text-rose-600 animate-pulse" : "text-[#202124]"
              }`}
            >
              {mistakes}/{MAX_MISTAKES}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-[#6B7280]">
            Streak: <span className="text-[#F97316] font-black">{streak}🔥</span>
          </div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-amber-600 transition-colors cursor-pointer"
            title="Hint"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
          <button
            onClick={startNewRound}
            className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] transition-colors cursor-pointer"
            title="New Word"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hint Alert */}
      {showHint && (
        <div className="w-full bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-2.5 text-xs text-[#B45309] font-medium flex items-center gap-2 animate-in fade-in">
          <Lightbulb className="w-4 h-4 shrink-0" />
          <span>Hint: {currentEntry.hint}</span>
        </div>
      )}

      {/* Hangman SVG Gallows & Word Display Card */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-3xl p-6 shadow-sm flex flex-col items-center gap-6">
        {/* SVG Drawing of Gallows & Hangman */}
        <div className="w-48 h-48 relative">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Gallows Base */}
            <line x1="20" y1="180" x2="100" y2="180" stroke="#202124" strokeWidth="4" strokeLinecap="round" />
            {/* Pole */}
            <line x1="60" y1="180" x2="60" y2="20" stroke="#202124" strokeWidth="4" strokeLinecap="round" />
            {/* Top Beam */}
            <line x1="60" y1="20" x2="140" y2="20" stroke="#202124" strokeWidth="4" strokeLinecap="round" />
            {/* Angle Brace */}
            <line x1="60" y1="50" x2="90" y2="20" stroke="#202124" strokeWidth="3" strokeLinecap="round" />
            {/* Rope */}
            <line x1="140" y1="20" x2="140" y2="50" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />

            {/* 1. Head */}
            {mistakes >= 1 && (
              <circle
                cx="140"
                cy="65"
                r="15"
                fill="none"
                stroke="#DC2626"
                strokeWidth="3.5"
                className="animate-in zoom-in"
              />
            )}

            {/* 2. Torso */}
            {mistakes >= 2 && (
              <line
                x1="140"
                y1="80"
                x2="140"
                y2="125"
                stroke="#DC2626"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-in fade-in"
              />
            )}

            {/* 3. Left Arm */}
            {mistakes >= 3 && (
              <line
                x1="140"
                y1="92"
                x2="115"
                y2="110"
                stroke="#DC2626"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-in fade-in"
              />
            )}

            {/* 4. Right Arm */}
            {mistakes >= 4 && (
              <line
                x1="140"
                y1="92"
                x2="165"
                y2="110"
                stroke="#DC2626"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-in fade-in"
              />
            )}

            {/* 5. Left Leg */}
            {mistakes >= 5 && (
              <line
                x1="140"
                y1="125"
                x2="118"
                y2="160"
                stroke="#DC2626"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-in fade-in"
              />
            )}

            {/* 6. Right Leg (Game Over) */}
            {mistakes >= 6 && (
              <line
                x1="140"
                y1="125"
                x2="162"
                y2="160"
                stroke="#DC2626"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="animate-in fade-in"
              />
            )}
          </svg>
        </div>

        {/* Word Display (Blank letters) */}
        <div className="flex items-center gap-2 flex-wrap justify-center min-h-[48px]">
          {currentEntry.word.split("").map((letter, i) => {
            const isRevealed = guessedLetters.has(letter) || gameOver;
            const isMissed = gameOver && !guessedLetters.has(letter);

            return (
              <div
                key={i}
                className={`w-9 sm:w-11 h-12 rounded-xl border-b-4 flex items-center justify-center font-black text-xl sm:text-2xl transition-all ${
                  isRevealed
                    ? isMissed
                      ? "text-rose-600 border-rose-500 bg-rose-50"
                      : "text-[#202124] border-[#202124] bg-[#F7F7F5]"
                    : "border-[#D1D5DB] bg-white text-transparent"
                }`}
              >
                {isRevealed ? letter : "_"}
              </div>
            );
          })}
        </div>

        {/* Game Over Banner */}
        {gameOver && (
          <div className="flex flex-col items-center gap-2 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-[#202124]">
              {isWin ? "You Saved the Hangman! 🎉" : "Out of Attempts! 💀"}
            </h3>
            <button
              onClick={startNewRound}
              className="px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Next Word</span>
            </button>
          </div>
        )}
      </div>

      {/* On-screen A-Z Letter Keyboard */}
      <div className="w-full flex flex-wrap gap-1.5 justify-center max-w-[460px]">
        {ALPHABET.map((char) => {
          const isGuessed = guessedLetters.has(char);
          const isCorrect = isGuessed && currentEntry.word.includes(char);

          return (
            <button
              key={char}
              disabled={isGuessed || gameOver}
              onClick={() => guessLetter(char)}
              className={`w-9 sm:w-10 h-11 rounded-xl font-black text-sm transition-all shadow-2xs active:scale-90 cursor-pointer disabled:cursor-not-allowed ${
                isCorrect
                  ? "bg-emerald-500 text-white"
                  : isGuessed
                  ? "bg-zinc-300 text-zinc-500 line-through opacity-60"
                  : "bg-white border border-[#E8E8E5] text-[#202124] hover:bg-[#6366F1] hover:text-white hover:border-[#6366F1]"
              }`}
            >
              {char}
            </button>
          );
        })}
      </div>
    </div>
  );
}
