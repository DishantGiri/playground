"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Check,
  X,
  Flame,
  Clock,
  Trophy,
  RotateCcw,
  Zap,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Heart,
  Timer,
  Info,
} from "lucide-react";
import { sound } from "@/lib/audio";

interface Props {
  activitySlug?: string;
}

interface FactStatement {
  id: number;
  statement: string;
  isTrue: boolean;
  category: "Science" | "History" | "Tech" | "Geography" | "Nature";
  explanation: string;
}

const STATEMENTS_DB: FactStatement[] = [
  {
    id: 1,
    statement: "Bananas are botanically classified as berries, while strawberries are not.",
    isTrue: true,
    category: "Science",
    explanation: "Botanically, a berry comes from a flower with one ovary and has seeds embedded inside the flesh. Strawberries are aggregate accessory fruits.",
  },
  {
    id: 2,
    statement: "The Great Wall of China is easily visible from low Earth orbit with the unaided human eye.",
    isTrue: false,
    category: "Science",
    explanation: "Astronauts confirm the Great Wall is virtually impossible to distinguish without high-magnification lenses because its materials match the surrounding terrain.",
  },
  {
    id: 3,
    statement: "Octopuses have three hearts and blue copper-based blood.",
    isTrue: true,
    category: "Nature",
    explanation: "Two hearts pump blood to the gills, while the third circulates it through the body. Their blood uses hemocyanin (copper), which appears blue.",
  },
  {
    id: 4,
    statement: "Cleopatra lived chronologically closer to the invention of the iPhone than to the building of the Great Pyramid of Giza.",
    isTrue: true,
    category: "History",
    explanation: "The Great Pyramid was built around 2560 BC. Cleopatra died in 30 BC (approx 2,500 years later), and the first iPhone debuted in 2007 (approx 2,037 years later).",
  },
  {
    id: 5,
    statement: "Lightning never strikes the same place twice.",
    isTrue: false,
    category: "Science",
    explanation: "Lightning frequently strikes the exact same location multiple times. The Empire State Building in New York is hit by lightning an average of 25 times per year.",
  },
  {
    id: 6,
    statement: "Water boils at a lower temperature at high elevations like Mount Everest than at sea level.",
    isTrue: true,
    category: "Science",
    explanation: "Due to lower atmospheric air pressure at high altitudes, water boils at roughly 68°C (154°F) on the summit of Mount Everest rather than 100°C (212°F).",
  },
  {
    id: 7,
    statement: "The inventor of the World Wide Web was Steve Jobs.",
    isTrue: false,
    category: "Tech",
    explanation: "British scientist Sir Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN in Switzerland.",
  },
  {
    id: 8,
    statement: "Venus is the hottest planet in the Solar System, even though Mercury is closest to the Sun.",
    isTrue: true,
    category: "Science",
    explanation: "Venus is covered by a dense atmosphere of carbon dioxide and sulfuric acid clouds that produce an intense runaway greenhouse effect, reaching 465°C.",
  },
  {
    id: 9,
    statement: "Goldfish only have a memory span of three seconds.",
    isTrue: false,
    category: "Nature",
    explanation: "Extensive scientific studies show goldfish have memory spans lasting months and can be trained to recognize cues and navigate mazes.",
  },
  {
    id: 10,
    statement: "Oxford University is older than the Aztec Empire.",
    isTrue: true,
    category: "History",
    explanation: "Teaching at Oxford began as early as 1096 AD, while the Aztec civilization and Tenochtitlan emerged around 1325 AD.",
  },
  {
    id: 11,
    statement: "Humans only use 10 percent of their brain capacity.",
    isTrue: false,
    category: "Science",
    explanation: "Modern fMRI brain imaging shows that humans actively use virtually all parts of their brain throughout the day, even during sleep.",
  },
  {
    id: 12,
    statement: "Russia has a larger surface area than the dwarf planet Pluto.",
    isTrue: true,
    category: "Geography",
    explanation: "Russia spans approximately 17.1 million square kilometers, while Pluto's entire surface area is around 16.7 million square kilometers.",
  },
  {
    id: 13,
    statement: "The QWERTY keyboard layout was originally engineered to slow down typists to prevent mechanical typewriter jams.",
    isTrue: true,
    category: "Tech",
    explanation: "Christopher Sholes separated commonly paired letters to prevent mechanical typebars from colliding and jamming when typists typed quickly.",
  },
  {
    id: 14,
    statement: "Hot water can freeze faster than cold water under certain specific thermodynamic conditions.",
    isTrue: true,
    category: "Science",
    explanation: "This is known as the Mpemba effect, observed when convection currents and rapid evaporation allow initially warmer water to freeze quicker.",
  },
  {
    id: 15,
    statement: "Wombat feces are cube-shaped.",
    isTrue: true,
    category: "Nature",
    explanation: "Due to the unique elasticity and muscular contractions of the wombat's intestinal walls, their droppings form neat cubes that prevent them from rolling off rocks.",
  },
  {
    id: 16,
    statement: "Napoleon Bonaparte was unusually short for an 18th-century Frenchman.",
    isTrue: false,
    category: "History",
    explanation: "At 5 feet 6 inches (168 cm), Napoleon was actually average or slightly above-average height for a Frenchman of his era. British propaganda labeled him 'Little Boney'.",
  },
  {
    id: 17,
    statement: "The Atlantic Ocean is larger in total area than the Pacific Ocean.",
    isTrue: false,
    category: "Geography",
    explanation: "The Pacific Ocean is by far the largest, covering more than 30% of the Earth's surface — larger than all of Earth's landmasses combined.",
  },
  {
    id: 18,
    statement: "The first computer mouse was made of wood.",
    isTrue: true,
    category: "Tech",
    explanation: "Douglas Engelbart invented the computer mouse in 1964 at Stanford Research Institute, crafting its shell out of a hollowed block of pine wood with two wheels.",
  },
  {
    id: 19,
    statement: "Sharks existed before trees appeared on Earth.",
    isTrue: true,
    category: "Nature",
    explanation: "The earliest evidence of shark scales dates back approximately 450 million years, whereas the first trees (Archaeopteris) evolved roughly 350 million years ago.",
  },
  {
    id: 20,
    statement: "Mount Everest is the closest point on Earth to space and the stars.",
    isTrue: false,
    category: "Geography",
    explanation: "Because the Earth bulges at the equator due to centrifugal rotation, Mount Chimborazo in Ecuador is the farthest point from the Earth's center.",
  },
];

