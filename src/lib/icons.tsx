import React from "react";
import {
  Zap,
  Layers,
  Binary,
  Keyboard,
  Scale,
  Palette,
  Volume2,
  MousePointerClick,
  Lightbulb,
  Smile,
  Compass,
  Globe,
  HelpCircle,
  Flag,
  Tv,
  Gamepad2,
  BrainCircuit,
  Sparkles,
  Dices,
  Flame,
  Clock,
  Music,
  Star,
  Activity as ActivityIcon,
  Cpu,
  Leaf,
  Swords,
  Users,
  CircleDot,
} from "lucide-react";

export const GAME_CARD_IMAGES: Record<string, string> = {
  "number-guess": "/images/number-guess.png",
  "typing-test": "/images/typing-sprint.png",
  "connect-4": "/images/connect-4.png",
  "connect-four": "/images/connect-4.png",
  "memory-game": "/images/fox-card.png",
  "memory-duel": "/images/fox-card.png",
  "reaction-test": "/images/reaction-test.svg",
  "would-you-rather": "/images/would-you-rather.svg",
};

export function getActivityIcon(slug: string, className = "w-6 h-6") {
  switch (slug) {
    case "connect-4":
      return <CircleDot className={`${className} text-rose-500`} />;
    case "reaction-test":
      return <Zap className={`${className} text-amber-500`} />;
    case "memory-game":
      return <Layers className={`${className} text-indigo-500`} />;
    case "number-guess":
      return <Binary className={`${className} text-emerald-500`} />;
    case "typing-test":
      return <Keyboard className={`${className} text-blue-500`} />;
    case "would-you-rather":
      return <Scale className={`${className} text-violet-500`} />;
    case "pixel-art":
      return <Palette className={`${className} text-pink-500`} />;
    case "soundboard":
      return <Volume2 className={`${className} text-purple-500`} />;
    case "click-frenzy":
      return <MousePointerClick className={`${className} text-rose-500`} />;
    case "shower-thoughts":
      return <Lightbulb className={`${className} text-amber-500`} />;
    case "dad-jokes":
      return <Smile className={`${className} text-orange-500`} />;
    case "personality-archetype":
      return <Compass className={`${className} text-teal-500`} />;
    case "general-knowledge-blitz":
      return <Globe className={`${className} text-cyan-500`} />;
    case "impossible-quiz":
      return <HelpCircle className={`${className} text-rose-500`} />;
    case "guess-the-country":
      return <Flag className={`${className} text-blue-500`} />;
    case "nostalgia-quiz":
      return <Tv className={`${className} text-purple-500`} />;
    default:
      return <ActivityIcon className={`${className} text-violet-500`} />;
  }
}

export function getQuizIcon(slug: string, className = "w-6 h-6") {
  switch (slug) {
    case "general-knowledge-blitz":
      return <Globe className={`${className} text-cyan-600`} />;
    case "impossible-quiz":
      return <HelpCircle className={`${className} text-rose-600`} />;
    case "guess-the-country":
      return <Flag className={`${className} text-blue-600`} />;
    case "nostalgia-quiz":
      return <Tv className={`${className} text-purple-600`} />;
    case "mind-bending-logic":
      return <BrainCircuit className={`${className} text-violet-600`} />;
    case "tech-geek-trivia":
      return <Cpu className={`${className} text-emerald-600`} />;
    case "weird-nature-facts":
      return <Leaf className={`${className} text-teal-600`} />;
    case "gaming-legends":
      return <Gamepad2 className={`${className} text-amber-600`} />;
    default:
      return <BrainCircuit className={`${className} text-indigo-600`} />;
  }
}

export function getCategoryIcon(category: string, className = "w-5 h-5") {
  switch (category.toUpperCase()) {
    case "GAME":
      return <Gamepad2 className={`${className} text-violet-600`} />;
    case "QUIZ":
      return <BrainCircuit className={`${className} text-cyan-600`} />;
    case "FUN":
      return <Smile className={`${className} text-amber-600`} />;
    case "CREATIVE":
      return <Palette className={`${className} text-pink-600`} />;
    case "RANDOM":
      return <Dices className={`${className} text-indigo-600`} />;
    case "QUICK":
      return <Zap className={`${className} text-emerald-600`} />;
    case "MULTIPLAYER":
    case "DUEL":
      return <Swords className={`${className} text-rose-600`} />;
    default:
      return <Sparkles className={`${className} text-violet-600`} />;
  }
}
