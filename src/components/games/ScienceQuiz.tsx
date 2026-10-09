"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Atom,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
} from "lucide-react";
import { sound } from "@/lib/audio";

interface Props {
  activitySlug?: string;
}

interface ScienceQuestion {
  id: number;
  subject: "Physics" | "Chemistry" | "Biology" | "Astronomy" | "Earth Science";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const SCIENCE_QUESTIONS: ScienceQuestion[] = [
  {
    id: 1,
    subject: "Physics",
    question: "What is the approximate speed of light in a vacuum?",
    options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"],
    correctAnswer: 0,
    explanation: "Light travels at roughly 299,792 kilometers per second in a vacuum.",
  },
  {
    id: 2,
    subject: "Chemistry",
    question: "What is the atomic number of Carbon on the periodic table?",
    options: ["4", "6", "8", "12"],
    correctAnswer: 1,
    explanation: "Carbon has 6 protons, giving it the atomic number 6.",
  },
  {
    id: 3,
    subject: "Biology",
    question: "Which cellular organelle is universally known as the 'powerhouse of the cell'?",
    options: ["Ribosome", "Nucleus", "Mitochondria", "Endoplasmic Reticulum"],
    correctAnswer: 2,
    explanation: "Mitochondria generate most of the chemical energy needed by cells in the form of ATP.",
  },
  {
    id: 4,
    subject: "Astronomy",
    question: "What is the boundary around a black hole beyond which nothing can escape called?",
    options: ["Singularity", "Event Horizon", "Accretion Disk", "Photon Sphere"],
    correctAnswer: 1,
    explanation: "The event horizon marks the threshold where gravitational pull prevents even light from escaping.",
  },
  {
    id: 5,
    subject: "Earth Science",
    question: "Which layer of Earth's atmosphere contains the vital ozone layer?",
    options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
    correctAnswer: 1,
    explanation: "The stratosphere houses the ozone layer between roughly 15 to 35 kilometers altitude.",
  },
  {
    id: 6,
    subject: "Physics",
    question: "What physical quantity does the unit 'Newton' (N) measure?",
    options: ["Energy", "Force", "Pressure", "Power"],
    correctAnswer: 1,
    explanation: "Newton is the SI unit of force, equivalent to 1 kg·m/s².",
  },
  {
    id: 7,
    subject: "Chemistry",
    question: "What is the chemical symbol for the element Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    explanation: "Au comes from the Latin word 'Aurum', meaning shining dawn.",
  },
  {
    id: 8,
    subject: "Biology",
    question: "Which blood component is responsible for carrying oxygen throughout the body?",
    options: ["Hemoglobin in Red Blood Cells", "White Blood Cells", "Platelets", "Plasma"],
    correctAnswer: 0,
    explanation: "Hemoglobin is an iron-rich protein in red blood cells that binds and transports oxygen molecules.",
  },
  {
    id: 9,
    subject: "Astronomy",
    question: "How long does light emitted from the Sun take to reach Earth?",
    options: ["About 8 seconds", "About 8 minutes", "About 8 hours", "Instantaneously"],
    correctAnswer: 1,
    explanation: "Sunlight takes approximately 8 minutes and 20 seconds to travel 150 million kilometers.",
  },
  {
    id: 10,
    subject: "Earth Science",
    question: "What scale is conventionally used to quantify the magnitude of earthquakes?",
    options: ["Beaufort Scale", "Richter / Moment Magnitude Scale", "Mohs Scale", "Kelvin Scale"],
    correctAnswer: 1,
    explanation: "Earthquake magnitude is measured on the Richter scale and modern Moment Magnitude Scale.",
  },
];

export function ScienceQuiz({ activitySlug = "science-quiz" }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [session, setSession] = useState<
    { q: ScienceQuestion; options: string[]; correctIdx: number }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(20);
  const [isCompleted, setIsCompleted] = useState(false);
  const [subjectBreakdown, setSubjectBreakdown] = useState<Record<string, { total: number; correct: number }>>({});

  const startQuiz = useCallback((subject = selectedSubject) => {
    sound.playClick();
    setSelectedSubject(subject);

    let pool = [...SCIENCE_QUESTIONS];
    if (subject !== "All") {
      pool = pool.filter((item) => item.subject === subject);
    }

    pool.sort(() => Math.random() - 0.5);

    const prepared = pool.map((item) => {
      const correctText = item.options[item.correctAnswer];
      const shuffled = [...item.options].sort(() => Math.random() - 0.5);
      return {
        q: item,
        options: shuffled,
        correctIdx: shuffled.indexOf(correctText),
      };
    });

    setSession(prepared);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setTimer(20);
    setIsCompleted(false);
    setSubjectBreakdown({});
  }, [selectedSubject]);

  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  const current = session[currentIndex];

  // Timer
  useEffect(() => {
    if (isCompleted || isAnswered || !current) return;
    if (timer <= 0) {
      handleAnswer(-1);
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [current, isAnswered, isCompleted, timer]);

  const handleAnswer = (idx: number) => {
    if (isAnswered || !current) return;
    sound.playClick();
    setSelectedAnswer(idx);
    setIsAnswered(true);

    const isCorrect = idx === current.correctIdx;
    if (isCorrect) setScore((s) => s + 1);

    const subj = current.q.subject;
    setSubjectBreakdown((prev) => {
      const cur = prev[subj] || { total: 0, correct: 0 };
      return {
        ...prev,
        [subj]: {
          total: cur.total + 1,
          correct: cur.correct + (isCorrect ? 1 : 0),
        },
      };
    });
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex + 1 >= session.length) {
      setIsCompleted(true);
      confetti({ particleCount: 75, spread: 60 });
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimer(20);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 select-none">
      {/* Header and Subject filter */}
      <div className="w-full bg-white border border-[#E8E8E5] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", "Physics", "Chemistry", "Biology", "Astronomy"].map((sub) => (
            <button
              key={sub}
              onClick={() => startQuiz(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === sub
                  ? "bg-[#6366F1] text-white shadow-xs"
                  : "bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124]"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <button
          onClick={() => startQuiz()}
          className="p-1.5 rounded-xl bg-[#F0F0ED] text-[#6B7280] hover:text-[#202124] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Card */}
      {!isCompleted && current ? (
        <div className="w-full bg-white border border-[#E8E8E5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between text-xs font-bold text-[#6B7280]">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              {current.q.subject}
            </span>
            <div className="flex items-center gap-1 font-mono bg-[#F7F7F5] px-2.5 py-1 rounded-full border border-[#E8E8E5]">
              <Clock className="w-3.5 h-3.5" />
              <span>{timer}s</span>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-[#202124] tracking-tight">
            {current.q.question}
          </h2>

          {/* 4 Choices */}
          <div className="grid grid-cols-1 gap-2.5 w-full">
            {current.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === current.correctIdx;

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
                  onClick={() => handleAnswer(idx)}
                  className={`p-3.5 rounded-xl border-2 font-bold text-sm text-left flex items-center justify-between transition-all cursor-pointer ${style}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-white shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="text-xs text-[#202124]">
                <strong className="block text-sm font-bold text-[#6366F1] mb-1">
                  {selectedAnswer === current.correctIdx ? "Correct! 🔬" : "Explanation 💡"}
                </strong>
                <p>{current.q.explanation}</p>
              </div>

              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer self-end sm:self-auto"
              >
                <span>{currentIndex + 1 === session.length ? "Finish Quiz" : "Next"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="w-full bg-white border border-[#E8E8E5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl">
            🔬
          </div>
          <h3 className="text-2xl font-black text-[#202124]">Science Quiz Completed!</h3>
          <p className="text-xs text-[#6B7280]">
            You scored {score} / {session.length} ({session.length > 0 ? Math.round((score / session.length) * 100) : 0}%)
          </p>

          {/* Subject Breakdown */}
          <div className="w-full max-w-sm grid grid-cols-2 gap-2 text-left pt-2">
            {Object.entries(subjectBreakdown).map(([subj, data]) => (
              <div key={subj} className="p-2.5 rounded-xl bg-[#F7F7F5] border border-[#E8E8E5] text-xs">
                <span className="font-bold text-[#202124] block">{subj}</span>
                <span className="text-[#6B7280]">
                  {data.correct}/{data.total} ({Math.round((data.correct / data.total) * 100)}%)
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => startQuiz()}
            className="px-6 py-2.5 rounded-xl bg-[#F97316] text-white font-bold text-xs shadow-md"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
