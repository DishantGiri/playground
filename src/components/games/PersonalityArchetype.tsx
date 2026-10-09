"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, ArrowRight, Gift, RotateCcw, Brain, Flame, Coffee, Palette } from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import Link from "next/link";

interface Question {
  text: string;
  options: Array<{ text: string; archetype: "CHAOS" | "BRAIN" | "SLOTH" | "CREATIVE" }>;
}

const QUESTIONS: Question[] = [
  {
    text: "You have an unexpected free Saturday afternoon with zero plans. You:",
    options: [
      { text: "Spontaneously start 5 random tasks and finish none.", archetype: "CHAOS" },
      { text: "Dive deep into a 4-hour video essay about ancient history or astrophysics.", archetype: "BRAIN" },
      { text: "Wrap into a blanket burrito and take a peaceful 3-hour power nap.", archetype: "SLOTH" },
      { text: "Open a digital canvas, notebook, or code editor to build something new.", archetype: "CREATIVE" },
    ],
  },
  {
    text: "Your phone battery drops to 5% while you're outside. Your reaction:",
    options: [
      { text: "Keep playing games until the screen literally blackens.", archetype: "CHAOS" },
      { text: "Calculate exact remaining power and minimize all background apps.", archetype: "BRAIN" },
      { text: "Pocket it peacefully; disconnection is pure bliss.", archetype: "SLOTH" },
      { text: "Take one final aesthetic sunset photo before it dies.", archetype: "CREATIVE" },
    ],
  },
  {
    text: "Choose your ideal late-night digital distraction:",
    options: [
      { text: "Sending bizarre unexpected memes to friends in group chats.", archetype: "CHAOS" },
      { text: "Wikipedia rabbit holes starting from quantum mechanics.", archetype: "BRAIN" },
      { text: "Watching satisfying soap-cutting or deep cleaning videos.", archetype: "SLOTH" },
      { text: "Synthesizing lo-fi beats or sketching doodles.", archetype: "CREATIVE" },
    ],
  },
  {
    text: "When you open Bored?, what do you immediately want?",
    options: [
      { text: "Fast reflex games to test my jitter skills.", archetype: "CHAOS" },
      { text: "Brain teasers and trivia quizzes to prove my knowledge.", archetype: "BRAIN" },
      { text: "Random shower thoughts that require zero mental stress.", archetype: "SLOTH" },
      { text: "Pixel art or music soundboards to express my vibe.", archetype: "CREATIVE" },
    ],
  },
];

const ARCHETYPES = {
  CHAOS: {
    title: "The Chaos Wildcard",
    badge: "High Energy",
    description: "You thrive on unpredictability, speed, and adrenaline. Boredom stands zero chance against your sheer spontaneous energy.",
    icon: Flame,
    color: "text-rose-600 bg-rose-50 border-rose-200",
  },
  BRAIN: {
    title: "The Brainiac Mastermind",
    badge: "Intellect",
    description: "You crave intellectual stimulation and trivia. You don't just kill boredom; you dissect it and learn its history.",
    icon: Brain,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  SLOTH: {
    title: "The Zen Chiller",
    badge: "Relaxed",
    description: "You are the master of chill vibes and calm enjoyment. You prefer relaxed shower thoughts and zero-stress fun.",
    icon: Coffee,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  CREATIVE: {
    title: "The Creative Visionary",
    badge: "Artistic",
    description: "You transform idle minutes into mini works of art. You express your soul through pixels, sound waves, and design.",
    icon: Palette,
    color: "text-violet-600 bg-violet-50 border-violet-200",
  },
};

export function PersonalityArchetype({ activitySlug = "personality-archetype" }: { activitySlug?: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState({ CHAOS: 0, BRAIN: 0, SLOTH: 0, CREATIVE: 0 });
  const [result, setResult] = useState<keyof typeof ARCHETYPES | null>(null);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  const handleSelect = (archetype: "CHAOS" | "BRAIN" | "SLOTH" | "CREATIVE") => {
    sound.playClick();
    const nextScores = { ...scores, [archetype]: scores[archetype] + 1 };
    setScores(nextScores);

    if (currentStep + 1 < QUESTIONS.length) {
      setCurrentStep((s) => s + 1);
    } else {
      let highestKey: keyof typeof ARCHETYPES = "CHAOS";
      let maxScore = -1;
      (Object.keys(nextScores) as Array<keyof typeof ARCHETYPES>).forEach((k) => {
        if (nextScores[k] > maxScore) {
          maxScore = nextScores[k];
          highestKey = k;
        }
      });

      setResult(highestKey);
      sound.playWin();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

      fetch("/api/games/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activitySlug, score: 100 }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.pointsEarned) setEarnedXp(d.pointsEarned);
        })
        .catch(console.error);
    }
  };

  const resetTest = () => {
    sound.playClick();
    setCurrentStep(0);
    setScores({ CHAOS: 0, BRAIN: 0, SLOTH: 0, CREATIVE: 0 });
    setResult(null);
  };

  const question = QUESTIONS[currentStep];

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      {!result ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
              Question {currentStep + 1} of {QUESTIONS.length}
            </span>
            <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-violet-600 h-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {question.text}
          </h3>

          <div className="space-y-3 pt-1">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt.archetype)}
                className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-violet-50/60 border border-slate-200 hover:border-violet-300 text-left text-sm font-semibold text-slate-800 hover:text-violet-900 transition-all cursor-pointer hover:translate-x-1"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border ${ARCHETYPES[result].color}`}>
            {(() => {
              const IconComp = ARCHETYPES[result].icon;
              return <IconComp className="w-8 h-8" />;
            })()}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
              {ARCHETYPES[result].badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 pt-2">
              {ARCHETYPES[result].title}
            </h2>
          </div>

          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {ARCHETYPES[result].description}
          </p>

          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>+{earnedXp || 40} XP Earned</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                sound.playClick();
                setShowRewardedAd(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              <span>Claim +50 Bonus XP</span>
            </button>

            <button
              onClick={resetTest}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Retake Test</span>
            </button>

            <Link
              href="/explore"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-md shadow-violet-500/20"
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onRewardClaimed={(bonus) => setEarnedXp((prev) => prev + bonus)}
      />
    </div>
  );
}
