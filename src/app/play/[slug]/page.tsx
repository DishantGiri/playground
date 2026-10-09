import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdSlot } from "@/components/ads/AdSlot";
import { ReactionTest } from "@/components/games/ReactionTest";
import { MemoryGame } from "@/components/games/MemoryGame";
import { NumberGuess } from "@/components/games/NumberGuess";
import { TypingTest } from "@/components/games/TypingTest";
import { WouldYouRather } from "@/components/games/WouldYouRather";
import { PixelArtStudio } from "@/components/games/PixelArtStudio";
import { Soundboard } from "@/components/games/Soundboard";
import { ClickFrenzy } from "@/components/games/ClickFrenzy";
import { ShowerThoughts } from "@/components/games/ShowerThoughts";
import { DadJokes } from "@/components/games/DadJokes";
import { PersonalityArchetype } from "@/components/games/PersonalityArchetype";
import { ConnectFour } from "@/components/games/ConnectFour";

// Master Platform Games
import { DotsAndBoxes } from "@/components/games/DotsAndBoxes";
import { NineMensMorris } from "@/components/games/NineMensMorris";
import { WhackAMole } from "@/components/games/WhackAMole";
import { Sudoku } from "@/components/games/Sudoku";
import { DailyWordGuess } from "@/components/games/DailyWordGuess";
import { Hangman } from "@/components/games/Hangman";
import { GeneralKnowledgeQuiz } from "@/components/games/GeneralKnowledgeQuiz";
import { FlagCountryQuiz } from "@/components/games/FlagCountryQuiz";
import { ScienceQuiz } from "@/components/games/ScienceQuiz";
import { GuessTheCountry } from "@/components/games/GuessTheCountry";
import { TrueOrFalse } from "@/components/games/TrueOrFalse";

import { PlayActivityShell } from "@/components/layout/PlayActivityShell";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_ACTIVITIES: Record<
  string,
  {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    points: number;
    estimatedTime: string;
    rating: number;
  }
> = {
  "dots-and-boxes": {
    title: "Dots and Boxes",
    description: "Tactical territory conquest! Connect dots, claim squares, gain bonus turns, and conquer against AI or friends.",
    category: "GAME",
    difficulty: "MEDIUM",
    points: 40,
    estimatedTime: "3 min",
    rating: 4.9,
  },
  "nine-mens-morris": {
    title: "Nine Men's Morris",
    description: "Ancient strategic Roman mill game! Place pieces, align 3 in a row, capture enemy men, and achieve flying supremacy.",
    category: "GAME",
    difficulty: "HARD",
    points: 50,
    estimatedTime: "5 min",
    rating: 4.9,
  },
  "whack-a-mole": {
    title: "Whack-a-Mole Arcade",
    description: "Fast-paced reflex frenzy! Whack emerging moles, hit golden moles for bonus points, and avoid bomb traps.",
    category: "GAME",
    difficulty: "EASY",
    points: 30,
    estimatedTime: "1 min",
    rating: 4.8,
  },
  "sudoku": {
    title: "Sudoku Master",
    description: "Authentic 9x9 logic puzzle generator with unique solutions, candidate notes, conflict checking, and 4 difficulty tiers.",
    category: "GAME",
    difficulty: "HARD",
    points: 45,
    estimatedTime: "5 min",
    rating: 4.9,
  },
  "daily-word-guess": {
    title: "Daily Word Guess",
    description: "Wordle-style deduction! Guess the secret 5-letter word in 6 tries with color hints and shareable streak tracking.",
    category: "GAME",
    difficulty: "MEDIUM",
    points: 35,
    estimatedTime: "3 min",
    rating: 4.9,
  },
  "hangman": {
    title: "Hangman Word Mystery",
    description: "Classic vocabulary showdown! Guess categorized words before the 6-stage gallows is fully constructed.",
    category: "GAME",
    difficulty: "MEDIUM",
    points: 30,
    estimatedTime: "2 min",
    rating: 4.7,
  },
  "general-knowledge-quiz": {
    title: "General Knowledge Quiz",
    description: "High-priority trivia arena! Test your mastery across science, geography, history, and pop culture with timed questions.",
    category: "QUIZ",
    difficulty: "MEDIUM",
    points: 40,
    estimatedTime: "3 min",
    rating: 4.9,
  },
  "flag-country-quiz": {
    title: "Flag & Country Quiz",
    description: "Global flag identification challenge! Match sovereign nations with their banners and capitals across dual game modes.",
    category: "QUIZ",
    difficulty: "MEDIUM",
    points: 35,
    estimatedTime: "2 min",
    rating: 4.8,
  },
  "science-quiz": {
    title: "Science & Nature Quiz",
    description: "Deep dive into physics, astronomy, chemistry, and biology with verified scientific explanations and score breakdowns.",
    category: "QUIZ",
    difficulty: "HARD",
    points: 40,
    estimatedTime: "3 min",
    rating: 4.9,
  },
  "guess-the-country": {
    title: "Guess the Country",
    description: "Cartographic detective game! Recognize nations through territory SVG silhouettes, capital cities, and border clues.",
    category: "QUIZ",
    difficulty: "HARD",
    points: 45,
    estimatedTime: "3 min",
    rating: 4.9,
  },
  "true-or-false": {
    title: "True or False Fact Blitz",
    description: "Rapid-fire fact verification! Discriminate genuine scientific and historical truths from popular urban legends.",
    category: "QUIZ",
    difficulty: "EASY",
    points: 30,
    estimatedTime: "2 min",
    rating: 4.8,
  },
};

