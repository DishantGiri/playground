"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Globe,
  Compass,
  MapPin,
  Landmark,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Flame,
  Search,
  Flag,
  Mountain,
} from "lucide-react";
import { sound } from "@/lib/audio";

interface Props {
  activitySlug?: string;
}

interface CountryInfo {
  id: string;
  name: string;
  aliases: string[];
  continent: string;
  capital: string;
  borders: string;
  landmark: string;
  fact: string;
  flag: string;
  code: string;
  svgShape: React.ReactNode;
}

const COUNTRIES_DB: CountryInfo[] = [
  {
    id: "jp",
    name: "Japan",
    aliases: ["nippon", "nihon"],
    continent: "Asia",
    capital: "Tokyo",
    borders: "None (Surrounded by Sea of Japan & Pacific Ocean)",
    landmark: "Mount Fuji & Fushimi Inari Shrine",
    fact: "An archipelago of over 6,800 islands renowned for high-speed Shinkansen trains.",
    flag: "🇯🇵",
    code: "JP",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Stylized Japanese Archipelago */}
        <path d="M72,18 C75,22 82,24 80,30 C76,33 70,28 68,22 Z" /> {/* Hokkaido */}
        <path d="M68,32 C65,37 58,45 60,52 C63,58 52,65 42,70 C40,68 46,62 50,55 C54,48 58,42 62,34 Z" /> {/* Honshu */}
        <path d="M43,68 C45,71 49,70 47,74 C43,76 39,72 43,68 Z" /> {/* Shikoku */}
        <path d="M36,71 C38,76 33,83 29,82 C28,78 32,73 36,71 Z" /> {/* Kyushu */}
        <circle cx="22" cy="89" r="2" /> {/* Okinawa */}
      </svg>
    ),
  },
  {
    id: "it",
    name: "Italy",
    aliases: ["italia"],
    continent: "Europe",
    capital: "Rome",
    borders: "France, Switzerland, Austria, Slovenia, San Marino, Vatican City",
    landmark: "Colosseum & Leaning Tower of Pisa",
    fact: "Instantly recognizable boot-shaped peninsula jutting directly into the Mediterranean Sea.",
    flag: "🇮🇹",
    code: "IT",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Distinctive Boot shape */}
        <path d="M26,18 C38,15 62,18 72,25 C68,29 55,27 48,32 C45,36 50,44 54,52 C58,60 66,66 75,66 C73,70 65,71 61,74 C58,78 68,85 64,88 C56,87 50,77 47,68 C43,62 42,50 38,42 C32,36 28,32 26,18 Z" />
        {/* Sicily */}
        <path d="M38,82 C46,80 48,87 40,89 C35,88 34,83 38,82 Z" />
        {/* Sardinia */}
        <path d="M18,48 C22,48 24,56 22,64 C18,63 17,54 18,48 Z" />
      </svg>
    ),
  },
  {
    id: "fr",
    name: "France",
    aliases: ["french republic", "la france"],
    continent: "Europe",
    capital: "Paris",
    borders: "Spain, Belgium, Germany, Switzerland, Italy, Luxembourg, Monaco, Andorra",
    landmark: "Eiffel Tower & Louvre Museum",
    fact: "Often referred to as 'L'Hexagone' (The Hexagon) due to its geometric six-sided continental shape.",
    flag: "🇫🇷",
    code: "FR",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Hexagon shape of France */}
        <polygon points="50,15 78,32 82,68 54,88 24,76 22,38" />
        {/* Corsica */}
        <circle cx="86" cy="82" r="3.5" />
      </svg>
    ),
  },
  {
    id: "br",
    name: "Brazil",
    aliases: ["brasil"],
    continent: "South America",
    capital: "Brasília",
    borders: "Borders every South American nation except Chile and Ecuador",
    landmark: "Christ the Redeemer & Amazon Rainforest",
    fact: "The only Portuguese-speaking nation in the Americas, spanning three time zones.",
    flag: "🇧🇷",
    code: "BR",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Broad South American heartland */}
        <path d="M22,25 C35,18 60,16 75,26 C88,38 86,52 74,66 C65,76 56,88 48,92 C46,82 40,75 32,68 C22,60 16,42 22,25 Z" />
      </svg>
    ),
  },
  {
    id: "eg",
    name: "Egypt",
    aliases: ["misr"],
    continent: "Africa",
    capital: "Cairo",
    borders: "Libya, Sudan, Israel, Gaza Strip",
    landmark: "Great Pyramids of Giza & The Sphinx",
    fact: "Transcontinental nation connecting northeast Africa with the Middle East via the Sinai Peninsula.",
    flag: "🇪🇬",
    code: "EG",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Quad / trapezoid shape with Sinai */}
        <path d="M18,22 L75,22 L75,32 L88,34 L82,48 L76,46 L76,82 L18,82 Z" />
      </svg>
    ),
  },
  {
    id: "au",
    name: "Australia",
    aliases: ["oz", "aussie", "down under"],
    continent: "Oceania",
    capital: "Canberra",
    borders: "None (Entire continent surrounded by Indian & Pacific Oceans)",
    landmark: "Sydney Opera House & Great Barrier Reef",
    fact: "The world's largest island and smallest continent, home to unique marsupials like koalas and kangaroos.",
    flag: "🇦🇺",
    code: "AU",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Australia continent + Tasmania */}
        <path d="M22,34 C30,22 45,26 62,18 C66,28 75,30 84,42 C86,58 76,72 65,75 C52,78 40,65 30,68 C20,64 16,50 22,34 Z" />
        <circle cx="70" cy="85" r="3.5" /> {/* Tasmania */}
      </svg>
    ),
  },
  {
    id: "ca",
    name: "Canada",
    aliases: ["dominion of canada"],
    continent: "North America",
    capital: "Ottawa",
    borders: "United States (longest land border in the world), Greenland (maritime/Hans Island)",
    landmark: "Niagara Falls & Banff National Park",
    fact: "Second-largest country by total area, possessing the longest coastline of any nation (over 202,000 km).",
    flag: "🇨🇦",
    code: "CA",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Canada broad northern shape */}
        <path d="M12,42 C20,28 36,20 60,16 C76,14 85,25 90,44 C84,54 75,64 72,75 C54,75 32,74 15,74 C10,62 10,50 12,42 Z" />
        <circle cx="48" cy="24" r="4" />
        <circle cx="72" cy="26" r="5" />
      </svg>
    ),
  },
  {
    id: "in",
    name: "India",
    aliases: ["bharat", "hindustan"],
    continent: "Asia",
    capital: "New Delhi",
    borders: "Pakistan, China, Nepal, Bhutan, Bangladesh, Myanmar",
    landmark: "Taj Mahal & Himalayas",
    fact: "The most populous nation on Earth, cradle of four major world religions (Hinduism, Buddhism, Jainism, Sikhism).",
    flag: "🇮🇳",
    code: "IN",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Diamond peninsula pointing south */}
        <path d="M44,14 C48,12 55,16 58,22 C64,28 78,32 74,40 C68,45 60,42 58,50 C56,66 52,82 48,92 C42,80 34,62 30,52 C24,44 32,32 38,26 C40,20 42,16 44,14 Z" />
      </svg>
    ),
  },
  {
    id: "np",
    name: "Nepal",
    aliases: ["federal democratic republic of nepal"],
    continent: "Asia",
    capital: "Kathmandu",
    borders: "China (Tibet) to the north, India to the south, east, and west",
    landmark: "Mount Everest (Sagarmatha) & Pashupatinath",
    fact: "Home to 8 of the 14 highest peaks in the world, and possesses the world's only non-quadrilateral national flag.",
    flag: "🇳🇵",
    code: "NP",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Rectangular brick oriented diagonally */}
        <polygon points="15,48 45,35 88,44 82,62 48,58 18,66" />
      </svg>
    ),
  },
  {
    id: "cl",
    name: "Chile",
    aliases: ["republic of chile"],
    continent: "South America",
    capital: "Santiago",
    borders: "Peru, Bolivia, Argentina",
    landmark: "Easter Island (Moai) & Torres del Paine",
    fact: "An extremely long, ribbon-like nation spanning over 4,300 km from north to south with an average width of only 175 km.",
    flag: "🇨🇱",
    code: "CL",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Long thin ribbon curve */}
        <path d="M46,12 C48,22 47,38 45,55 C43,70 38,82 32,94 C30,94 33,80 36,68 C39,52 40,30 42,12 Z" />
      </svg>
    ),
  },
  {
    id: "no",
    name: "Norway",
    aliases: ["norge", "noreg"],
    continent: "Europe",
    capital: "Oslo",
    borders: "Sweden, Finland, Russia",
    landmark: "Geirangerfjord & Trolltunga",
    fact: "Famed for its dramatic jagged coastline with deep sea fjords carved by glaciers during the Ice Age.",
    flag: "🇳🇴",
    code: "NO",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Long Scandinavian spine curving northeast */}
        <path d="M30,86 C25,78 30,68 34,58 C38,46 45,38 52,28 C62,18 78,14 84,16 C80,22 68,26 62,34 C54,42 46,55 42,70 C38,82 32,88 30,86 Z" />
      </svg>
    ),
  },
  {
    id: "mx",
    name: "Mexico",
    aliases: ["united mexican states", "mejico", "mexico"],
    continent: "North America",
    capital: "Mexico City",
    borders: "United States, Guatemala, Belize",
    landmark: "Chichen Itza & Teotihuacan Pyramids",
    fact: "Cradle of ancient Maya and Aztec civilizations, shaped like a horn of plenty terminating in the Yucatan peninsula.",
    flag: "🇲🇽",
    code: "MX",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Mexico horn shape */}
        <path d="M12,28 C20,38 28,42 22,54 C18,60 14,46 12,28 Z" /> {/* Baja */}
        <path d="M24,24 L60,26 C55,42 58,52 68,54 C78,54 86,46 88,48 C90,56 78,66 70,64 C60,60 48,68 40,62 C34,52 28,38 24,24 Z" />
      </svg>
    ),
  },
  {
    id: "za",
    name: "South Africa",
    aliases: ["rsa", "suid-afrika"],
    continent: "Africa",
    capital: "Pretoria / Cape Town / Bloemfontein",
    borders: "Namibia, Botswana, Zimbabwe, Mozambique, Eswatini, encloses Lesotho",
    landmark: "Table Mountain & Kruger National Park",
    fact: "The 'Rainbow Nation' features three distinct capital cities and completely encloses the kingdom of Lesotho within its borders.",
    flag: "🇿🇦",
    code: "ZA",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Southern tip of Africa */}
        <path d="M22,35 C38,30 65,32 78,42 C82,56 75,70 65,78 C52,86 40,84 28,78 C18,68 16,50 22,35 Z" />
      </svg>
    ),
  },
  {
    id: "gr",
    name: "Greece",
    aliases: ["hellas", "hellenic republic"],
    continent: "Europe",
    capital: "Athens",
    borders: "Albania, North Macedonia, Bulgaria, Turkey",
    landmark: "Parthenon (Acropolis) & Santorini",
    fact: "Birthplace of Western democracy, philosophy, theatre, and the Olympic Games, with thousands of Aegean islands.",
    flag: "🇬🇷",
    code: "GR",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Balkan tip with Peloponnese and Crete */}
        <path d="M30,22 C48,22 62,26 66,32 C58,40 50,44 48,54 C42,56 40,64 36,68 C34,62 38,56 38,48 C34,42 30,34 30,22 Z" />
        <circle cx="58" cy="60" r="3" />
        <circle cx="68" cy="65" r="2.5" />
        <path d="M42,84 L68,82 L65,88 L40,88 Z" /> {/* Crete */}
      </svg>
    ),
  },
  {
    id: "kr",
    name: "South Korea",
    aliases: ["republic of korea", "korea"],
    continent: "Asia",
    capital: "Seoul",
    borders: "North Korea (along the 38th parallel DMZ)",
    landmark: "Gyeongbokgung Palace & N Seoul Tower",
    fact: "Global hub of digital technology, robotics, K-pop, and semiconductor manufacturing occupying the southern half of the Korean Peninsula.",
    flag: "🇰🇷",
    code: "KR",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Southern half of Korean Peninsula */}
        <path d="M34,22 L68,24 C72,38 68,52 64,68 C58,74 48,78 40,74 C34,68 36,54 34,42 Z" />
        <circle cx="38" cy="88" r="3" /> {/* Jeju */}
      </svg>
    ),
  },
  {
    id: "gb",
    name: "United Kingdom",
    aliases: ["uk", "britain", "great britain", "england"],
    continent: "Europe",
    capital: "London",
    borders: "Republic of Ireland (only land border)",
    landmark: "Big Ben, Stonehenge & Tower Bridge",
    fact: "Island sovereign nation comprising England, Scotland, Wales, and Northern Ireland.",
    flag: "🇬🇧",
    code: "GB",
    svgShape: (
      <svg viewBox="0 0 100 100" className="w-full h-full fill-emerald-500/80 stroke-emerald-400 stroke-[1.5]">
        {/* Great Britain island */}
        <path d="M52,15 C60,18 64,28 58,36 C52,44 64,52 68,64 C64,74 54,78 42,76 C40,70 48,68 46,58 C42,50 36,44 42,32 C46,24 48,18 52,15 Z" />
        {/* Northern Ireland */}
        <path d="M26,38 C32,38 34,46 30,50 C24,48 24,42 26,38 Z" />
      </svg>
    ),
  },
];

