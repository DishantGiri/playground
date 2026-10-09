"use client";

import { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  RotateCcw,
  Sparkles,
  Gift,
  Scale,
  Globe,
  Coins,
  Brain,
  Smile,
  MessageSquare,
  Dog,
  Zap,
  UtensilsCrossed,
  Rocket,
  Hourglass,
  Eye,
  ShieldAlert,
  Sun,
  Moon,
  Music,
  Compass,
  Flame,
  Award,
  Crown,
  Laptop,
  Users,
} from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import Link from "next/link";

interface DilemmaOption {
  text: string;
  iconName: string;
  percent: number;
  votes: number;
}

interface Dilemma {
  id: number;
  optionA: DilemmaOption;
  optionB: DilemmaOption;
}

const DILEMMAS_POOL: Dilemma[] = [
  {
    id: 1,
    optionA: { text: "Travel anywhere in the world for free forever", iconName: "globe", percent: 74, votes: 14200 },
    optionB: { text: "Receive a lump sum of $150,000 cash right now", iconName: "coins", percent: 26, votes: 4980 },
  },
  {
    id: 2,
    optionA: { text: "Always know when someone is lying to you", iconName: "brain", percent: 68, votes: 11300 },
    optionB: { text: "Get away with any lie you ever tell", iconName: "mask", percent: 32, votes: 5310 },
  },
  {
    id: 3,
    optionA: { text: "Speak and understand all human languages fluently", iconName: "message", percent: 81, votes: 16800 },
    optionB: { text: "Be able to talk to and understand all animals", iconName: "dog", percent: 19, votes: 3950 },
  },
  {
    id: 4,
    optionA: { text: "Never have to sleep and never feel tired", iconName: "zap", percent: 58, votes: 9400 },
    optionB: { text: "Eat anything you crave with zero health drawbacks", iconName: "utensils", percent: 42, votes: 6820 },
  },
  {
    id: 5,
    optionA: { text: "Travel 100 years into the future with a return ticket", iconName: "rocket", percent: 62, votes: 8900 },
    optionB: { text: "Travel 100 years into the past with a return ticket", iconName: "hourglass", percent: 38, votes: 5460 },
  },
  {
    id: 6,
    optionA: { text: "Have the superpower of teleportation anywhere on Earth", iconName: "compass", percent: 79, votes: 18200 },
    optionB: { text: "Have the superpower of invisibility at will", iconName: "eye", percent: 21, votes: 4830 },
  },
  {
    id: 7,
    optionA: { text: "Live in a peaceful cabin in the mountains with gigabit internet", iconName: "sun", percent: 65, votes: 12400 },
    optionB: { text: "Live in a penthouse in a bustling metropolis with a private chef", iconName: "crown", percent: 35, votes: 6680 },
  },
  {
    id: 8,
    optionA: { text: "Be able to master any musical instrument in 1 hour", iconName: "music", percent: 54, votes: 9810 },
    optionB: { text: "Be able to master any programming language in 1 hour", iconName: "laptop", percent: 46, votes: 8350 },
  },
  {
    id: 9,
    optionA: { text: "Never experience physical pain ever again", iconName: "shield", percent: 48, votes: 8100 },
    optionB: { text: "Never experience awkward or cringe social moments ever again", iconName: "users", percent: 52, votes: 8780 },
  },
  {
    id: 10,
    optionA: { text: "Know the exact history of every antique object you touch", iconName: "sparkles", percent: 37, votes: 6100 },
    optionB: { text: "Know the honest first impression people have when they meet you", iconName: "brain", percent: 63, votes: 10400 },
  },
  {
    id: 11,
    optionA: { text: "Always have your flight or hotel automatically upgraded to first class", iconName: "award", percent: 59, votes: 9200 },
    optionB: { text: "Never hit red traffic lights for the rest of your life", iconName: "flame", percent: 41, votes: 6390 },
  },
  {
    id: 12,
    optionA: { text: "Be 20% smarter than you are right now", iconName: "brain", percent: 71, votes: 13900 },
    optionB: { text: "Be 20% more charismatic and funny than you are right now", iconName: "sparkles", percent: 29, votes: 5680 },
  },
];

function renderDilemmaIcon(name: string, className = "w-6 h-6") {
  switch (name) {
    case "globe":
      return <Globe className={`${className} text-cyan-600`} />;
    case "coins":
      return <Coins className={`${className} text-amber-600`} />;
    case "brain":
      return <Brain className={`${className} text-violet-600`} />;
    case "mask":
      return <Smile className={`${className} text-rose-500`} />;
    case "message":
      return <MessageSquare className={`${className} text-blue-600`} />;
    case "dog":
      return <Dog className={`${className} text-emerald-600`} />;
    case "zap":
      return <Zap className={`${className} text-amber-500`} />;
    case "utensils":
      return <UtensilsCrossed className={`${className} text-rose-500`} />;
    case "rocket":
      return <Rocket className={`${className} text-indigo-600`} />;
    case "hourglass":
      return <Hourglass className={`${className} text-purple-600`} />;
    case "compass":
      return <Compass className={`${className} text-teal-600`} />;
    case "eye":
      return <Eye className={`${className} text-sky-600`} />;
    case "sun":
      return <Sun className={`${className} text-amber-500`} />;
    case "crown":
      return <Crown className={`${className} text-yellow-600`} />;
    case "music":
      return <Music className={`${className} text-pink-600`} />;
    case "laptop":
      return <Laptop className={`${className} text-indigo-600`} />;
    case "shield":
      return <ShieldAlert className={`${className} text-emerald-600`} />;
    case "users":
      return <Users className={`${className} text-blue-600`} />;
    case "sparkles":
      return <Sparkles className={`${className} text-violet-600`} />;
    case "award":
      return <Award className={`${className} text-amber-600`} />;
    case "flame":
      return <Flame className={`${className} text-rose-600`} />;
    default:
      return <Scale className={`${className} text-violet-600`} />;
  }
}

