"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
import { Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Gift, HelpCircle, Sparkles, Shuffle } from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { getQuizIcon } from "@/lib/icons";
import { sound } from "@/lib/audio";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  optionsJson: string;
  points: number;
}

interface PreparedQuestion {
  id: string;
  question: string;
  points: number;
  options: { text: string; originalIndex: number }[];
}

interface QuizPlayerProps {
  quiz: {
    id: string;
    title: string;
    slug: string;
    description: string;
    timeLimit: number;
    thumbnail: string;
    questions: Question[];
  };
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const QUESTIONS_PER_GAME = 6;

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  // Prepare questions with random sample, shuffled order and shuffled options
  const prepareQuestions = useCallback((): PreparedQuestion[] => {
    const shuffledPool = shuffleArray(quiz.questions);
    const selectedQuestions = shuffledPool.slice(0, Math.min(shuffledPool.length, QUESTIONS_PER_GAME));
    
    return selectedQuestions.map((q) => {
      let rawOptions: string[] = [];
      try {
        rawOptions = JSON.parse(q.optionsJson);
      } catch {
        rawOptions = [];
      }
      const indexedOptions = rawOptions.map((text, idx) => ({
        text,
        originalIndex: idx,
      }));
      return {
        id: q.id,
        question: q.question,
        points: q.points,
        options: shuffleArray(indexedOptions),
      };
    });
  }, [quiz.questions]);

  const [preparedQuestions, setPreparedQuestions] = useState<PreparedQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit || 15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  // Initialize questions on mount
  useEffect(() => {
    setPreparedQuestions(prepareQuestions());
  }, [prepareQuestions]);

  const currentQ = preparedQuestions[currentIdx];

  // Question Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!result && timeLeft > 0 && preparedQuestions.length > 0) {
      timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (!result && timeLeft === 0 && preparedQuestions.length > 0) {
      handleTimeExpire();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, result, currentIdx, preparedQuestions.length]);

  const handleTimeExpire = () => {
    if (currentIdx + 1 < preparedQuestions.length) {
      sound.playIncorrect();
      setCurrentIdx((i) => i + 1);
      setTimeLeft(quiz.timeLimit || 15);
    } else {
      submitQuiz(selectedAnswers);
    }
  };

  const handleSelectOption = (originalIndex: number) => {
    if (!currentQ || selectedAnswers[currentQ.id] !== undefined) return;

    sound.playClick();
    const nextAnswers = { ...selectedAnswers, [currentQ.id]: originalIndex };
    setSelectedAnswers(nextAnswers);

    setTimeout(() => {
      if (currentIdx + 1 < preparedQuestions.length) {
        setCurrentIdx((i) => i + 1);
        setTimeLeft(quiz.timeLimit || 15);
      } else {
        submitQuiz(nextAnswers);
      }
    }, 380);
  };

  const submitQuiz = async (answers: Record<string, number>) => {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/quizzes/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizSlug: quiz.slug,
          answers,
        }),
      });

      const data = await res.json();
      setResult(data);

      if (data.accuracy >= 70) {
        sound.playWin();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } else {
        sound.playIncorrect();
      }
    } catch (err) {
      console.error("Quiz evaluation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const restartQuiz = () => {
    sound.playClick();
    setPreparedQuestions(prepareQuestions());
    setCurrentIdx(0);
    setSelectedAnswers({});
    setTimeLeft(quiz.timeLimit || 15);
    setResult(null);
  };

  // Loading state
  if (isSubmitting) {
    return (
      <div className="w-full max-w-xl mx-auto p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4">
        <div className="w-12 h-12 mx-auto border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        <h3 className="text-xl font-bold text-slate-900">Grading your answers...</h3>
        <p className="text-sm text-slate-500">Checking results against the leaderboard</p>
      </div>
    );
  }

  // Result View
  if (result) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200">
            <Trophy className="w-3.5 h-3.5 text-violet-600" />
            <span>Quiz Complete</span>
          </div>

          <div className="space-y-1">
            <div className="text-6xl font-black text-slate-900 font-mono tracking-tight">
              {result.score} <span className="text-2xl text-slate-400 font-medium">/ {result.totalQuestions}</span>
            </div>
            <h3 className="text-2xl font-black text-emerald-600">
              {result.accuracy}% Accuracy
            </h3>
            <p className="text-sm text-slate-600 pt-1">
              You scored higher than <span className="text-violet-600 font-bold">{result.percentile}%</span> of all challengers!
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>+{result.pointsEarned} XP Earned</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                sound.playClick();
                setShowRewardedAd(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer shadow-sm"
            >
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Watch Ad for +50 Bonus XP</span>
            </button>

            <button
              onClick={restartQuiz}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>Play Again (New Questions)</span>
            </button>

            <Link
              href="/explore"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-md shadow-violet-500/20"
            >
              <span>Explore More</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Answer Breakdown */}
        {result.reviewDetails && result.reviewDetails.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Question Breakdown
              </h4>
              <span className="text-xs text-slate-500">
                {result.score} of {result.totalQuestions} correct
              </span>
            </div>

            <div className="space-y-3">
              {result.reviewDetails.map((rev: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-sm space-y-2 ${
                    rev.isCorrect
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : "bg-rose-50/70 border-rose-200 text-rose-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 font-semibold">
                    <span>
                      {idx + 1}. {rev.question}
                    </span>
                    {rev.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                  {rev.explanation && (
                    <div className="flex items-start gap-2 text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                      <HelpCircle className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                      <span>{rev.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <RewardedAdModal
          isOpen={showRewardedAd}
          onClose={() => setShowRewardedAd(false)}
          onRewardClaimed={(bonus) =>
            setResult((prev: any) => ({
              ...prev,
              pointsEarned: (prev?.pointsEarned || 0) + bonus,
            }))
          }
        />
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-600">Loading quiz questions...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      {/* Top Question Progress & Timer */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
            {getQuizIcon(quiz.slug, "w-5 h-5")}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Question {currentIdx + 1} of {preparedQuestions.length}
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Shuffle className="w-3 h-3 text-violet-500" /> Random {preparedQuestions.length} from pool of {quiz.questions.length}
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold ${
          timeLeft <= 5 
            ? "bg-rose-50 border-rose-200 text-rose-700 animate-pulse" 
            : "bg-violet-50 border-violet-200 text-violet-700"
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-violet-600 h-full transition-all duration-300"
          style={{
            width: `${((currentIdx + 1) / preparedQuestions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
          {currentQ.question}
        </h3>

        {/* Shuffled Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.originalIndex;
            return (
              <button
                key={i}
                onClick={() => handleSelectOption(opt.originalIndex)}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20 scale-[1.01]"
                    : "bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-violet-50/50 hover:border-violet-300 hover:text-violet-900"
                }`}
              >
                <span>{opt.text}</span>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-white border border-slate-200 text-slate-600"
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={restartQuiz}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart Quiz</span>
        </button>
      </div>
    </div>
  );
}