type InputMode = "multiple-choice" | "text-input";

export function GuessTheCountry({ activitySlug = "guess-the-country" }: Props) {
  const [deck, setDeck] = useState<CountryInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>("multiple-choice");
  const [revealedHints, setRevealedHints] = useState<number>(0); // 0 = continent only, 1 = capital, 2 = landmark, 3 = fact/borders, 4 = silhouette/flag
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [options, setOptions] = useState<CountryInfo[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize deck
  const startNewGame = () => {
    const shuffled = [...COUNTRIES_DB].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setIsComplete(false);
    loadQuestion(shuffled, 0);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const currentCountry = deck[currentIndex];

  const loadQuestion = (currentDeck: CountryInfo[], index: number) => {
    if (index >= currentDeck.length || !currentDeck[index]) {
      setIsComplete(true);
      return;
    }
    const target = currentDeck[index];
    const wrongOptions = COUNTRIES_DB.filter((c) => c.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const allOptions = [...wrongOptions, target].sort(() => Math.random() - 0.5);

    setOptions(allOptions);
    setRevealedHints(0);
    setSelectedOption(null);
    setTypedAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);

    if (inputMode === "text-input") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const normalizeString = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  const checkAnswerMatch = (input: string, country: CountryInfo): boolean => {
    const cleanInput = normalizeString(input);
    if (!cleanInput) return false;
    if (cleanInput === normalizeString(country.name)) return true;
    return country.aliases.some((alias) => normalizeString(alias) === cleanInput);
  };

  const handleSelectOption = (chosen: CountryInfo) => {
    if (isAnswered) return;
    sound.playClick();
    setSelectedOption(chosen.name);
    validateAnswer(chosen.id === currentCountry.id);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !typedAnswer.trim()) return;
    sound.playClick();
    const correct = checkAnswerMatch(typedAnswer, currentCountry);
    validateAnswer(correct);
  };

  const validateAnswer = (correct: boolean) => {
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      // 100 base pts minus 15 per additional hint used
      const roundScore = Math.max(25, 100 - revealedHints * 18);
      const bonusStreak = Math.floor(streak * 10);
      const totalEarned = roundScore + bonusStreak;

      setScore((prev) => prev + totalEarned);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));

      if (newStreak % 3 === 0) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    sound.playClick();
    const nextIdx = currentIndex + 1;
    if (nextIdx >= 10 || nextIdx >= deck.length) {
      setIsComplete(true);
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    } else {
      setCurrentIndex(nextIdx);
      loadQuestion(deck, nextIdx);
    }
  };

  const revealNextHint = () => {
    if (isAnswered || revealedHints >= 3) return;
    sound.playClick();
    setRevealedHints((prev) => prev + 1);
  };

  if (!currentCountry) {
    return (
      <div className="w-full flex items-center justify-center p-12 text-slate-400">
        Loading Geography Challenge...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header telemetry & Gamified HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              Guess the Country
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Round {currentIndex + 1}/10
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Analyze geographic coordinates, borders & monuments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
            <Flame className={`w-4 h-4 ${streak > 0 ? "text-amber-400 animate-bounce" : "text-slate-500"}`} />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Streak</div>
              <div className="text-sm font-black text-amber-400">{streak}x</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Score</div>
              <div className="text-sm font-black text-white">{score}</div>
            </div>
          </div>

          <button
            onClick={startNewGame}
            title="Restart Quiz"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isComplete ? (
        /* Results screen */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center gap-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white">Expedition Complete!</h3>
            <p className="text-slate-400 max-w-md text-sm">
              You navigated across continental coordinates and recognized world landmarks!
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-lg">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-xs text-slate-400 uppercase font-bold">Final Score</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{score}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-xs text-slate-400 uppercase font-bold">Best Streak</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{bestStreak}</div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="text-xs text-slate-400 uppercase font-bold">Expedition Rank</div>
              <div className="text-base font-black text-teal-300 mt-1">
                {score > 800 ? "Master Cartographer" : score > 500 ? "World Explorer" : "Geo Scout"}
              </div>
            </div>
          </div>

          <button
            onClick={startNewGame}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      ) : (
        /* Active Game Board */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Clues & Visual Map Silhouette (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Visual silhouette map card */}
            <div className="relative aspect-video rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col items-center justify-center overflow-hidden shadow-xl group">
              <div className="absolute inset-0 bg-radial from-emerald-950/20 via-slate-900/50 to-slate-950 pointer-events-none" />
              
              {/* Grid backdrop */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 w-44 h-44 drop-shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-transform duration-500 group-hover:scale-105">
                {currentCountry.svgShape}
              </div>

              {/* Tag overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-md">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">Territory Outline</span>
              </div>

              {isAnswered && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 backdrop-blur-md animate-in fade-in">
                  <span className="text-xl">{currentCountry.flag}</span>
                  <span className="text-xs font-bold text-white">{currentCountry.name}</span>
                </div>
              )}
            </div>

            {/* Progressive Hint Cards */}
            <div className="flex flex-col gap-2.5">
              {/* Hint 0: Continent (Free) */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-sm">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-slate-400 font-semibold block">Continent</span>
                  <span className="text-white font-medium">{currentCountry.continent}</span>
                </div>
              </div>

              {/* Hint 1: Capital */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-sm">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-slate-400 font-semibold block">Capital City</span>
                  {revealedHints >= 1 || isAnswered ? (
                    <span className="text-white font-medium">{currentCountry.capital}</span>
                  ) : (
                    <span className="text-slate-500 italic text-xs">Locked clue (-15 pts to reveal)</span>
                  )}
                </div>
              </div>

              {/* Hint 2: Famous Landmark */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-sm">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Landmark className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-slate-400 font-semibold block">Landmark / Monument</span>
                  {revealedHints >= 2 || isAnswered ? (
                    <span className="text-white font-medium">{currentCountry.landmark}</span>
                  ) : (
                    <span className="text-slate-500 italic text-xs">Locked clue (-15 pts to reveal)</span>
                  )}
                </div>
              </div>

              {/* Hint 3: Geography Trivia / Borders */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-sm">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Mountain className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-slate-400 font-semibold block">Border Clues & Trivia</span>
                  {revealedHints >= 3 || isAnswered ? (
                    <span className="text-white font-medium text-xs leading-relaxed">{currentCountry.fact}</span>
                  ) : (
                    <span className="text-slate-500 italic text-xs">Locked clue (-15 pts to reveal)</span>
                  )}
                </div>
              </div>

              {/* Reveal hint button */}
              {!isAnswered && revealedHints < 3 && (
                <button
                  onClick={revealNextHint}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/20 transition-all text-xs font-semibold"
                >
                  <Lightbulb className="w-4 h-4" />
                  Unlock Next Clue (-15 pts)
                </button>
              )}
            </div>
          </div>

          {/* Right: Answering Mode (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
              <button
                onClick={() => setInputMode("multiple-choice")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  inputMode === "multiple-choice"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Multiple Choice
              </button>
              <button
                onClick={() => {
                  setInputMode("text-input");
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  inputMode === "text-input"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Type Answer (Pro)
              </button>
            </div>

            {/* Answer Interface */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between flex-1 shadow-xl">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">
                  Identify this Nation
                </span>

                {inputMode === "multiple-choice" ? (
                  /* 4 Choice buttons */
                  <div className="grid grid-cols-1 gap-2.5">
                    {options.map((opt) => {
                      const isSelected = selectedOption === opt.name;
                      const isRealAnswer = opt.id === currentCountry.id;

                      let btnStyle = "bg-slate-800/80 hover:bg-slate-750 text-white border-slate-700/80 hover:border-emerald-500/50";

                      if (isAnswered) {
                        if (isRealAnswer) {
                          btnStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-500/20";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-500/20 text-rose-300 border-rose-500";
                        } else {
                          btnStyle = "bg-slate-800/40 text-slate-500 border-transparent opacity-60";
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt)}
                          disabled={isAnswered}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${btnStyle}`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center text-xs font-bold text-slate-300">
                              {opt.code}
                            </span>
                            {opt.name}
                          </span>
                          {isAnswered && isRealAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          )}
                          {isAnswered && isSelected && !isRealAnswer && (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Text Input Mode */
                  <form onSubmit={handleTextSubmit} className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        placeholder="Type country name..."
                        disabled={isAnswered}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-sm"
                      />
                    </div>
                    {!isAnswered && (
                      <button
                        type="submit"
                        disabled={!typedAnswer.trim()}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-2xl transition-all shadow-md shadow-emerald-600/30 text-sm"
                      >
                        Submit Guess
                      </button>
                    )}
                  </form>
                )}
              </div>

              {/* Feedback banner & Next Button */}
              {isAnswered && (
                <div className="mt-6 pt-5 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                      isCorrect
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div className="text-xs">
                      <span className="font-bold block">
                        {isCorrect ? "Correct Identification!" : "Incorrect Guess!"}
                      </span>
                      <span>
                        The country was <strong className="text-white">{currentCountry.name}</strong> {currentCountry.flag}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>{currentIndex + 1 >= 10 ? "Finish Challenge" : "Next Country"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