export function WouldYouRather({ activitySlug = "would-you-rather" }: { activitySlug?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  // Non-repeating order
  const [shuffledPool, setShuffledPool] = useState<Dilemma[]>(() =>
    [...DILEMMAS_POOL].sort(() => Math.random() - 0.5)
  );

  const dilemma = shuffledPool[currentIndex % shuffledPool.length];

  const handleVote = async (choice: "A" | "B") => {
    if (selectedOption) return;
    sound.playClick();
    setSelectedOption(choice);
    const newCount = answeredCount + 1;
    setAnsweredCount(newCount);

    if (newCount === 3) {
      sound.playWin();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      try {
        const res = await fetch("/api/games/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activitySlug,
            score: 100,
          }),
        });
        const data = await res.json();
        if (data.pointsEarned) {
          setEarnedXp(data.pointsEarned);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleNext = () => {
    sound.playClick();
    setSelectedOption(null);
    setCurrentIndex((prev) => (prev + 1) % shuffledPool.length);
  };

  const handleRestart = () => {
    sound.playClick();
    setShuffledPool([...DILEMMAS_POOL].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnsweredCount(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200">
          <Scale className="w-3.5 h-3.5 text-violet-600" />
          <span>Dilemma {currentIndex + 1} of {shuffledPool.length}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          Would You Rather...
        </h2>
      </div>

      {/* Two Choice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option A */}
        <button
          onClick={() => handleVote("A")}
          disabled={selectedOption !== null}
          className={`relative p-6 sm:p-7 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between select-none ${
            selectedOption === "A"
              ? "bg-violet-50 border-violet-500 ring-2 ring-violet-500 shadow-md scale-[1.01]"
              : selectedOption !== null
              ? "bg-slate-50/70 border-slate-200 opacity-70"
              : "bg-white hover:bg-violet-50/30 border-slate-200 hover:border-violet-300 shadow-sm hover:shadow-md cursor-pointer"
          }`}
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              {renderDilemmaIcon(dilemma.optionA.iconName, "w-6 h-6")}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {dilemma.optionA.text}
            </h3>
          </div>

          {selectedOption && (
            <div className="mt-6 pt-4 border-t border-slate-200 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-violet-700">{dilemma.optionA.percent}% chose this</span>
                <span className="text-slate-500">
                  {(dilemma.optionA.votes + (selectedOption === "A" ? 1 : 0)).toLocaleString()} votes
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-violet-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${dilemma.optionA.percent}%` }}
                />
              </div>
            </div>
          )}
        </button>

        {/* Option B */}
        <button
          onClick={() => handleVote("B")}
          disabled={selectedOption !== null}
          className={`relative p-6 sm:p-7 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between select-none ${
            selectedOption === "B"
              ? "bg-pink-50 border-pink-500 ring-2 ring-pink-500 shadow-md scale-[1.01]"
              : selectedOption !== null
              ? "bg-slate-50/70 border-slate-200 opacity-70"
              : "bg-white hover:bg-pink-50/30 border-slate-200 hover:border-pink-300 shadow-sm hover:shadow-md cursor-pointer"
          }`}
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              {renderDilemmaIcon(dilemma.optionB.iconName, "w-6 h-6")}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {dilemma.optionB.text}
            </h3>
          </div>

          {selectedOption && (
            <div className="mt-6 pt-4 border-t border-slate-200 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-pink-700">{dilemma.optionB.percent}% chose this</span>
                <span className="text-slate-500">
                  {(dilemma.optionB.votes + (selectedOption === "B" ? 1 : 0)).toLocaleString()} votes
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-pink-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${dilemma.optionB.percent}%` }}
                />
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="text-xs text-slate-600 font-medium">
          Answered: <span className="text-violet-700 font-bold">{answeredCount}</span> dilemmas
          {earnedXp > 0 && <span className="text-amber-800 font-bold ml-2">+{earnedXp} XP</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Shuffle Pool</span>
          </button>

          {selectedOption ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all shadow-md shadow-violet-500/20 cursor-pointer"
            >
              <span>Next Dilemma</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span>Skip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onRewardClaimed={(bonus) => setEarnedXp((prev) => prev + bonus)}
      />
    </div>
  );
}
