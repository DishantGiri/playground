"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Brain,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import { sound } from "@/lib/audio";

interface Props {
  activitySlug?: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: "Science" | "History" | "Geography" | "Technology" | "General";
  difficulty: "easy" | "medium" | "hard";
}

const QUESTION_BANK: Question[] = [
  {
    id: 1,
    question: "Which planet in our solar system has the most confirmed moons?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctAnswer: 1,
    explanation: "Saturn leads with 146 confirmed moons, surpassing Jupiter's 95.",
    category: "Science",
    difficulty: "medium",
  },
  {
    id: 2,
    question: "What is the only mammal capable of true sustained flight?",
    options: ["Flying Squirrel", "Bat", "Sugar Glider", "Colugo"],
    correctAnswer: 1,
    explanation: "Bats have membranous wings allowing true sustained aerodynamic flight.",
    category: "Science",
    difficulty: "easy",
  },
  {
    id: 3,
    question: "In what year did the Apollo 11 mission land humans on the Moon?",
    options: ["1965", "1969", "1972", "1975"],
    correctAnswer: 1,
    explanation: "Neil Armstrong and Buzz Aldrin landed on the Moon on July 20, 1969.",
    category: "History",
    difficulty: "medium",
  },
  {
    id: 4,
    question: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correctAnswer: 2,
    explanation: "Canberra was chosen as a compromise between rivals Sydney and Melbourne in 1908.",
    category: "Geography",
    difficulty: "easy",
  },
  {
    id: 5,
    question: "Who is widely considered the inventor of the World Wide Web in 1989?",
    options: ["Tim Berners-Lee", "Bill Gates", "Steve Jobs", "Alan Turing"],
    correctAnswer: 0,
    explanation: "Sir Tim Berners-Lee invented the World Wide Web while working at CERN in 1989.",
    category: "Technology",
    difficulty: "easy",
  },
  {
    id: 6,
    question: "What is the hardest naturally occurring substance on Earth?",
    options: ["Titanium", "Diamond", "Graphene", "Tungsten"],
    correctAnswer: 1,
    explanation: "Diamond has a hardness of 10 on the Mohs scale, the highest of any natural mineral.",
    category: "Science",
    difficulty: "easy",
  },
  {
    id: 7,
    question: "Which country has the longest total coastline in the world?",
    options: ["Russia", "Australia", "Canada", "Chile"],
    correctAnswer: 2,
    explanation: "Canada's coastline measures over 202,080 km, by far the longest in the world.",
    category: "Geography",
    difficulty: "medium",
  },
  {
    id: 8,
    question: "What programming language was created by Brendan Eich in just 10 days in 1995?",
    options: ["Python", "Java", "JavaScript", "C++"],
    correctAnswer: 2,
    explanation: "Brendan Eich created JavaScript in May 1995 while at Netscape Communications.",
    category: "Technology",
    difficulty: "medium",
  },
  {
    id: 9,
    question: "In which year did the Titanic sink in the North Atlantic Ocean?",
    options: ["1905", "1912", "1918", "1923"],
    correctAnswer: 1,
    explanation: "The RMS Titanic sank on the night of April 14–15, 1912 during her maiden voyage.",
    category: "History",
    difficulty: "easy",
  },
  {
    id: 10,
    question: "How many bones are in the adult human body?",
    options: ["186", "206", "216", "230"],
    correctAnswer: 1,
    explanation: "An adult human has 206 bones after several infant bones fuse during growth.",
    category: "Science",
    difficulty: "medium",
  },
  {
    id: 11,
    question: "Which sea is considered the saltiest natural body of water in the world?",
    options: ["Dead Sea", "Red Sea", "Baltic Sea", "Mediterranean Sea"],
    correctAnswer: 0,
    explanation: "The Dead Sea is nearly 10 times saltier than typical ocean seawater.",
    category: "Geography",
    difficulty: "easy",
  },
  {
    id: 12,
    question: "Who painted the masterpiece 'The Starry Night'?",
    options: ["Pablo Picasso", "Vincent van Gogh", "Claude Monet", "Salvador Dalí"],
    correctAnswer: 1,
    explanation: "Vincent van Gogh painted The Starry Night in June 1889 in Saint-Rémy-de-Provence.",
    category: "General",
    difficulty: "easy",
  },
  {
    id: 13,
    question: "What is the primary gas found in Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    correctAnswer: 2,
    explanation: "Nitrogen makes up approximately 78% of Earth's atmosphere.",
    category: "Science",
    difficulty: "easy",
  },
  {
    id: 14,
    question: "Which ancient civilization built the legendary Machu Picchu in Peru?",
    options: ["Aztec", "Maya", "Inca", "Olmec"],
    correctAnswer: 2,
    explanation: "Machu Picchu was constructed by the Inca Empire around 1450 AD.",
    category: "History",
    difficulty: "easy",
  },
  {
    id: 15,
    question: "What does the 'HTTP' acronym stand for in web browsing?",
    options: [
      "Hypertext Transfer Protocol",
      "High Transmission Transit Protocol",
      "Hyper Transfer Text Path",
      "Hybrid Text Transmission Portal",
    ],
    correctAnswer: 0,
    explanation: "HTTP stands for Hypertext Transfer Protocol, the foundation of data communication on the Web.",
    category: "Technology",
    difficulty: "medium",
  },
];