export default async function PlayPage({ params }: PageProps) {
  const { slug } = await params;

  let activity = await prisma.activity.findUnique({
    where: { slug },
  });

  // Graceful fallback to static definition if not seeded in DB
  if (!activity) {
    const fallback = FALLBACK_ACTIVITIES[slug];
    if (fallback) {
      activity = {
        id: `fb-${slug}`,
        slug,
        title: fallback.title,
        description: fallback.description,
        category: fallback.category,
        type: "MINI_GAME",
        thumbnail: `/images/activities/${slug}.jpg`,
        difficulty: fallback.difficulty,
        estimatedTime: fallback.estimatedTime,
        points: fallback.points,
        playCount: 1200,
        rating: fallback.rating,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      notFound();
    }
  }

  // Render appropriate game based on slug
  const renderGameComponent = () => {
    switch (activity.slug) {
      // 11 Master Platform Games
      case "dots-and-boxes":
        return <DotsAndBoxes activitySlug={activity.slug} />;
      case "nine-mens-morris":
        return <NineMensMorris activitySlug={activity.slug} />;
      case "whack-a-mole":
        return <WhackAMole activitySlug={activity.slug} />;
      case "sudoku":
        return <Sudoku activitySlug={activity.slug} />;
      case "daily-word-guess":
        return <DailyWordGuess activitySlug={activity.slug} />;
      case "hangman":
        return <Hangman activitySlug={activity.slug} />;
      case "general-knowledge-quiz":
        return <GeneralKnowledgeQuiz activitySlug={activity.slug} />;
      case "flag-country-quiz":
        return <FlagCountryQuiz activitySlug={activity.slug} />;
      case "science-quiz":
        return <ScienceQuiz activitySlug={activity.slug} />;
      case "guess-the-country":
        return <GuessTheCountry activitySlug={activity.slug} />;
      case "true-or-false":
        return <TrueOrFalse activitySlug={activity.slug} />;

      // Existing playground games
      case "connect-4":
        return <ConnectFour activitySlug={activity.slug} />;
      case "reaction-test":
        return <ReactionTest activitySlug={activity.slug} />;
      case "memory-game":
        return <MemoryGame activitySlug={activity.slug} />;
      case "number-guess":
        return <NumberGuess activitySlug={activity.slug} />;
      case "typing-test":
        return <TypingTest activitySlug={activity.slug} />;
      case "would-you-rather":
        return <WouldYouRather activitySlug={activity.slug} />;
      case "pixel-art":
        return <PixelArtStudio activitySlug={activity.slug} />;
      case "soundboard":
        return <Soundboard activitySlug={activity.slug} />;
      case "click-frenzy":
        return <ClickFrenzy activitySlug={activity.slug} />;
      case "shower-thoughts":
        return <ShowerThoughts activitySlug={activity.slug} />;
      case "dad-jokes":
        return <DadJokes activitySlug={activity.slug} />;
      case "personality-archetype":
        return <PersonalityArchetype activitySlug={activity.slug} />;
      default:
        return <ReactionTest activitySlug={activity.slug} />;
    }
  };

  return (
    <PlayActivityShell activity={activity}>
      <div className="w-full flex flex-col items-center gap-6">
        {renderGameComponent()}
        <div className="w-full pt-4">
          <AdSlot placement="banner" />
        </div>
      </div>
    </PlayActivityShell>
  );
}
