"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dices, Sparkles, X, ArrowRight, Gamepad2 } from "lucide-react";
import { getActivityIcon } from "@/lib/icons";
import { sound } from "@/lib/audio";

interface SurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHUFFLE_ACTIVITIES = [
  { slug: "reaction-test", name: "Reflex Speed Test" },
  { slug: "memory-game", name: "Card Memory Challenge" },
  { slug: "connect-4", name: "Connect 4 Battle" },
  { slug: "number-guess", name: "Number Guess" },
  { slug: "typing-test", name: "Speed Typing Sprint" },
  { slug: "pixel-art", name: "Pixel Art Studio" },
  { slug: "soundboard", name: "Lo-Fi Synth Beats" },
  { slug: "shower-thoughts", name: "Shower Thoughts" },
  { slug: "dad-jokes", name: "Punchline Machine" },
  { slug: "would-you-rather", name: "Would You Rather" },
];

export function SurpriseModal({ isOpen, onClose }: SurpriseModalProps) {
  const router = useRouter();
  const [shufflingIndex, setShufflingIndex] = useState(0);
  const [targetActivity, setTargetActivity] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      setIsReady(false);
      setTargetActivity(null);

      sound.playFlip();

      interval = setInterval(() => {
        setShufflingIndex((prev) => (prev + 1) % SHUFFLE_ACTIVITIES.length);
        sound.playClick();
      }, 120);

      fetch("/api/surprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
        .then((res) => res.json())
        .then((data) => {
          setTimeout(() => {
            clearInterval(interval);
            setTargetActivity(data);
            setIsReady(true);
            sound.playSuccess();
          }, 1200);
        })
        .catch(() => {
          clearInterval(interval);
          onClose();
          router.push("/explore");
        });
    }

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLaunch = () => {
    sound.playClick();
    if (targetActivity?.targetUrl) {
      onClose();
      router.push(targetActivity.targetUrl);
    }
  };

  const currentShuffle = SHUFFLE_ACTIVITIES[shufflingIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E8E8E5] p-6 sm:p-7 shadow-lg text-center overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#202124] transition-colors cursor-pointer"
          aria-label="Close surprise modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316] shadow-2xs">
          <Gamepad2 className={`w-7 h-7 text-[#F97316] ${!isReady ? "animate-spin" : ""}`} />
        </div>

        {!isReady ? (
          <div className="space-y-3 pt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6366F1] bg-[#EEF2FF] px-2.5 py-0.5 rounded-lg border border-[#C7D2FE]">
              Finding Your Next Break...
            </span>

            <div className="h-14 flex items-center justify-center gap-2">
              {getActivityIcon(currentShuffle.slug, "w-5 h-5 text-[#202124]")}
              <span className="text-lg font-black text-[#202124]">
                {currentShuffle.name}
              </span>
            </div>

            <p className="text-xs text-[#6B7280]">
              Picking a quick, delightful mini-game for you...
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-4 animate-in fade-in zoom-in-95">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] bg-[#F0FDF4] px-2.5 py-0.5 rounded-lg border border-[#DCFCE7]">
              Ready To Play!
            </span>

            <div className="space-y-1.5">
              <div className="w-11 h-11 mx-auto rounded-xl bg-[#F0F0ED] border border-[#E8E8E5] flex items-center justify-center shadow-2xs">
                {getActivityIcon(targetActivity?.activity?.slug || "", "w-6 h-6 text-[#202124]")}
              </div>
              <h3 className="text-xl font-black text-[#202124]">
                {targetActivity?.activity?.title}
              </h3>
              <p className="text-xs text-[#6B7280] line-clamp-2 px-2">
                {targetActivity?.activity?.description}
              </p>
            </div>

            <button
              onClick={handleLaunch}
              className="w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#F97316] hover:bg-[#EA580C] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Play Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