type QuestionCount = 10 | 15;

export function GeneralKnowledgeQuiz({ activitySlug = "general-knowledge-quiz" }: Props) {
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [timeLimit, setTimeLimit] = useState<number>(20); // seconds per question

  // Active Quiz State
  const [activeSession, setActiveSession] = useState<
    { question: Question; shuffledOptions: string[]; correctIdx: number }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(20);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [answersHistory, setAnswersHistory] = useState<
    { question: string; chosen: string; correct: string; isCorrect: boolean }[]
  >([]);

  // Start / Restart Quiz
  const startQuiz = useCallback(
    (count = questionCount, cat = selectedCategory) => {
      sound.playClick();
      setQuestionCount(count);
      setSelectedCategory(cat);

      // Filter by category
      let pool = [...QUESTION_BANK];
      if (cat !== "All") {
        pool = pool.filter((q) => q.category === cat);
      }

      // Shuffle questions
      pool.sort(() => Math.random() - 0.5);
      const chosenPool = pool.slice(0, Math.min(count, pool.length));

      // Shuffle options for each question without corrupting answer key
      const session = chosenPool.map((q) => {
        const correctText = q.options[q.correctAnswer];
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        const newCorrectIdx = shuffled.indexOf(correctText);
        return {
          question: q,
          shuffledOptions: shuffled,
          correctIdx: newCorrectIdx,
        };
      });

      setActiveSession(session);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setScore(0);
      setTimer(timeLimit);
      setIsQuizCompleted(false);
      setAnswersHistory([]);
    },
    [questionCount, selectedCategory, timeLimit]
  );

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const currentItem = activeSession[currentIndex];

  // Countdown timer per question
  useEffect(() => {
    if (isQuizCompleted || isAnswerSubmitted || !currentItem) return;

    if (timer <= 0) {
      // Time expired: auto-submit as incorrect
      handleSubmitAnswer(-1);
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, isAnswerSubmitted, isQuizCompleted, timer, currentItem]);

  // Handle answer click & submission
  const handleSubmitAnswer = (chosenIdx: number) => {
    if (isAnswerSubmitted || !currentItem) return;

    sound.playClick();
    setSelectedAnswer(chosenIdx);
    setIsAnswerSubmitted(true);

    const isCorrect = chosenIdx === currentItem.correctIdx;
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setAnswersHistory((prev) => [
      ...prev,
      {
        question: currentItem.question.question,
        chosen: chosenIdx >= 0 ? currentItem.shuffledOptions[chosenIdx] : "Time Expired",
        correct: currentItem.shuffledOptions[currentItem.correctIdx],
        isCorrect,
      },
    ]);
  };

  // Next question
  const handleNextQuestion = () => {
    sound.playClick();
    if (currentIndex + 1 >= activeSession.length) {
      setIsQuizCompleted(true);
      confetti({ particleCount: 75, spread: 60 });
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setTimer(timeLimit);
  };

  const accuracy =
    activeSession.length > 0 ? Math.round((score / activeSession.length) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 select-none">
      {/* Top Controls & Category Filters */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", "Science", "History", "Geography", "Technology"].map((cat) => (
            <button
              key={cat}
              onClick={() => startQuiz(questionCount, cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#6366F1] text-white shadow-xs"
                  : "bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {([10, 15] as QuestionCount[]).map((count) => (
            <button
              key={count}
              onClick={() => startQuiz(count, selectedCategory)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                questionCount === count
                  ? "bg-[#202124] text-white"
                  : "bg-[#F0F0ED] text-[#6B7280]"
              }`}
            >
              {count} Qs
            </button>
          ))}
          <button
            onClick={() => startQuiz()}
            className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] transition-colors cursor-pointer"
            title="Restart Quiz"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      {!isQuizCompleted && currentItem && (
        <div className="w-full bg-white border border-[#E8E8E5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          {/* Question Progress & Timer */}
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-[#6B7280]">
            <div className="flex items-center gap-2">
              <span className="text-[#6366F1] font-black text-sm">
                Question {currentIndex + 1}
              </span>
              <span>of {activeSession.length}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs border ${
                timer <= 5
                  ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse"
                  : "bg-[#F7F7F5] text-[#202124] border-[#E8E8E5]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timer}s</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#F0F0ED] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6366F1] transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / activeSession.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Title */}
          <h2 className="text-lg sm:text-xl font-black text-[#202124] tracking-tight leading-snug">
            {currentItem.question.question}
          </h2>

          {/* 4 Answer Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {currentItem.shuffledOptions.map((opt, optIdx) => {
              const isSelected = selectedAnswer === optIdx;
              const isCorrect = optIdx === currentItem.correctIdx;

              let btnStyle = "bg-[#F7F7F5] border-[#E8E8E5] text-[#202124] hover:bg-[#EEF2FF] hover:border-[#C7D2FE]";

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
                } else if (isSelected) {
                  btnStyle = "bg-rose-500 text-white border-rose-600 shadow-sm";
                } else {
                  btnStyle = "bg-[#F7F7F5] text-[#9CA3AF] border-[#E8E8E5] opacity-50";
                }
              }

              return (
                <button
                  key={optIdx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSubmitAnswer(optIdx)}
                  className={`p-4 rounded-2xl border-2 text-sm font-bold text-left transition-all flex items-center justify-between cursor-pointer active:scale-98 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-2" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box (Reveals after answer submission) */}
          {isAnswerSubmitted && (
            <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="text-xs text-[#202124]">
                <strong className="block text-sm font-bold text-[#6366F1] mb-1">
                  {selectedAnswer === currentItem.correctIdx ? "Correct! 🎉" : "Incorrect! 💡"}
                </strong>
                <p>{currentItem.question.explanation}</p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer self-end sm:self-auto"
              >
                <span>{currentIndex + 1 === activeSession.length ? "Finish Quiz" : "Next"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Final Results Modal */}
      {isQuizCompleted && (
        <div className="w-full bg-white border border-[#E8E8E5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316] text-3xl">
            <Trophy className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-black text-[#202124]">Quiz Completed!</h3>
          <p className="text-xs text-[#6B7280]">
            You scored {score} out of {activeSession.length} questions correctly.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs pt-2">
            <div className="p-3 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E5]">
              <span className="text-[10px] font-bold uppercase text-[#6B7280]">Accuracy</span>
              <div className="text-xl font-black text-[#202124]">{accuracy}%</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F7F7F5] border border-[#E8E8E5]">
              <span className="text-[10px] font-bold uppercase text-[#F97316]">XP Earned</span>
              <div className="text-xl font-black text-[#F97316]">+{score * 10} XP</div>
            </div>
          </div>

          <button
            onClick={() => startQuiz()}
            className="px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
        </div>
      )}
    </div>
  );
}