type GameMode = "classic" | "blitz" | "survival";

export function TrueOrFalse({ activitySlug = "true-or-false" }: Props) {
  const [mode, setMode] = useState<GameMode>("classic");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [deck, setDeck] = useState<FactStatement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0, totalTimeMs: 0 });

  const questionStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startNewGame = useCallback((chosenMode = mode, chosenCat = selectedCategory) => {
    let pool = [...STATEMENTS_DB];
    if (chosenCat !== "All") {
      pool = pool.filter((q) => q.category === chosenCat);
    }
    const shuffled = pool.sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setUserChoice(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setLives(3);
    setTimeLeft(60);
    setIsGameOver(false);
    setStats({ total: 0, correct: 0, totalTimeMs: 0 });
    questionStartTimeRef.current = Date.now();
  }, [mode, selectedCategory]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Blitz mode countdown timer
  useEffect(() => {
    if (mode === "blitz" && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [mode, isGameOver]);

  const currentStatement = deck[currentIndex];

  const handleAnswer = (choice: boolean) => {
    if (isAnswered || isGameOver || !currentStatement) return;
    sound.playClick();

    const responseTimeMs = Date.now() - questionStartTimeRef.current;
    setUserChoice(choice);
    setIsAnswered(true);

    const isCorrect = choice === currentStatement.isTrue;

    setStats((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      totalTimeMs: prev.totalTimeMs + responseTimeMs,
    }));

    if (isCorrect) {
      // Speed bonus: max 50 bonus if answered under 3s
      const speedBonus = Math.max(0, Math.floor((4000 - Math.min(4000, responseTimeMs)) / 80));
      const streakBonus = streak * 10;
      const roundEarned = 100 + speedBonus + streakBonus;

      setScore((s) => s + roundEarned);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));

      if (newStreak % 5 === 0) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      setStreak(0);
      if (mode === "survival") {
        const nextLives = lives - 1;
        setLives(nextLives);
        if (nextLives <= 0) {
          setIsGameOver(true);
        }
      }
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (mode === "classic" && currentIndex + 1 >= Math.min(15, deck.length)) {
      setIsGameOver(true);
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
      return;
    }

    if (currentIndex + 1 >= deck.length) {
      // Loop or finish
      if (mode === "blitz") {
        const reshuffled = [...STATEMENTS_DB].sort(() => Math.random() - 0.5);
        setDeck(reshuffled);
        setCurrentIndex(0);
      } else {
        setIsGameOver(true);
        return;
      }
    } else {
      setCurrentIndex((c) => c + 1);
    }

    setUserChoice(null);
    setIsAnswered(false);
    questionStartTimeRef.current = Date.now();
  };

  // Keyboard controls: T or Left arrow for True, F or Right arrow for False, Space/Enter for Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (!isAnswered) {
        if (e.key === "t" || e.key === "T" || e.key === "ArrowLeft") {
          handleAnswer(true);
        } else if (e.key === "f" || e.key === "F" || e.key === "ArrowRight") {
          handleAnswer(false);
        }
      } else {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const avgSpeed = stats.total > 0 ? (stats.totalTimeMs / stats.total / 1000).toFixed(1) : "0.0";

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header telemetry HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              True or False
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {mode.toUpperCase()}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Validate facts across science, history & technology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mode === "blitz" && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
              <Clock className={`w-4 h-4 ${timeLeft <= 10 ? "text-rose-500 animate-spin" : "text-cyan-400"}`} />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Time</div>
                <div className={`text-sm font-black ${timeLeft <= 10 ? "text-rose-400" : "text-white"}`}>{timeLeft}s</div>
              </div>
            </div>
          )}

          {mode === "survival" && (
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 transition-all ${
                    heart <= lives ? "text-rose-500 fill-rose-500" : "text-slate-600"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
            <Flame className={`w-4 h-4 ${streak > 0 ? "text-amber-400 animate-bounce" : "text-slate-500"}`} />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Streak</div>
              <div className="text-sm font-black text-amber-400">{streak}x</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
              <div className="text-sm font-black text-white">{score}</div>
            </div>
          </div>

          <button
            onClick={() => startNewGame()}
            title="Reset"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode & Category Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex gap-1.5">
          {(["classic", "blitz", "survival"] as GameMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                startNewGame(m, selectedCategory);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                mode === m
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto py-1">
          {["All", "Science", "History", "Tech", "Geography", "Nature"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                startNewGame(mode, cat);
              }}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                selectedCategory === cat
                  ? "bg-slate-700 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isGameOver ? (
        /* Game Over / Results Screen */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center gap-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">Challenge Complete!</h3>
            <p className="text-slate-400 max-w-md text-sm">
              {mode === "survival" && lives <= 0
                ? "Out of lives! But every mistake is a verified fact learned."
                : "Exceptional cognitive reflexes and fact discrimination!"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-xl">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-xs text-slate-400 uppercase font-bold">Total Score</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">{score}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-xs text-slate-400 uppercase font-bold">Accuracy</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{accuracy}%</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-xs text-slate-400 uppercase font-bold">Best Streak</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{bestStreak}x</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-xs text-slate-400 uppercase font-bold">Avg Reaction</div>
              <div className="text-2xl font-black text-purple-400 mt-1">{avgSpeed}s</div>
            </div>
          </div>

          <button
            onClick={() => startNewGame()}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      ) : (
        /* Active Fact Statement Card */
        <div className="flex flex-col gap-6">
          <div className="relative p-8 md:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center justify-between min-h-[300px] overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-radial from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

            {/* Category tag */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-cyan-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{currentStatement?.category}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">#{currentIndex + 1}</span>
            </div>

            {/* Statement text */}
            <div className="my-6">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-relaxed tracking-tight max-w-xl">
                "{currentStatement?.statement}"
              </h3>
            </div>

            {/* Result / Explanation Reveal */}
            {isAnswered && (
              <div className="w-full mt-4 p-5 rounded-2xl border bg-slate-950/70 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`p-1.5 rounded-lg font-black text-xs uppercase flex items-center gap-1.5 ${
                      userChoice === currentStatement.isTrue
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {userChoice === currentStatement.isTrue ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" /> Correct!
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 stroke-[3]" /> Incorrect!
                      </>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-300">
                    The statement is{" "}
                    <span className={currentStatement.isTrue ? "text-emerald-400" : "text-rose-400"}>
                      {currentStatement.isTrue ? "TRUE" : "FALSE"}
                    </span>
                  </span>
                </div>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  {currentStatement.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons: True / False or Next */}
          {!isAnswered ? (
            <div className="grid grid-cols-2 gap-4">
              {/* True Button */}
              <button
                onClick={() => handleAnswer(true)}
                className="group relative flex flex-col items-center justify-center gap-2 p-6 rounded-3xl bg-gradient-to-b from-emerald-600/90 to-emerald-800/90 hover:from-emerald-500 hover:to-emerald-700 text-white font-black text-xl shadow-xl shadow-emerald-950/50 border border-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="p-3 bg-emerald-500/30 rounded-2xl border border-emerald-400/30 group-hover:scale-110 transition-transform">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span>TRUE</span>
                  <span className="text-[10px] opacity-75 font-normal px-2 py-0.5 rounded bg-black/30">
                    Press [T]
                  </span>
                </div>
              </button>

              {/* False Button */}
              <button
                onClick={() => handleAnswer(false)}
                className="group relative flex flex-col items-center justify-center gap-2 p-6 rounded-3xl bg-gradient-to-b from-rose-600/90 to-rose-800/90 hover:from-rose-500 hover:to-rose-700 text-white font-black text-xl shadow-xl shadow-rose-950/50 border border-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="p-3 bg-rose-500/30 rounded-2xl border border-rose-400/30 group-hover:scale-110 transition-transform">
                  <X className="w-8 h-8 stroke-[3]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span>FALSE</span>
                  <span className="text-[10px] opacity-75 font-normal px-2 py-0.5 rounded bg-black/30">
                    Press [F]
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-base rounded-2xl shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Continue [Space]</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
