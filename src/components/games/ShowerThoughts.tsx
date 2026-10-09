"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Gift, Share2, Check, Lightbulb, RotateCcw } from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import Link from "next/link";

const THOUGHTS_POOL = [
  {
    text: "If you're 25 years old, you've survived approximately 9,125 rotations around the Earth's axis while traveling 14.7 billion miles through space.",
    category: "COSMOS",
    mindBlownCount: 8420,
  },
  {
    text: "Your future self is watching you right now through your memories.",
    category: "EXISTENTIAL",
    mindBlownCount: 12940,
  },
  {
    text: "Water is not wet itself; it creates the physical sensation of wetness when in contact with other matter.",
    category: "PHYSICS",
    mindBlownCount: 9120,
  },
  {
    text: "A fire is essentially a solid object violently untying its chemical knot into gas and thermal radiation.",
    category: "CHEMISTRY",
    mindBlownCount: 6540,
  },
  {
    text: "We buy garbage bags only to immediately throw them away in the trash.",
    category: "EVERYDAY",
    mindBlownCount: 15300,
  },
  {
    text: "Every mirror you buy at the store is in used condition.",
    category: "LOGIC",
    mindBlownCount: 11450,
  },
  {
    text: "When you drink water from a municipal tap, you are drinking recycled dinosaur urine from 100 million years ago.",
    category: "SCIENCE",
    mindBlownCount: 14200,
  },
  {
    text: "Sleep is the free trial of death, and waking up is renewing your subscription to consciousness.",
    category: "PHILOSOPHY",
    mindBlownCount: 16800,
  },
  {
    text: "Your stomach thinks all potatoes are mashed by the time they arrive.",
    category: "HUMOR",
    mindBlownCount: 13900,
  },
  {
    text: "Clapping is just repeatedly hitting yourself because you enjoyed someone else's performance.",
    category: "SOCIETY",
    mindBlownCount: 10850,
  },
  {
    text: "Technically, you're always looking at your own nose; your brain just chooses to edit it out of your vision.",
    category: "BIOLOGY",
    mindBlownCount: 17200,
  },
  {
    text: "The brain named itself, studied itself, and then decided it was the most complex organ in the universe.",
    category: "NEUROSCIENCE",
    mindBlownCount: 19400,
  },
];

export function ShowerThoughts({ activitySlug = "shower-thoughts" }: { activitySlug?: string }) {
  const [shuffledThoughts, setShuffledThoughts] = useState(() =>
    [...THOUGHTS_POOL].sort(() => Math.random() - 0.5)
  );
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [votes, setVotes] = useState<number[]>(() =>
    THOUGHTS_POOL.map((t) => t.mindBlownCount)
  );
  const [hasVoted, setHasVoted] = useState<Record<number, boolean>>({});
  const [earnedXp, setEarnedXp] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  const current = shuffledThoughts[index % shuffledThoughts.length];

  const handleVote = () => {
    if (hasVoted[index]) return;
    sound.playCorrect();
    setVotes((prev) => {
      const copy = [...prev];
      copy[index] = (copy[index] || 10000) + 1;
      return copy;
    });

    setHasVoted((prev) => ({ ...prev, [index]: true }));

    fetch("/api/games/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activitySlug, score: 50 }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.pointsEarned) setEarnedXp(d.pointsEarned);
      })
      .catch(console.error);
  };

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(current.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextThought = () => {
    sound.playClick();
    setIndex((prev) => (prev + 1) % shuffledThoughts.length);
  };

  const restartShuffle = () => {
    sound.playClick();
    setShuffledThoughts([...THOUGHTS_POOL].sort(() => Math.random() - 0.5));
    setIndex(0);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 text-center">
        
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            {current.category}
          </span>
          <span className="text-slate-500 font-semibold">
            Thought {(index % shuffledThoughts.length) + 1} of {shuffledThoughts.length}
          </span>
        </div>

        <blockquote className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed pt-2">
          &ldquo;{current.text}&rdquo;
        </blockquote>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={handleVote}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              hasVoted[index]
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>Mind Blown ({(votes[index] || current.mindBlownCount).toLocaleString()})</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <button
          onClick={() => {
            sound.playClick();
            setShowRewardedAd(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer"
        >
          <Gift className="w-3.5 h-3.5 text-amber-600" />
          <span>Claim +50 Bonus XP</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={restartShuffle}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Shuffle</span>
          </button>

          <button
            onClick={nextThought}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors cursor-pointer shadow-sm"
          >
            <span>Next Thought</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
