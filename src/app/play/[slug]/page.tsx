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
import { Star, Clock, ArrowLeft, Trophy } from "lucide-react";
import { getActivityIcon } from "@/lib/icons";
import Link from "next/link";

import { PlayActivityShell } from "@/components/layout/PlayActivityShell";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PlayPage({ params }: PageProps) {
  const { slug } = await params;

  const activity = await prisma.activity.findUnique({
    where: { slug },
  });

  if (!activity) {
    notFound();
  }

  // Render appropriate game based on slug or type
  const renderGameComponent = () => {
    switch (activity.slug) {
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
