"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Flag,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Flame,
} from "lucide-react";
import { sound } from "@/lib/audio";

interface Props {
  activitySlug?: string;
}

interface CountryData {
  name: string;
  code: string;
  capital: string;
  continent: string;
  emoji: string;
}

const COUNTRIES: CountryData[] = [
  { name: "Japan", code: "JP", capital: "Tokyo", continent: "Asia", emoji: "🇯🇵" },
  { name: "France", code: "FR", capital: "Paris", continent: "Europe", emoji: "🇫🇷" },
  { name: "Brazil", code: "BR", capital: "Brasília", continent: "South America", emoji: "🇧🇷" },
  { name: "Canada", code: "CA", capital: "Ottawa", continent: "North America", emoji: "🇨🇦" },
  { name: "Australia", code: "AU", capital: "Canberra", continent: "Oceania", emoji: "🇦🇺" },
  { name: "Germany", code: "DE", capital: "Berlin", continent: "Europe", emoji: "🇩🇪" },
  { name: "Italy", code: "IT", capital: "Rome", continent: "Europe", emoji: "🇮🇹" },
  { name: "United Kingdom", code: "GB", capital: "London", continent: "Europe", emoji: "🇬🇧" },
  { name: "United States", code: "US", capital: "Washington, D.C.", continent: "North America", emoji: "🇺🇸" },
  { name: "India", code: "IN", capital: "New Delhi", continent: "Asia", emoji: "🇮🇳" },
  { name: "South Korea", code: "KR", capital: "Seoul", continent: "Asia", emoji: "🇰🇷" },
  { name: "Spain", code: "ES", capital: "Madrid", continent: "Europe", emoji: "🇪🇸" },
  { name: "Mexico", code: "MX", capital: "Mexico City", continent: "North America", emoji: "🇲🇽" },
  { name: "Egypt", code: "EG", capital: "Cairo", continent: "Africa", emoji: "🇪🇬" },
  { name: "Argentina", code: "AR", capital: "Buenos Aires", continent: "South America", emoji: "🇦🇷" },
  { name: "Nepal", code: "NP", capital: "Kathmandu", continent: "Asia", emoji: "🇳🇵" },
];

type GameMode = "flag-to-country" | "country-to-flag";

export function FlagCountryQuiz({ activitySlug = "flag-country-quiz" }: Props) {
  const [mode, setMode] = useState<GameMode>("flag-to-country");
  const [currentCountry, setCurrentCountry] = useState<CountryData>(COUNTRIES[0]);
  const [options, setOptions] = useState<CountryData[]>([]);
  const [selectedOption, setSelectedOption] = useState<CountryData | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const TOTAL_QUESTIONS = 10;

  // Generate new question
  const nextQuestion = useCallback(
    (customMode = mode) => {
      sound.playClick();
      setSelectedOption(null);
      setIsAnswered(false);

      // Pick target country
      const target = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      setCurrentCountry(target);

      // Pick 3 distractors
      const distractors = COUNTRIES.filter((c) => c.name !== target.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const allOptions = [target, ...distractors].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
    },
    [mode]
  );

  const resetGame = useCallback(
    (customMode = mode) => {
      setMode(customMode);
      setScore(0);
      setStreak(0);
      setQuestionNumber(1);
      setGameOver(false);
      nextQuestion(customMode);
    },
    [mode, nextQuestion]
  );

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleSelectOption = (choice: CountryData) => {
    if (isAnswered || gameOver) return;

    sound.playClick();
    setSelectedOption(choice);
    setIsAnswered(true);

    const isCorrect = choice.name === currentCountry.name;
    if (isCorrect) {
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }
  };

  const handleContinue = () => {
    if (questionNumber >= TOTAL_QUESTIONS) {
      setGameOver(true);
      confetti({ particleCount: 70, spread: 60 });
    } else {
      setQuestionNumber((n) => n + 1);
      nextQuestion();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 select-none">
      {/* Top Header Mode Toggle */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => resetGame("flag-to-country")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "flag-to-country"
                ? "bg-[#6366F1] text-white shadow-xs"
                : "bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124]"
            }`}
          >
            <Flag className="w-3.5 h-3.5 inline mr-1" />
            <span>Guess Country</span>
          </button>
          <button
            onClick={() => resetGame("country-to-flag")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === "country-to-flag"
                ? "bg-[#6366F1] text-white shadow-xs"
                : "bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124]"
            }`}
          >
            <Globe className="w-3.5 h-3.5 inline mr-1" />
            <span>Guess Flag</span>
          </button>
        </div>

        {/* Streak and Score */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="text-[#F97316] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>{streak} Streak</span>
          </div>
          <div className="text-[#202124]">Score: {score}</div>
          <button
            onClick={() => resetGame()}
            className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Challenge Card */}
      {!gameOver ? (
        <div className="w-full bg-white border border-[#E8E8E5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center gap-6">
          <div className="w-full flex items-center justify-between text-xs font-bold text-[#6B7280]">
            <span>
              Question {questionNumber} of {TOTAL_QUESTIONS}
            </span>
            <span className="text-[#6366F1]">{currentCountry.continent}</span>
          </div>

          {/* Prominent Question Target */}
          {mode === "flag-to-country" ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[100px] leading-none drop-shadow-md transition-transform hover:scale-105">
                {currentCountry.emoji}
              </span>
              <p className="text-xs text-[#6B7280] font-medium">
                Which nation does this flag represent?
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-[#202124] tracking-tight">
                {currentCountry.name}
              </h2>
              <p className="text-xs text-[#6B7280] font-medium">
                Capital: <strong className="text-[#202124]">{currentCountry.capital}</strong>
              </p>
            </div>
          )}

          {/* 4 Answer Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {options.map((opt, idx) => {
              const isSelected = selectedOption?.name === opt.name;
              const isCorrect = opt.name === currentCountry.name;

              let style = "bg-[#F7F7F5] border-[#E8E8E5] text-[#202124] hover:bg-[#EEF2FF] hover:border-[#C7D2FE]";

              if (isAnswered) {
                if (isCorrect) {
                  style = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
                } else if (isSelected) {
                  style = "bg-rose-500 text-white border-rose-600 shadow-sm";
                } else {
                  style = "bg-[#F7F7F5] text-[#9CA3AF] border-[#E8E8E5] opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-2xl border-2 font-bold text-sm flex items-center justify-between transition-all cursor-pointer active:scale-98 ${style}`}
                >
                  <div className="flex items-center gap-3">
                    {mode === "country-to-flag" ? (
                      <span className="text-3xl">{opt.emoji}</span>
                    ) : null}
                    <span>{opt.name}</span>
                  </div>

                  {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-white" />}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Continue Button when Answered */}
          {isAnswered && (
            <div className="w-full flex items-center justify-between pt-2 border-t border-[#F0F0ED] animate-in fade-in">
              <span className="text-xs font-semibold text-[#6B7280]">
                Capital: <strong className="text-[#202124]">{currentCountry.capital}</strong>
              </span>

              <button
                onClick={handleContinue}
                className="px-6 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>{questionNumber >= TOTAL_QUESTIONS ? "View Results" : "Next Flag"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="w-full bg-white border border-[#E8E8E5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-3xl">
            🏆
          </div>
          <h3 className="text-2xl font-black text-[#202124]">Flag Quiz Completed!</h3>
          <p className="text-xs text-[#6B7280]">
            You scored {score} points out of {TOTAL_QUESTIONS * 10} possible!
          </p>

          <button
            onClick={() => resetGame()}
            className="px-6 py-2.5 rounded-xl bg-[#F97316] text-white font-bold text-xs shadow-md"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
