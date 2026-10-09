"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  Smile, 
  ArrowRight, 
  Gift, 
  RotateCcw, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Share2, 
  Flame,
  ThumbsUp,
  Shuffle
} from "lucide-react";
import { RewardedAdModal } from "@/components/ads/RewardedAdModal";
import { sound } from "@/lib/audio";
import Link from "next/link";

interface JokeItem {
  id: number;
  setup: string;
  punchline: string;
  category: "TECH" | "DAD" | "SCIENCE" | "PUN" | "GAMING" | "WORK";
}

const JOKES_DATABASE: JokeItem[] = [
  { id: 1, setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs!", category: "TECH" },
  { id: 2, setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts!", category: "DAD" },
  { id: 3, setup: "What do you call a fake noodle?", punchline: "An impasta!", category: "PUN" },
  { id: 4, setup: "How does a penguin build its house?", punchline: "Igloos it together!", category: "DAD" },
  { id: 5, setup: "Why was the math book sad?", punchline: "Because it had too many problems!", category: "SCIENCE" },
  { id: 6, setup: "Why do cows have hooves instead of feet?", punchline: "Because they lactose!", category: "PUN" },
  { id: 7, setup: "There are 10 types of people in the world...", punchline: "Those who understand binary, and those who don't!", category: "TECH" },
  { id: 8, setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field!", category: "DAD" },
  { id: 9, setup: "Why do we tell actors to 'break a leg'?", punchline: "Because every play has a cast!", category: "PUN" },
  { id: 10, setup: "Why can't you trust atoms?", punchline: "They make up everything!", category: "SCIENCE" },
  { id: 11, setup: "What is a programmer's favorite hangout spot?", punchline: "Foo Bar!", category: "TECH" },
  { id: 12, setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved!", category: "DAD" },
  { id: 13, setup: "Why did the golfer bring two pairs of pants?", punchline: "In case he got a hole in one!", category: "DAD" },
  { id: 14, setup: "How do you organize a space party?", punchline: "You planet!", category: "SCIENCE" },
  { id: 15, setup: "What did one DNA strand say to the other?", punchline: "'Do these genes make me look fat?'", category: "SCIENCE" },
  { id: 16, setup: "Why was the JavaScript developer sad?", punchline: "Because they didn't know how to 'null' their feelings!", category: "TECH" },
  { id: 17, setup: "What do you call a factory that makes okay products?", punchline: "A satisfactory!", category: "PUN" },
  { id: 18, setup: "Why did the coffee file a police report?", punchline: "It got mugged!", category: "DAD" },
  { id: 19, setup: "What do you call cheese that isn't yours?", punchline: "Nacho cheese!", category: "PUN" },
  { id: 20, setup: "Why did the computer keep freezing?", punchline: "It left its Windows open!", category: "TECH" },
  { id: 21, setup: "How do trees access the internet?", punchline: "They log in!", category: "TECH" },
  { id: 22, setup: "What do you call a sleeping dinosaur?", punchline: "A dino-snore!", category: "DAD" },
  { id: 23, setup: "Why did the physics teacher break up with the biology teacher?", punchline: "There was no chemistry!", category: "SCIENCE" },
  { id: 24, setup: "What did the zero say to the eight?", punchline: "'Nice belt!'", category: "PUN" },
  { id: 25, setup: "Why was 6 afraid of 7?", punchline: "Because 7, 8, 9!", category: "DAD" },
  { id: 26, setup: "A SQL query walks into a bar, walks up to two tables and asks...", punchline: "'Can I join you?'", category: "TECH" },
  { id: 27, setup: "What do you call an alligator in a vest?", punchline: "An investigator!", category: "PUN" },
  { id: 28, setup: "Why did the bicycle fall over?", punchline: "It was two-tired!", category: "DAD" },
  { id: 29, setup: "How many tickles does it take to make an octopus laugh?", punchline: "Ten tickles!", category: "PUN" },
  { id: 30, setup: "What did one wall say to the other wall?", punchline: "'I'll meet you at the corner!'", category: "DAD" },
  { id: 31, setup: "Why do Python programmers have bad posture?", punchline: "Because they never use brackets to support their spine!", category: "TECH" },
  { id: 32, setup: "What do you call a gamer who never loses?", punchline: "A console-ation prize!", category: "GAMING" },
  { id: 33, setup: "Why did Mario break up with Princess Peach?", punchline: "Because she was always in another castle!", category: "GAMING" },
  { id: 34, setup: "Why did the PowerPoint presentation cross the road?", punchline: "To get to the other slide!", category: "WORK" },
  { id: 35, setup: "Why don't scientists trust stairs?", punchline: "Because they are always up to something!", category: "SCIENCE" },
  { id: 36, setup: "What did the pirate say on his 80th birthday?", punchline: "'Aye matey!'", category: "DAD" },
  { id: 37, setup: "Why can't you hear a pterodactyl in the bathroom?", punchline: "Because the 'P' is silent!", category: "PUN" },
  { id: 38, setup: "How does a software engineer make coffee?", punchline: "Java virtual grind!", category: "TECH" },
  { id: 39, setup: "Why was the belt arrested?", punchline: "For holding up a pair of pants!", category: "PUN" },
  { id: 40, setup: "What did the janitor say when he jumped out of the closet?", punchline: "'Supplies!'", category: "PUN" },
  { id: 41, setup: "Why do crabs never give to charity?", punchline: "Because they are shellfish!", category: "DAD" },
  { id: 42, setup: "Why did the developer go broke?", punchline: "Because he used up all his cache!", category: "TECH" },
  { id: 43, setup: "What do you call a fish without eyes?", punchline: "A fsh!", category: "DAD" },
  { id: 44, setup: "Why did the cell phone wear glasses?", punchline: "Because it lost its contacts!", category: "TECH" },
  { id: 45, setup: "What is an astronaut's favorite key on a keyboard?", punchline: "The Space bar!", category: "SCIENCE" },
  { id: 46, setup: "Why did the cookie go to the hospital?", punchline: "Because it felt crummy!", category: "DAD" },
  { id: 47, setup: "Why do bees have sticky hair?", punchline: "Because they use honeycombs!", category: "DAD" },
  { id: 48, setup: "Why was the stadium so cool?", punchline: "Because it was filled with fans!", category: "DAD" },
  { id: 49, setup: "What did the big flower say to the little flower?", punchline: "'Hi bud!'", category: "DAD" },
  { id: 50, setup: "How many programmers does it take to change a lightbulb?", punchline: "None, that's a hardware problem!", category: "TECH" },
  { id: 51, setup: "Why did the tomato blush?", punchline: "Because it saw the salad dressing!", category: "PUN" },
  { id: 52, setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!", category: "DAD" },
  { id: 53, setup: "What's orange and sounds like a parrot?", punchline: "A carrot!", category: "DAD" },
  { id: 54, setup: "Why did the music teacher need a ladder?", punchline: "To reach the high notes!", category: "DAD" },
  { id: 55, setup: "How do you make holy water?", punchline: "You boil the hell out of it!", category: "DAD" },
  { id: 56, setup: "Why do ducks have feathers?", punchline: "To cover their butt quacks!", category: "DAD" },
  { id: 57, setup: "What did the calendar say when it got promoted?", punchline: "'My days are numbered!'", category: "WORK" },
  { id: 58, setup: "Why did the employee get fired from the keyboard factory?", punchline: "Because he wasn't putting in enough shifts!", category: "WORK" },
  { id: 59, setup: "What do you call an honest politician?", punchline: "A 404 Not Found error!", category: "TECH" },
  { id: 60, setup: "Why was the mushroom invited to every party?", punchline: "Because he was a fungi!", category: "SCIENCE" },
  { id: 61, setup: "What did the limestone say to the geologist?", punchline: "'Don't take me for granite!'", category: "SCIENCE" },
  { id: 62, setup: "What do you get when you cross a snowman with a vampire?", punchline: "Frostbite!", category: "PUN" },
  { id: 63, setup: "Why do Minecraft players never get sunburned?", punchline: "Because they live under blocks!", category: "GAMING" },
  { id: 64, setup: "Why was Sonic late to the meeting?", punchline: "He took the slow lane by mistake!", category: "GAMING" },
  { id: 65, setup: "What do you call a pencil with two erasers?", punchline: "Pointless!", category: "PUN" },
  { id: 66, setup: "Why was Cinderella so bad at soccer?", punchline: "Because she kept running away from the ball!", category: "DAD" },
  { id: 67, setup: "What did the tie say to the hat?", punchline: "'You go on ahead, I'll hang around!'", category: "DAD" },
  { id: 68, setup: "Why did the robot go on vacation?", punchline: "To recharge its batteries!", category: "TECH" },
  { id: 69, setup: "What do you call two birds in love?", punchline: "Tweet-hearts!", category: "PUN" },
  { id: 70, setup: "Why do elevators make great storytellers?", punchline: "Because they work on so many levels!", category: "PUN" },
  { id: 71, setup: "What did the left eye say to the right eye?", punchline: "'Between you and me, something smells!'", category: "DAD" },
  { id: 72, setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!", category: "DAD" },
  { id: 73, setup: "What do you call a boomerang that doesn't come back?", punchline: "A stick!", category: "DAD" },
  { id: 74, setup: "How do you know if a joke is a dad joke?", punchline: "When it becomes apparent!", category: "DAD" },
  { id: 75, setup: "Why did the web developer leave the restaurant?", punchline: "Because of the bad table layout!", category: "TECH" },
];

export function DadJokes({ activitySlug = "dad-jokes" }: { activitySlug?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [revealed, setRevealed] = useState(false);
  const [seenIds, setSeenIds] = useState<number[]>([]);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reactions, setReactions] = useState<{ laugh: number; groan: number; dead: number }>({
    laugh: 12,
    groan: 4,
    dead: 8,
  });
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  // Initialize with a truly random joke index on mount
  useEffect(() => {
    const randomStart = Math.floor(Math.random() * JOKES_DATABASE.length);
    setCurrentIndex(randomStart);
    setSeenIds([JOKES_DATABASE[randomStart].id]);
  }, []);

  const filteredJokes =
    selectedCategory === "ALL"
      ? JOKES_DATABASE
      : JOKES_DATABASE.filter((j) => j.category === selectedCategory);

  const joke = filteredJokes[currentIndex % filteredJokes.length] || JOKES_DATABASE[0];

  const handleReveal = () => {
    sound.playSuccess();
    setRevealed(true);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });

    fetch("/api/games/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activitySlug, score: 30 }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.pointsEarned) setEarnedXp(d.pointsEarned);
      })
      .catch(console.error);
  };

  const nextJoke = () => {
    sound.playClick();
    setRevealed(false);
    setActiveReaction(null);

    // Pick an unseen joke from the filtered category
    const unread = filteredJokes.filter((j) => !seenIds.includes(j.id));
    if (unread.length > 0) {
      const nextChoice = unread[Math.floor(Math.random() * unread.length)];
      setSeenIds((prev) => [...prev, nextChoice.id]);
      const nextIdx = filteredJokes.findIndex((j) => j.id === nextChoice.id);
      setCurrentIndex(nextIdx !== -1 ? nextIdx : 0);
    } else {
      // Shuffled reset if all have been seen
      const randomIdx = Math.floor(Math.random() * filteredJokes.length);
      setSeenIds([filteredJokes[randomIdx].id]);
      setCurrentIndex(randomIdx);
    }
  };

  const handleShuffle = () => {
    sound.playClick();
    setRevealed(false);
    setActiveReaction(null);
    const randomIdx = Math.floor(Math.random() * filteredJokes.length);
    setCurrentIndex(randomIdx);
  };

  const handleReaction = (type: "laugh" | "groan" | "dead") => {
    sound.playSuccess();
    setActiveReaction(type);
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.75 },
    });
  };

  const copyToClipboard = () => {
    sound.playClick();
    const textToCopy = `"${joke.setup}" - ${joke.punchline}\n(via Bored? Instant Entertainment)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { label: "All Jokes", value: "ALL" },
    { label: "Tech & Code", value: "TECH" },
    { label: "Classic Dad", value: "DAD" },
    { label: "Science", value: "SCIENCE" },
    { label: "Puns", value: "PUN" },
    { label: "Gaming", value: "GAMING" },
    { label: "Workplace", value: "WORK" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      
      {/* Category Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              sound.playClick();
              setSelectedCategory(c.value);
              const pool = c.value === "ALL" ? JOKES_DATABASE : JOKES_DATABASE.filter((j) => j.category === c.value);
              const randomIdx = Math.floor(Math.random() * pool.length);
              setCurrentIndex(randomIdx);
              setRevealed(false);
              setActiveReaction(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedCategory === c.value
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Main Joke Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-6 relative overflow-hidden">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {joke.category} HUMOR #{joke.id}
          </span>

          <span className="text-[11px] font-semibold text-slate-400">
            Seen {seenIds.length} of {filteredJokes.length} jokes
          </span>
        </div>

        {/* Mascot / Smile Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
          <Smile className="w-8 h-8 text-amber-600" />
        </div>

        {/* Joke Setup */}
        <div className="space-y-3">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight">
            &ldquo;{joke.setup}&rdquo;
          </h3>
        </div>

        {/* Reveal or Punchline */}
        {!revealed ? (
          <div className="pt-2">
            <button
              onClick={handleReveal}
              className="px-8 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 transition-all shadow-md shadow-amber-500/25 cursor-pointer"
            >
              REVEAL PUNCHLINE
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in zoom-in-95">
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50/90 via-amber-100/50 to-orange-50/80 border border-amber-200 text-lg sm:text-xl font-black text-amber-950 shadow-inner">
              {joke.punchline}
            </div>

            {/* Reaction Bar */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                How bad was it? Rate this joke:
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleReaction("laugh")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeReaction === "laugh"
                      ? "bg-amber-100 border-amber-300 text-amber-800 scale-105"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>😂</span>
                  <span>Hilarious ({reactions.laugh})</span>
                </button>

                <button
                  onClick={() => handleReaction("groan")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeReaction === "groan"
                      ? "bg-orange-100 border-orange-300 text-orange-800 scale-105"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>🤦</span>
                  <span>Groan ({reactions.groan})</span>
                </button>

                <button
                  onClick={() => handleReaction("dead")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeReaction === "dead"
                      ? "bg-violet-100 border-violet-300 text-violet-800 scale-105"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>💀</span>
                  <span>Dead ({reactions.dead})</span>
                </button>
              </div>
            </div>

            {/* Actions: Next Joke & Copy */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={nextJoke}
                className="px-6 py-3 rounded-xl font-black text-xs sm:text-sm text-white bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-violet-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Next Random Joke</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="px-4 py-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Copy joke text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Shuffle Random Quick Link */}
        <div className="pt-2">
          <button
            onClick={handleShuffle}
            className="text-xs font-bold text-slate-400 hover:text-violet-600 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise me with any random joke</span>
          </button>
        </div>
      </div>

      {/* Footer XP & Next */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <button
          onClick={() => setShowRewardedAd(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer"
        >
          <Gift className="w-3.5 h-3.5 text-amber-600" />
          <span>Claim +50 Bonus XP</span>
        </button>

        <Link
          href="/explore"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-sm"
        >
          <span>DO ANOTHER ACTIVITY</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <RewardedAdModal
        isOpen={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onRewardClaimed={(bonus) => setEarnedXp((prev) => prev + bonus)}
      />
    </div>
  );
}
