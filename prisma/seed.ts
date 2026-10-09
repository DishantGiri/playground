import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "127.0.0.1",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "bored_db",
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

// ==========================================
// SNAPSHOT DATABASE SEEDER (Complete Dataset)
// ==========================================

const usersData = [
  {
    "id": "cmuz561240000nei03zz6sbyc",
    "name": "Admin Boss",
    "email": "admin@bored.app",
    "password": "$2b$10$OHAqVSWe8j/MREzXwNn.beyoXct5UqDsw158E4wB3PcjQNPO/GHdK",
    "image": "https://api.dicebear.com/7.x/bottts/svg?seed=Admin",
    "role": "ADMIN",
    "points": 15400,
    "level": 15,
    "streak": 14,
    "lastActiveDate": "2026-10-08"
  },
  {
    "id": "cmuz5613x0001nei01jzbhv4r",
    "name": "Alex Gamer",
    "email": "alex@example.com",
    "password": "$2b$10$I3gjXredMmPfMsYHDLIVDePIIgdYoTaoc9rPu8DtLkoE9rrpqSXfC",
    "image": "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
    "role": "USER",
    "points": 12450,
    "level": 12,
    "streak": 7,
    "lastActiveDate": "2026-10-08"
  },
  {
    "id": "cmuz5614u0002nei0dbs804u0",
    "name": "Sam Explorer",
    "email": "sam@example.com",
    "password": "$2b$10$I3gjXredMmPfMsYHDLIVDePIIgdYoTaoc9rPu8DtLkoE9rrpqSXfC",
    "image": "https://api.dicebear.com/7.x/bottts/svg?seed=Sam",
    "role": "USER",
    "points": 9830,
    "level": 10,
    "streak": 5,
    "lastActiveDate": "2026-10-08"
  },
  {
    "id": "cmuz5615g0003nei0p8z8myh4",
    "name": "John Swift",
    "email": "john@example.com",
    "password": "$2b$10$I3gjXredMmPfMsYHDLIVDePIIgdYoTaoc9rPu8DtLkoE9rrpqSXfC",
    "image": "https://api.dicebear.com/7.x/bottts/svg?seed=John",
    "role": "USER",
    "points": 8920,
    "level": 9,
    "streak": 4,
    "lastActiveDate": "2026-10-08"
  }
];

const activitiesData = [
  {
    "id": "act_dots_and_boxes",
    "title": "Dots and Boxes Strategy",
    "slug": "dots-and-boxes",
    "description": "Tactical territory conquest! Connect dots, claim squares, gain bonus turns, and test your wits against smart heuristic AI or a friend.",
    "category": "GAME",
    "type": "MINI_GAME",
    "thumbnail": "/images/connect-4.png",
    "difficulty": "MEDIUM",
    "estimatedTime": "3 min",
    "points": 40,
    "playCount": 4200,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "act_nine_mens_morris",
    "title": "Nine Men's Morris",
    "slug": "nine-mens-morris",
    "description": "Ancient strategic mill game! Place pieces, align 3 in a row, capture opposing pieces, and master Phase 3 flying maneuvers.",
    "category": "GAME",
    "type": "MINI_GAME",
    "thumbnail": "/images/activities/connect-4.png",
    "difficulty": "HARD",
    "estimatedTime": "5 min",
    "points": 50,
    "playCount": 3890,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "act_whack_a_mole",
    "title": "Whack-a-Mole Arcade",
    "slug": "whack-a-mole",
    "description": "High-octane reflex arcade! Tap moles before they duck, chain insane combo multipliers, hit golden moles, and dodge dangerous bomb traps.",
    "category": "GAME",
    "type": "MINI_GAME",
    "thumbnail": "/images/activities/click-frenzy.jpg",
    "difficulty": "EASY",
    "estimatedTime": "1 min",
    "points": 30,
    "playCount": 12840,
    "rating": 4.8,
    "active": true
  },
  {
    "id": "act_sudoku",
    "title": "Sudoku Master",
    "slug": "sudoku",
    "description": "Authentic 9x9 backtracking logic puzzle generator with unique solutions, pencil candidate notes, instant conflict highlighting, and 4 difficulty tiers.",
    "category": "GAME",
    "type": "MINI_GAME",
    "thumbnail": "/images/number-guess.png",
    "difficulty": "HARD",
    "estimatedTime": "5 min",
    "points": 45,
    "playCount": 8920,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "act_daily_word_guess",
    "title": "Daily Word Guess",
    "slug": "daily-word-guess",
    "description": "Wordle-style vocabulary deduction! Guess the hidden 5-letter word in 6 attempts with color feedback, streaks, and shareable result tiles.",
    "category": "GAME",
    "type": "MINI_GAME",
    "thumbnail": "/images/typing-sprint.png",
    "difficulty": "MEDIUM",
    "estimatedTime": "3 min",
    "points": 35,
    "playCount": 18450,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "act_hangman",
    "title": "Hangman Word Mystery",
    "slug": "hangman",
    "description": "Classic vocabulary deduction! Guess letters from categorized topics (Animals, Countries, Tech, Cinema) before the 6-stage gallows completes.",
    "category": "GAME",
    "type": "MINI_GAME",
    "thumbnail": "/images/activities/impossible-quiz.jpg",
    "difficulty": "MEDIUM",
    "estimatedTime": "2 min",
    "points": 30,
    "playCount": 7800,
    "rating": 4.7,
    "active": true
  },
  {
    "id": "act_general_knowledge_quiz",
    "title": "General Knowledge Arena",
    "slug": "general-knowledge-quiz",
    "description": "High-priority trivia showdown! Dynamic 10 and 15 question modes spanning science, geography, history, and culture with timed challenges.",
    "category": "QUIZ",
    "type": "TRIVIA",
    "thumbnail": "/images/activities/general-knowledge-blitz.jpg",
    "difficulty": "MEDIUM",
    "estimatedTime": "3 min",
    "points": 40,
    "playCount": 16500,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "act_flag_country_quiz",
    "title": "Flag & Country Quiz",
    "slug": "flag-country-quiz",
    "description": "Identify world flags and sovereign nations across dual challenge modes with capital city hints and streak multipliers.",
    "category": "QUIZ",
    "type": "TRIVIA",
    "thumbnail": "/images/activities/guess-the-country.png",
    "difficulty": "MEDIUM",
    "estimatedTime": "2 min",
    "points": 35,
    "playCount": 9400,
    "rating": 4.8,
    "active": true
  },
  {
    "id": "act_science_quiz",
    "title": "Science & Nature Quiz",
    "slug": "science-quiz",
    "description": "Explore the cosmos, quantum physics, chemical reactions, and biology with verified scientific explanations and score breakdowns.",
    "category": "QUIZ",
    "type": "TRIVIA",
    "thumbnail": "/images/activities/impossible-quiz.jpg",
    "difficulty": "HARD",
    "estimatedTime": "3 min",
    "points": 40,
    "playCount": 8200,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "act_guess_the_country",
    "title": "Guess the Country",
    "slug": "guess-the-country",
    "description": "Cartographic detective game! Recognize nations through territory SVG silhouettes, capital cities, monuments, and border clues.",
    "category": "QUIZ",
    "type": "GUESSING_GAME",
    "thumbnail": "/images/activities/guess-the-country.png",
    "difficulty": "HARD",
    "estimatedTime": "3 min",
    "points": 45,
    "playCount": 11300,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "act_true_or_false",
    "title": "True or False Fact Blitz",
    "slug": "true-or-false",
    "description": "Rapid-fire fact verification! Discriminate genuine scientific and historical truths from popular urban myths in Blitz and Survival modes.",
    "category": "QUIZ",
    "type": "FACT",
    "thumbnail": "/images/activities/reaction-test.jpg",
    "difficulty": "EASY",
    "estimatedTime": "2 min",
    "points": 30,
    "playCount": 14200,
    "rating": 4.8,
    "active": true
  },
  {
    "id": "cmuz561680004nei0ffnhej3d",
    "title": "How Fast Are Your Reflexes?",
    "slug": "reaction-test",
    "description": "Test your raw reaction speed in milliseconds when the color shifts. Can you beat the 200ms human reflex threshold?",
    "category": "GAME",
    "type": "REACTION_TEST",
    "thumbnail": "/images/activities/reaction-test.jpg",
    "difficulty": "MEDIUM",
    "estimatedTime": "1 min",
    "points": 25,
    "playCount": 14323,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "cmuz5616q0005nei0zs60bzp1",
    "title": "Can You Remember These Cards?",
    "slug": "memory-game",
    "description": "Flip cards, match pairs, and test your photographic memory! Progressive levels with up to 30 cards, local pass-and-play, and cross-device 2-device multiplayer.",
    "category": "GAME",
    "type": "MEMORY_GAME",
    "thumbnail": "/images/activities/memory-game.jpg",
    "difficulty": "MEDIUM",
    "estimatedTime": "2 min",
    "points": 30,
    "playCount": 9844,
    "rating": 4.8,
    "active": true
  },
  {
    "id": "cmuz561750006nei0o99ntli2",
    "title": "Guess the Secret Number",
    "slug": "number-guess",
    "description": "A mysterious number between 1 and 100 is chosen. Use hotter/colder hints to guess it in as few tries as possible.",
    "category": "GAME",
    "type": "GUESSING_GAME",
    "thumbnail": "/images/activities/number-guess.jpg",
    "difficulty": "EASY",
    "estimatedTime": "1 min",
    "points": 20,
    "playCount": 6513,
    "rating": 4.7,
    "active": true
  },
  {
    "id": "cmuz5617f0007nei01m0126vn",
    "title": "Speed Typing Sprint",
    "slug": "typing-test",
    "description": "Test your words-per-minute (WPM) and accuracy against dynamic entertainment quotes.",
    "category": "GAME",
    "type": "TYPING_TEST",
    "thumbnail": "/images/activities/typing-test.jpg",
    "difficulty": "HARD",
    "estimatedTime": "2 min",
    "points": 35,
    "playCount": 11201,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "cmuz5617r0008nei0szrhb0h4",
    "title": "Would You Rather? Impossible Choices",
    "slug": "would-you-rather",
    "description": "Face excruciating dilemmas and see how your moral compass stacks up against thousands of other players.",
    "category": "FUN",
    "type": "WOULD_YOU_RATHER",
    "thumbnail": "/images/activities/would-you-rather.jpg",
    "difficulty": "EASY",
    "estimatedTime": "2 min",
    "points": 15,
    "playCount": 22802,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "cmuz561850009nei0aa5sqi9k",
    "title": "Pixel Art Studio",
    "slug": "pixel-art",
    "description": "Unleash your creativity on an 8-bit retro canvas! Draw sprites, select vibrant palettes, and download your artwork.",
    "category": "CREATIVE",
    "type": "PIXEL_ART",
    "thumbnail": "/images/activities/pixel-art.png",
    "difficulty": "EASY",
    "estimatedTime": "4 min",
    "points": 40,
    "playCount": 5410,
    "rating": 4.8,
    "active": true
  },
  {
    "id": "cmuz5618k000anei09s565hg4",
    "title": "Lo-Fi Synth & Soundboard",
    "slug": "soundboard",
    "description": "Tap 16 interactive sound pads synthesized in real time via Web Audio API. Jam your own chill beats in seconds.",
    "category": "CREATIVE",
    "type": "SOUNDBOARD",
    "thumbnail": "/images/activities/soundboard.jpg",
    "difficulty": "EASY",
    "estimatedTime": "3 min",
    "points": 30,
    "playCount": 7897,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "cmuz5618w000bnei0q95voq7k",
    "title": "Shower Thoughts & Mindblown Facts",
    "slug": "shower-thoughts",
    "description": "Explore paradoxical thoughts and bizarre facts that will genuinely alter how you look at the universe today.",
    "category": "RANDOM",
    "type": "FACT",
    "thumbnail": "/images/activities/shower-thoughts.jpg",
    "difficulty": "EASY",
    "estimatedTime": "1 min",
    "points": 15,
    "playCount": 16400,
    "rating": 4.7,
    "active": true
  },
  {
    "id": "cmuz5619a000cnei0jqbczxdi",
    "title": "Dad Joke & Pun Generator",
    "slug": "dad-jokes",
    "description": "Groan-inducing dad jokes, witty tech one-liners, and laugh buttons designed to cure boredom instantly.",
    "category": "FUN",
    "type": "JOKE_GEN",
    "thumbnail": "/images/activities/dad-jokes.jpg",
    "difficulty": "EASY",
    "estimatedTime": "1 min",
    "points": 15,
    "playCount": 8922,
    "rating": 4.6,
    "active": true
  },
  {
    "id": "cmuz5619l000dnei06bdms99o",
    "title": "What Type of Bored Soul Are You?",
    "slug": "personality-archetype",
    "description": "A fast 5-question psychological archetype test. Are you the Chaos Gremlin, the Brainiac, or the Chill Sloth?",
    "category": "QUIZ",
    "type": "PERSONALITY_TEST",
    "thumbnail": "/images/activities/personality-archetype.jpg",
    "difficulty": "EASY",
    "estimatedTime": "2 min",
    "points": 40,
    "playCount": 13500,
    "rating": 4.8,
    "active": true
  },
  {
    "id": "cmuz5619v000enei0bav36oux",
    "title": "The 10-Second Click Frenzy",
    "slug": "click-frenzy",
    "description": "How many times can you click in exactly 10 seconds? Test your jitter click and CPS (clicks per second).",
    "category": "GAME",
    "type": "MINI_GAME",
    "thumbnail": "/images/activities/click-frenzy.jpg",
    "difficulty": "EASY",
    "estimatedTime": "10 sec",
    "points": 20,
    "playCount": 18706,
    "rating": 4.8,
    "active": true
  },
  {
    "id": "cmuz561a2000fnei0kwanff1t",
    "title": "Bizarre Dilemmas & Random Wheel",
    "slug": "random-wheel",
    "description": "Spin the digital wheel of spontaneous challenges. Sing a song in reverse, do 10 pushups, or text your best friend a duck emoji.",
    "category": "RANDOM",
    "type": "RANDOM_GENERATOR",
    "thumbnail": "/images/activities/random-wheel.jpg",
    "difficulty": "MEDIUM",
    "estimatedTime": "2 min",
    "points": 25,
    "playCount": 4203,
    "rating": 4.5,
    "active": true
  },
  {
    "id": "cmuz561ab000gnei0yqk28mnj",
    "title": "Quick General Knowledge Blitz",
    "slug": "general-knowledge-blitz",
    "description": "10 rapid-fire questions covering geography, history, pop culture, and science. Beat the countdown!",
    "category": "QUIZ",
    "type": "TRIVIA",
    "thumbnail": "/images/activities/general-knowledge-blitz.jpg",
    "difficulty": "MEDIUM",
    "estimatedTime": "3 min",
    "points": 50,
    "playCount": 12900,
    "rating": 4.9,
    "active": true
  },
  {
    "id": "cmuz561ai000hnei0y6xsfi4y",
    "title": "The Impossible Logic Quiz",
    "slug": "impossible-quiz",
    "description": "Riddles that seem obvious until they twist your brain in knots. Only 4% of players get a perfect 10/10.",
    "category": "QUIZ",
    "type": "TRIVIA",
    "thumbnail": "/images/activities/impossible-quiz.jpg",
    "difficulty": "HARD",
    "estimatedTime": "4 min",
    "points": 60,
    "playCount": 15300,
    "rating": 4.8,
    "active": true
  },
  {
    "id": "cmuz561ap000inei0qmbh0zes",
    "title": "Guess the Country Flag & Capital",
    "slug": "guess-the-country",
    "description": "Can you recognize the world's most unique flags and tricky capitals under time pressure?",
    "category": "QUIZ",
    "type": "TRIVIA",
    "thumbnail": "/images/activities/guess-the-country.png",
    "difficulty": "MEDIUM",
    "estimatedTime": "3 min",
    "points": 45,
    "playCount": 8200,
    "rating": 4.7,
    "active": true
  },
  {
    "id": "cmuz561ax000jnei0umwgv97w",
    "title": "Ultimate 90s & 2000s Nostalgia Quiz",
    "slug": "nostalgia-quiz",
    "description": "Dial-up sounds, Tamagotchis, cartoons, and millennium hits. How sharp is your retro memory?",
    "category": "QUIZ",
    "type": "TRIVIA",
    "thumbnail": "/images/activities/nostalgia-quiz.jpg",
    "difficulty": "EASY",
    "estimatedTime": "3 min",
    "points": 35,
    "playCount": 7100,
    "rating": 4.8,
    "active": true
  },
  {
    "id": "cmuzdqi6l0000d8i02m60cuyk",
    "title": "Connect 4 Battles",
    "slug": "connect-4",
    "description": "Drop discs into 7 columns and connect 4 in a line! Play solo vs smart AI, pass-and-play on same device, or live multiplayer from 2 different devices.",
    "category": "GAME",
    "type": "MINI_GAME",
    "thumbnail": "/images/activities/connect-4.png",
    "difficulty": "MEDIUM",
    "estimatedTime": "2 min",
    "points": 40,
    "playCount": 14202,
    "rating": 4.9,
    "active": true
  }
];

const quizzesData = [
  {
    "id": "quiz_gen_knowledge",
    "title": "General Knowledge Arena",
    "slug": "general-knowledge-quiz",
    "description": "Multi-category trivia arena covering science, history, geography, tech, and culture with timed challenges.",
    "category": "TRIVIA",
    "difficulty": "MEDIUM",
    "timeLimit": 15,
    "thumbnail": "🌍",
    "questions": [
      {
        "id": "q_gk_1",
        "question": "What is the largest living species of lizard on Earth?",
        "optionsJson": "[\"Komodo Dragon\",\"Gila Monster\",\"Perentie\",\"Saltwater Monitor\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "The Komodo dragon can grow up to 3 meters (10 feet) in length and weigh over 70 kg."
      },
      {
        "id": "q_gk_2",
        "question": "Which country gifted the Statue of Liberty to the United States?",
        "optionsJson": "[\"United Kingdom\",\"France\",\"Spain\",\"Italy\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "France gifted the Statue of Liberty in 1886 as a symbol of Franco-American alliance and friendship."
      },
      {
        "id": "q_gk_3",
        "question": "How many bones are there in an adult human body?",
        "optionsJson": "[\"186\",\"206\",\"216\",\"226\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Adult humans typically have 206 bones, down from around 270 at birth due to bone fusion."
      },
      {
        "id": "q_gk_4",
        "question": "What is the deepest known location in the world's oceans?",
        "optionsJson": "[\"Puerto Rico Trench\",\"Java Trench\",\"Mariana Trench (Challenger Deep)\",\"Tonga Trench\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Challenger Deep in the Mariana Trench plunges to approximately 10,928 meters (35,853 feet)."
      },
      {
        "id": "q_gk_5",
        "question": "Who was the first woman to win a Nobel Prize?",
        "optionsJson": "[\"Marie Curie\",\"Rosalind Franklin\",\"Ada Lovelace\",\"Mother Teresa\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Marie Curie won the Nobel Prize in Physics in 1903 and later Chemistry in 1911."
      }
    ]
  },
  {
    "id": "quiz_flag_country",
    "title": "Flag & Country Quiz",
    "slug": "flag-country-quiz",
    "description": "Identify sovereign flags and capital cities across the globe.",
    "category": "GEOGRAPHY",
    "difficulty": "MEDIUM",
    "timeLimit": 15,
    "thumbnail": "🚩",
    "questions": [
      {
        "id": "q_flag_1",
        "question": "Which country has the only non-rectangular national flag in the world?",
        "optionsJson": "[\"Switzerland\",\"Vatican City\",\"Nepal\",\"Bhutan\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Nepal's flag is formed by two stacked triangular pennants."
      },
      {
        "id": "q_flag_2",
        "question": "Which country features a maple leaf prominently on its national flag?",
        "optionsJson": "[\"Canada\",\"Lebanon\",\"New Zealand\",\"Cyprus\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Canada adopted the iconic 11-pointed red maple leaf flag in 1965."
      },
      {
        "id": "q_flag_3",
        "question": "Which country's flag features a yellow sun with 32 rays surrounded by a steppe eagle?",
        "optionsJson": "[\"Mongolia\",\"Kazakhstan\",\"Kyrgyzstan\",\"Uzbekistan\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Kazakhstan's sky-blue flag features a golden steppe eagle soaring beneath a 32-ray sun."
      }
    ]
  },
  {
    "id": "quiz_science_nature",
    "title": "Science & Nature Quiz",
    "slug": "science-quiz",
    "description": "Explore the frontiers of physics, chemistry, astronomy, and evolutionary biology.",
    "category": "SCIENCE",
    "difficulty": "HARD",
    "timeLimit": 20,
    "thumbnail": "🔬",
    "questions": [
      {
        "id": "q_sci_1",
        "question": "What is the speed of light in a vacuum?",
        "optionsJson": "[\"299,792 km/s\",\"150,000 km/s\",\"450,000 km/s\",\"199,792 km/s\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Light travels at precisely 299,792,458 meters per second in a vacuum."
      },
      {
        "id": "q_sci_2",
        "question": "Which organelle is universally referred to as the powerhouse of the eukaryotic cell?",
        "optionsJson": "[\"Nucleus\",\"Ribosome\",\"Mitochondria\",\"Golgi apparatus\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Mitochondria generate most of the chemical energy needed by cell biochemical reactions (ATP)."
      },
      {
        "id": "q_sci_3",
        "question": "What is the primary gas composing the atmosphere of Venus?",
        "optionsJson": "[\"Nitrogen\",\"Carbon Dioxide\",\"Methane\",\"Oxygen\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Venus's dense atmosphere is roughly 96.5% carbon dioxide, triggering extreme greenhouse warming."
      }
    ]
  },
  {
    "id": "quiz_true_false",
    "title": "True or False Fact Blitz",
    "slug": "true-or-false",
    "description": "Test your ability to discriminate verified scientific and historical facts from popular urban myths.",
    "category": "TRIVIA",
    "difficulty": "EASY",
    "timeLimit": 15,
    "thumbnail": "⚡",
    "questions": [
      {
        "id": "q_tf_1",
        "question": "Bananas are botanically classified as berries, while strawberries are not.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "True: Botanically, berries develop from a flower with a single ovary. Strawberries are aggregate fruits."
      },
      {
        "id": "q_tf_2",
        "question": "The Great Wall of China is easily visible from low Earth orbit with the naked human eye.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "False: Astronauts verify the Great Wall cannot be distinguished without high-magnification optical lenses."
      },
      {
        "id": "q_tf_3",
        "question": "Octopuses have three hearts and blue copper-based blood.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "True: Two hearts pump blood to the gills, one to the body, and their blood uses copper-based hemocyanin."
      }
    ]
  },
  {
    "id": "cmuz561cl000knei0vamw9wb9",
    "title": "Quick General Knowledge Blitz",
    "slug": "general-knowledge-blitz",
    "description": "10 rapid-fire questions to test your general worldly knowledge against the clock.",
    "category": "TRIVIA",
    "difficulty": "MEDIUM",
    "timeLimit": 15,
    "thumbnail": "🧠",
    "questions": [
      {
        "id": "cmuz561cp000lnei0bkwg4xek",
        "question": "Which planet in our solar system has the most moons?",
        "optionsJson": "[\"Jupiter\",\"Saturn\",\"Uranus\",\"Neptune\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Saturn holds the official record with 146 confirmed moons, edging out Jupiter."
      },
      {
        "id": "cmuz561cp000mnei0so41geb3",
        "question": "What is the only mammal capable of true sustained flight?",
        "optionsJson": "[\"Flying Squirrel\",\"Bat\",\"Sugar Glider\",\"Colugo\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Bats are the only mammals with the physiological ability for true sustained flight."
      },
      {
        "id": "cmuz561cp000nnei0dgw0j4t8",
        "question": "What is the chemical symbol for Gold?",
        "optionsJson": "[\"Go\",\"Gd\",\"Au\",\"Ag\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Au comes from the Latin word 'Aurum', meaning shining dawn."
      },
      {
        "id": "cmuz561cp000onei0wzlxuhuk",
        "question": "Which country has the longest coastline in the world?",
        "optionsJson": "[\"Russia\",\"Australia\",\"Canada\",\"Chile\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Canada's coastline stretches over 202,080 km, making it the longest on Earth."
      },
      {
        "id": "cmuz561cp000pnei07wyjzucf",
        "question": "In what year was the first iPhone released?",
        "optionsJson": "[\"2005\",\"2007\",\"2008\",\"2010\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Steve Jobs unveiled the original iPhone on January 9, 2007."
      },
      {
        "id": "cmuz561cp000qnei0d1t92lpm",
        "question": "What is the hardest natural substance known on Earth?",
        "optionsJson": "[\"Titanium\",\"Diamond\",\"Graphene\",\"Tungsten\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Diamond scores a 10 on the Mohs hardness scale."
      },
      {
        "id": "cmuz561cp000rnei0g8tqsiir",
        "question": "How many bones are in the adult human body?",
        "optionsJson": "[\"186\",\"206\",\"216\",\"226\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Adult humans have 206 bones after several infant bones fuse together."
      },
      {
        "id": "cmuzd21ph0000qfi0015wkl9l",
        "question": "Which sea is considered the saltiest water body in the world?",
        "optionsJson": "[\"Dead Sea\",\"Red Sea\",\"Baltic Sea\",\"Mediterranean Sea\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "The Dead Sea is nearly 10 times saltier than the ocean, making it so buoyant people easily float."
      },
      {
        "id": "cmuzd21qd0001qfi0qpl2wh0s",
        "question": "What is the capital of Australia?",
        "optionsJson": "[\"Sydney\",\"Melbourne\",\"Canberra\",\"Brisbane\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Canberra was chosen as the compromise capital between rivals Sydney and Melbourne in 1908."
      },
      {
        "id": "cmuzd21ql0002qfi0pyu3aj5z",
        "question": "How many hearts does an octopus have?",
        "optionsJson": "[\"1\",\"2\",\"3\",\"4\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Octopuses have 3 hearts: two pump blood to the gills and one pumps blood to the rest of the body."
      },
      {
        "id": "cmuzd21qt0003qfi0qyvhlo0s",
        "question": "What is the brightest star in the night sky?",
        "optionsJson": "[\"North Star (Polaris)\",\"Sirius\",\"Betelgeuse\",\"Vega\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Sirius (the Dog Star) is the brightest star in Earth's night sky."
      },
      {
        "id": "cmuzd21r20004qfi05y0xxt5p",
        "question": "Which element has the atomic number 1?",
        "optionsJson": "[\"Helium\",\"Oxygen\",\"Hydrogen\",\"Carbon\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Hydrogen has 1 proton, giving it atomic number 1."
      },
      {
        "id": "cmuzd21ra0005qfi0rdv6s9qh",
        "question": "In what year did the Titanic sink in the North Atlantic Ocean?",
        "optionsJson": "[\"1905\",\"1912\",\"1918\",\"1923\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "The Titanic sank on the night of April 14–15, 1912 on its maiden voyage."
      },
      {
        "id": "cmuzd21rj0006qfi01gwf6unn",
        "question": "What is the largest internal organ in the human body?",
        "optionsJson": "[\"Heart\",\"Brain\",\"Liver\",\"Lungs\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "The liver is the heaviest and largest internal organ, weighing about 1.5 kg."
      },
      {
        "id": "cmuzd21rs0007qfi0pyeyz2ae",
        "question": "What currency is officially used in Japan?",
        "optionsJson": "[\"Won\",\"Yen\",\"Yuan\",\"Ringgit\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "The Japanese Yen (JPY) is the third most traded currency in the world."
      },
      {
        "id": "cmuzd21sa0008qfi0wtdjc8u8",
        "question": "Who painted the famous masterpiece 'The Starry Night'?",
        "optionsJson": "[\"Pablo Picasso\",\"Vincent van Gogh\",\"Claude Monet\",\"Salvador Dalí\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Vincent van Gogh painted The Starry Night in June 1889 from his asylum room in Saint-Rémy."
      },
      {
        "id": "cmuzd21so0009qfi0c8tgveh3",
        "question": "What is the tallest mountain in the world when measured base to peak?",
        "optionsJson": "[\"Mount Everest\",\"Mauna Kea\",\"K2\",\"Kilimanjaro\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Mauna Kea in Hawaii is over 10,210 meters tall from its underwater oceanic base."
      }
    ]
  },
  {
    "id": "cmuz561dp000snei0slr77z1q",
    "title": "The Impossible Logic Quiz",
    "slug": "impossible-quiz",
    "description": "Mind-bending logic riddles where nothing is as straightforward as it seems.",
    "category": "TRIVIA",
    "difficulty": "HARD",
    "timeLimit": 20,
    "thumbnail": "🤯",
    "questions": [
      {
        "id": "cmuz561ds000tnei04p6v1qu8",
        "question": "If you overtake the person in second place in a race, what place are you in?",
        "optionsJson": "[\"First\",\"Second\",\"Third\",\"Last\"]",
        "correctAnswer": 1,
        "points": 15,
        "explanation": "You take their spot, which means you are now in second place!"
      },
      {
        "id": "cmuz561ds000unei0flzne51w",
        "question": "A cowboy rides into town on Friday, stays for three days, and leaves on Friday. How?",
        "optionsJson": "[\"Time travel\",\"His horse is named Friday\",\"It was a leap year\",\"He took a detour\"]",
        "correctAnswer": 1,
        "points": 15,
        "explanation": "The horse's name is Friday!"
      },
      {
        "id": "cmuz561ds000vnei0xi9kb61s",
        "question": "What has keys but no locks, space but no room, and you can enter but can't go inside?",
        "optionsJson": "[\"A piano\",\"A keyboard\",\"A map\",\"A prison\"]",
        "correctAnswer": 1,
        "points": 15,
        "explanation": "A computer keyboard has keys, spacebar, and an enter key."
      },
      {
        "id": "cmuz561ds000wnei0chxrtzw6",
        "question": "How many months have 28 days?",
        "optionsJson": "[\"1\",\"6\",\"11\",\"All 12\"]",
        "correctAnswer": 3,
        "points": 15,
        "explanation": "All 12 months have at least 28 days!"
      },
      {
        "id": "cmuz561ds000xnei0ect2b6cx",
        "question": "What can travel around the world while staying in a corner?",
        "optionsJson": "[\"A postage stamp\",\"An airplane\",\"A satellite\",\"A compass\"]",
        "correctAnswer": 0,
        "points": 15,
        "explanation": "A postage stamp stays tucked in the corner of an envelope."
      },
      {
        "id": "cmuz561ds000ynei0spah1ojk",
        "question": "I have branches, but no fruit, trunk or leaves. What am I?",
        "optionsJson": "[\"A bank\",\"A river\",\"A family tree\",\"A railway\"]",
        "correctAnswer": 0,
        "points": 15,
        "explanation": "A bank has branch locations across cities."
      },
      {
        "id": "cmuz561ds000znei0m5goy3az",
        "question": "What gets wetter the more it dries?",
        "optionsJson": "[\"A sponge\",\"A towel\",\"A cloud\",\"Ice\"]",
        "correctAnswer": 1,
        "points": 15,
        "explanation": "A towel absorbs moisture while drying other things."
      },
      {
        "id": "cmuzd21sz000aqfi07xite6qm",
        "question": "What comes once in a minute, twice in a moment, but never in a thousand years?",
        "optionsJson": "[\"A blink\",\"The letter 'M'\",\"A shadow\",\"A second\"]",
        "correctAnswer": 1,
        "points": 15,
        "explanation": "The letter 'M' appears once in 'minute', twice in 'moment', and zero times in 'thousand years'."
      },
      {
        "id": "cmuzd21t5000bqfi0yg0wenfv",
        "question": "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        "optionsJson": "[\"An echo\",\"A kite\",\"A whisper\",\"A cloud\"]",
        "correctAnswer": 0,
        "points": 15,
        "explanation": "An echo responds without vocal cords and carries through the air."
      },
      {
        "id": "cmuzd21tc000cqfi0fo5kdhp3",
        "question": "A clerk in a butcher shop is 5 feet 10 inches tall and wears size 11 shoes. What does he weigh?",
        "optionsJson": "[\"175 lbs\",\"Meat\",\"210 lbs\",\"Feathers\"]",
        "correctAnswer": 1,
        "points": 15,
        "explanation": "He's a butcher, so he weighs meat!"
      },
      {
        "id": "cmuzd21ti000dqfi0qyxbj6gq",
        "question": "Forward I am heavy, but backward I am not. What am I?",
        "optionsJson": "[\"A ton\",\"A lead weight\",\"The word 'not'\",\"The word 'ton'\"]",
        "correctAnswer": 3,
        "points": 15,
        "explanation": "The word 'ton' spelled backward is 'not'!"
      },
      {
        "id": "cmuzd21tp000eqfi09xwvpn8w",
        "question": "What has a head and a tail, but no body?",
        "optionsJson": "[\"A coin\",\"A snake\",\"A comet\",\"A needle\"]",
        "correctAnswer": 0,
        "points": 15,
        "explanation": "A coin has a heads side and a tails side, but no torso or legs."
      },
      {
        "id": "cmuzd21tx000fqfi0mekpw2as",
        "question": "What can you break, even if you never pick it up or touch it?",
        "optionsJson": "[\"Glass\",\"A promise\",\"Silence\",\"A mirror\"]",
        "correctAnswer": 1,
        "points": 15,
        "explanation": "You can break a promise (or a vow) without physically touching anything."
      },
      {
        "id": "cmuzd21u3000gqfi09dxmvqqx",
        "question": "If there are three apples and you take away two, how many apples do you have?",
        "optionsJson": "[\"One\",\"Two\",\"Three\",\"Zero\"]",
        "correctAnswer": 1,
        "points": 15,
        "explanation": "You took two apples, so you have two apples!"
      },
      {
        "id": "cmuzd21ua000hqfi0bkh9oq5m",
        "question": "What five-letter word becomes shorter when you add two letters to it?",
        "optionsJson": "[\"Small\",\"Brief\",\"Short\",\"Quick\"]",
        "correctAnswer": 2,
        "points": 15,
        "explanation": "The word 'short' becomes 'shorter' (+er)."
      },
      {
        "id": "cmuzd21ug000iqfi04c6ntpsw",
        "question": "Which weighs more: a pound of feathers or a pound of gold?",
        "optionsJson": "[\"A pound of feathers\",\"A pound of gold\",\"They weigh the exact same\",\"It depends on altitude\"]",
        "correctAnswer": 0,
        "points": 15,
        "explanation": "Feathers are weighed in avoirdupois pounds (453.6 g), while gold uses troy pounds (373.2 g)! Feathers are heavier!"
      }
    ]
  },
  {
    "id": "cmuz561ee0010nei051d2peea",
    "title": "Guess the Country Flag & Capital",
    "slug": "guess-the-country",
    "description": "Test your geographic prowess across world capitals and iconic nations.",
    "category": "TRIVIA",
    "difficulty": "MEDIUM",
    "timeLimit": 15,
    "thumbnail": "🌍",
    "questions": [
      {
        "id": "cmuz561eg0011nei0vn95u6ly",
        "question": "What is the capital city of Australia?",
        "optionsJson": "[\"Sydney\",\"Melbourne\",\"Canberra\",\"Brisbane\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Canberra was chosen as a compromise between rival cities Sydney and Melbourne in 1908."
      },
      {
        "id": "cmuz561eg0012nei0habx95sx",
        "question": "Which country's flag is the only national flag that is NOT rectangular or square?",
        "optionsJson": "[\"Switzerland\",\"Nepal\",\"Bhutan\",\"Monaco\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Nepal's flag is formed by two pennants (triangular shapes) stacked on top of each other."
      },
      {
        "id": "cmuz561eg0013nei08yd9ohcn",
        "question": "What is the capital of Canada?",
        "optionsJson": "[\"Toronto\",\"Vancouver\",\"Montreal\",\"Ottawa\"]",
        "correctAnswer": 3,
        "points": 10,
        "explanation": "Ottawa is the political capital of Canada, located in Ontario."
      },
      {
        "id": "cmuz561eg0014nei0uoko8acx",
        "question": "Which country features a cedar tree in the center of its national flag?",
        "optionsJson": "[\"Lebanon\",\"Cyprus\",\"Greece\",\"Jordan\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "The green cedar tree has been the historical emblem of Lebanon for centuries."
      },
      {
        "id": "cmuz561eg0015nei0nteustw9",
        "question": "What is the capital of Japan?",
        "optionsJson": "[\"Kyoto\",\"Osaka\",\"Tokyo\",\"Hiroshima\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Tokyo has been the capital and seat of the Emperor since 1868."
      },
      {
        "id": "cmuz561eg0016nei0c4bvz1v0",
        "question": "Which African country was formerly known as Abyssinia?",
        "optionsJson": "[\"Ethiopia\",\"Sudan\",\"Kenya\",\"Nigeria\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Ethiopia was historically referred to by Europeans as Abyssinia."
      },
      {
        "id": "cmuz561eg0017nei09l7ryah1",
        "question": "What is the capital of Brazil?",
        "optionsJson": "[\"Rio de Janeiro\",\"São Paulo\",\"Brasília\",\"Salvador\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Brasília was inaugurated in 1960 as a planned capital city."
      },
      {
        "id": "cmuzd21us000jqfi0efyqukg1",
        "question": "Which country's flag features a red maple leaf at its center?",
        "optionsJson": "[\"Canada\",\"Norway\",\"Denmark\",\"Lebanon\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Canada adopted the iconic 11-pointed red maple leaf flag in 1965."
      },
      {
        "id": "cmuzd21uy000kqfi0trrv8j9t",
        "question": "Which country is home to the ancient Incan citadel of Machu Picchu?",
        "optionsJson": "[\"Bolivia\",\"Peru\",\"Chile\",\"Ecuador\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Machu Picchu is situated high in the Andes mountains in southern Peru."
      },
      {
        "id": "cmuzd21v6000lqfi0mbk3jzca",
        "question": "Which nation's national flag is the only one in the world that is non-quadrilateral (double-pennant)?",
        "optionsJson": "[\"Bhutan\",\"Nepal\",\"Switzerland\",\"Vatican City\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Nepal's flag is the only non-rectangular national flag in the world."
      },
      {
        "id": "cmuzd21ve000mqfi0r0kv3tzy",
        "question": "What is the capital of Iceland?",
        "optionsJson": "[\"Oslo\",\"Reykjavík\",\"Helsinki\",\"Bergen\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Reykjavík is the northernmost capital of a sovereign state in the world."
      },
      {
        "id": "cmuzd21vl000nqfi0caoidfeu",
        "question": "Which country has the most natural lakes in the world?",
        "optionsJson": "[\"Finland\",\"Russia\",\"Canada\",\"Sweden\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Canada contains over 879,000 lakes, more than all other countries combined."
      },
      {
        "id": "cmuzd21vt000oqfi0x346zcho",
        "question": "What is the capital city of Kenya?",
        "optionsJson": "[\"Mombasa\",\"Nairobi\",\"Kampala\",\"Addis Ababa\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Nairobi is known as the 'Green City in the Sun'."
      },
      {
        "id": "cmuzd21wo000pqfi02moukdvl",
        "question": "Which country consists of over 17,000 tropical islands, making it the world's largest archipelagic state?",
        "optionsJson": "[\"Philippines\",\"Indonesia\",\"Maldives\",\"Fiji\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Indonesia spans over 17,508 islands across Southeast Asia and Oceania."
      }
    ]
  },
  {
    "id": "cmuz561fa0018nei0y8mt12ph",
    "title": "Ultimate 90s & 2000s Nostalgia Quiz",
    "slug": "nostalgia-quiz",
    "description": "How well do you remember the golden era of cartoon networks, dial-up, and pop culture?",
    "category": "TRIVIA",
    "difficulty": "EASY",
    "timeLimit": 15,
    "thumbnail": "📼",
    "questions": [
      {
        "id": "cmuz561fc0019nei0jp7m58pa",
        "question": "What virtual digital pet on a keychain had 90s kids panicking to feed it daily?",
        "optionsJson": "[\"Tamagotchi\",\"Furby\",\"Digimon\",\"Neopet\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Tamagotchi was released by Bandai in 1996 and sold over 82 million units worldwide."
      },
      {
        "id": "cmuz561fc001anei0f29170en",
        "question": "Which company released the iconic Windows 95 operating system?",
        "optionsJson": "[\"Apple\",\"IBM\",\"Microsoft\",\"Intel\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Microsoft launched Windows 95 with an epic marketing campaign featuring the Rolling Stones."
      },
      {
        "id": "cmuz561fc001bnei04f8uphqv",
        "question": "What was the name of the social network with custom HTML music profiles founded by Tom?",
        "optionsJson": "[\"Friendster\",\"MySpace\",\"Hi5\",\"Orkut\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Everyone had Tom as their first friend on MySpace in the 2000s."
      },
      {
        "id": "cmuz561fc001cnei0ojcai4da",
        "question": "Which band sang the smash 1999 hit 'All Star' featured in Shrek?",
        "optionsJson": "[\"Smash Mouth\",\"Blink-182\",\"Green Day\",\"Sugar Ray\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Smash Mouth's 'All Star' became a legendary pop culture and meme anthem."
      },
      {
        "id": "cmuz561fc001dnei06aytgemn",
        "question": "What was the original release year of the Nintendo Game Boy?",
        "optionsJson": "[\"1989\",\"1993\",\"1995\",\"1998\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "The original gray monochrome Game Boy was released in 1989."
      },
      {
        "id": "cmuz561fc001enei00jxjcicr",
        "question": "In The Matrix (1999), which color pill does Neo swallow to learn the truth?",
        "optionsJson": "[\"Blue\",\"Red\",\"Green\",\"Yellow\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Neo takes the red pill to see how deep the rabbit hole goes."
      },
      {
        "id": "cmuzd21wx000qqfi0jzfak8xh",
        "question": "Which handheld virtual pet toy took the late 90s by storm with feeding and cleaning mini-beeps?",
        "optionsJson": "[\"Furby\",\"Tamagotchi\",\"Giga Pet\",\"Poo-Chi\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Bandai launched Tamagotchi in 1996, selling over 80 million units worldwide."
      },
      {
        "id": "cmuzd21x3000rqfi060ipgvgc",
        "question": "What sound greeted dial-up internet users trying to connect in the 1990s?",
        "optionsJson": "[\"Bleep-screech dial modem handshake\",\"A loud fog horn\",\"A ticking analog clock\",\"A whistle chime\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "The iconic 56k screech-and-static handshake negotiated analog audio carrier frequencies."
      },
      {
        "id": "cmuzd21x9000sqfi0p7tlamo4",
        "question": "Which instant messaging application made the famous 'Uh-oh!' audio alert sound?",
        "optionsJson": "[\"AIM (AOL Instant Messenger)\",\"ICQ\",\"MSN Messenger\",\"Yahoo! Messenger\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "ICQ featured the world-famous 'Uh-oh!' sound whenever a message arrived."
      },
      {
        "id": "cmuzd21xg000tqfi095z0y6yt",
        "question": "What was the default background wallpaper called in Microsoft Windows XP?",
        "optionsJson": "[\"Serenity\",\"Bliss\",\"Autumn Calm\",\"Azure Vista\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "'Bliss' is an unedited photograph of Sonoma County green hills taken by Charles O'Rear in 1996."
      },
      {
        "id": "cmuzd21xm000uqfi0b7p8i19h",
        "question": "Which handheld Nintendo console was released in 1989 and bundled with Tetris?",
        "optionsJson": "[\"Game & Watch\",\"Game Boy\",\"Game Boy Color\",\"Virtual Boy\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "The monochrome Game Boy revolutionized portable gaming with Tetris."
      },
      {
        "id": "cmuzd21xr000vqfi0ppqc3h2o",
        "question": "What video rental giant dominated Friday nights before Netflix and streaming took over?",
        "optionsJson": "[\"Blockbuster Video\",\"Hollywood Video\",\"Family Video\",\"Redbox\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Blockbuster had over 9,000 stores at its peak with the motto 'Be Kind, Rewind'."
      },
      {
        "id": "cmuzd21xz000wqfi0ywxegyzh",
        "question": "What was the name of the animated paperclip assistant in Microsoft Office 97 to 2003?",
        "optionsJson": "[\"Pinny\",\"Clippy\",\"Helper Bob\",\"Office Pal\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Clippy (Clippit) popped up with 'It looks like you're writing a letter!'"
      }
    ]
  },
  {
    "id": "cmuz561fp001fnei0dqj51wwe",
    "title": "Science & Nature Wonders",
    "slug": "science-wonders",
    "description": "Explore the fascinating mysteries of biology, cosmos, and physics.",
    "category": "TRIVIA",
    "difficulty": "MEDIUM",
    "timeLimit": 15,
    "thumbnail": "🧬",
    "questions": [
      {
        "id": "cmuz561fr001gnei0gurjtqph",
        "question": "What is the speed of light in a vacuum approximately?",
        "optionsJson": "[\"300,000 km/s\",\"150,000 km/s\",\"500,000 km/s\",\"1,000,000 km/s\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Light travels at roughly 299,792 kilometers per second in a vacuum."
      },
      {
        "id": "cmuz561fr001hnei04ntjkorg",
        "question": "Which blood type is known as the universal donor for red blood cells?",
        "optionsJson": "[\"A Positive\",\"AB Negative\",\"O Negative\",\"B Positive\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "O Negative red blood cells lack A, B, and Rh antigens, making them safe for almost any recipient."
      },
      {
        "id": "cmuz561fr001inei0e7yo25tq",
        "question": "How long does light from the Sun take to reach Earth?",
        "optionsJson": "[\"About 8 minutes\",\"About 8 seconds\",\"About 1 hour\",\"Instantaneous\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Sunlight takes approximately 8 minutes and 20 seconds to travel 93 million miles."
      },
      {
        "id": "cmuz561fr001jnei0gwws1sua",
        "question": "What organelle is known as the 'powerhouse of the cell'?",
        "optionsJson": "[\"Nucleus\",\"Ribosome\",\"Mitochondria\",\"Golgi apparatus\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Mitochondria generate most of the chemical energy needed by cells in the form of ATP."
      },
      {
        "id": "cmuz561fr001knei026zq2x8m",
        "question": "What is the largest living species of lizard?",
        "optionsJson": "[\"Gila Monster\",\"Komodo Dragon\",\"Monitor Lizard\",\"Iguana\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Komodo dragons can grow up to 3 meters (10 ft) in length and weigh over 70 kg."
      },
      {
        "id": "cmuz561fr001lnei05p20d7gv",
        "question": "What percentage of the Earth's surface is covered by water?",
        "optionsJson": "[\"51%\",\"61%\",\"71%\",\"81%\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "About 71% of Earth's surface is water-covered, with oceans holding 96.5% of it."
      },
      {
        "id": "cmuzd21y8000xqfi0oq3nenvg",
        "question": "What is the powerhouse organelle of the eukaryotic cell?",
        "optionsJson": "[\"Nucleus\",\"Ribosome\",\"Mitochondria\",\"Golgi apparatus\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Mitochondria generate most of the chemical energy needed by the cell (ATP)."
      },
      {
        "id": "cmuzd21yf000yqfi0a7q1lukp",
        "question": "What is the only letter that does NOT appear on the periodic table of elements?",
        "optionsJson": "[\"Q\",\"J\",\"X\",\"Z\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "The letter 'J' does not appear in any chemical element symbol on the periodic table."
      },
      {
        "id": "cmuzd21yo000zqfi07stuoogx",
        "question": "Which gas makes up roughly 78% of Earth's atmosphere?",
        "optionsJson": "[\"Oxygen\",\"Nitrogen\",\"Carbon Dioxide\",\"Argon\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Nitrogen makes up ~78%, oxygen is ~21%, and argon is ~0.93%."
      },
      {
        "id": "cmuzd21yv0010qfi0io3gm5st",
        "question": "What phenomenon happens when a massive star collapses under its own gravity at the end of its life?",
        "optionsJson": "[\"Black hole or Neutron Star\",\"Comet explosion\",\"Solar eclipse\",\"Nebular freeze\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "A supernova core collapse forms either an ultra-dense neutron star or a black hole singularity."
      },
      {
        "id": "cmuzd21z10011qfi0kurrdpoc",
        "question": "At what temperature are Fahrenheit and Celsius equal to each other?",
        "optionsJson": "[\"0 degrees\",\"-40 degrees\",\"32 degrees\",\"-100 degrees\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "-40°C equals -40°F (-40 × 9/5 + 32 = -72 + 32 = -40)."
      }
    ]
  },
  {
    "id": "cmuz561g5001mnei07kpaw72k",
    "title": "Cinematic Movie Buff Challenge",
    "slug": "movie-buff",
    "description": "Think you know your Oscars, cult classics, and blockbuster franchises?",
    "category": "TRIVIA",
    "difficulty": "MEDIUM",
    "timeLimit": 15,
    "thumbnail": "🎬",
    "questions": [
      {
        "id": "cmuz561g7001nnei0mg0xgqjw",
        "question": "Which movie won the first-ever Academy Award for Best Animated Feature in 2002?",
        "optionsJson": "[\"Monsters, Inc.\",\"Shrek\",\"Jimmy Neutron\",\"Ice Age\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "DreamWorks' Shrek took home the inaugural Best Animated Feature Oscar."
      },
      {
        "id": "cmuz561g7001onei09wylyh05",
        "question": "Who directed the sci-fi masterpieces Inception and Interstellar?",
        "optionsJson": "[\"Steven Spielberg\",\"Christopher Nolan\",\"Denis Villeneuve\",\"James Cameron\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Christopher Nolan directed both acclaimed sci-fi epics."
      },
      {
        "id": "cmuz561g7001pnei0hg8hmtl1",
        "question": "What is the fictional metal alloy that covers Wolverine's skeleton?",
        "optionsJson": "[\"Vibranium\",\"Adamantium\",\"Mithril\",\"Beskar\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Adamantium is the indestructible metal bonded to Wolverine's skeleton."
      },
      {
        "id": "cmuz561g7001qnei0quj46kpo",
        "question": "In Pulp Fiction, what time are the clocks famously set to?",
        "optionsJson": "[\"12:00\",\"4:20\",\"9:15\",\"6:30\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Many clocks seen throughout Pulp Fiction are famously set to 4:20."
      },
      {
        "id": "cmuz561g7001rnei0ctdnqp24",
        "question": "Which actor played Aragorn in Peter Jackson's Lord of the Rings trilogy?",
        "optionsJson": "[\"Sean Bean\",\"Viggo Mortensen\",\"Orlando Bloom\",\"Karl Urban\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Viggo Mortensen delivered the iconic portrayal of Aragorn."
      },
      {
        "id": "cmuz561g7001snei042osb0la",
        "question": "What was the highest-grossing film of all time before Avengers: Endgame temporarily surpassed it?",
        "optionsJson": "[\"Titanic\",\"Avatar\",\"Jurassic Park\",\"Star Wars: The Force Awakens\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "James Cameron's Avatar held the crown since 2009."
      },
      {
        "id": "cmuzd21z90012qfi09fbzp61s",
        "question": "Which movie won the Academy Award for Best Picture in 1994, beating Pulp Fiction and The Shawshank Redemption?",
        "optionsJson": "[\"Forrest Gump\",\"Speed\",\"The Lion King\",\"Quiz Show\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Forrest Gump took home 6 Oscars, including Best Picture, Best Director, and Best Actor."
      },
      {
        "id": "cmuzd21zg0013qfi08xxdk8fn",
        "question": "In The Matrix (1999), what color pill does Neo take to wake up in the real world?",
        "optionsJson": "[\"Blue\",\"Red\",\"Green\",\"Yellow\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Morpheus offers the blue pill to remain asleep, or the red pill to see how deep the rabbit hole goes."
      },
      {
        "id": "cmuzd21zm0014qfi0gm5op35y",
        "question": "Who directed the groundbreaking sci-fi epics Interstellar, Inception, and Oppenheimer?",
        "optionsJson": "[\"Denis Villeneuve\",\"Christopher Nolan\",\"Steven Spielberg\",\"Ridley Scott\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Christopher Nolan directed these visionary films known for practical effects and non-linear timelines."
      },
      {
        "id": "cmuzd21zt0015qfi0klvcik2m",
        "question": "What is the highest-grossing box office movie of all time (unadjusted for inflation)?",
        "optionsJson": "[\"Avengers: Endgame\",\"Avatar\",\"Titanic\",\"Star Wars: The Force Awakens\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "James Cameron's Avatar (2009) holds the top spot with over $2.92 billion."
      },
      {
        "id": "cmuzd21zz0016qfi0w162kgrs",
        "question": "What is the name of the fictional kingdom ruled by King T'Challa in Marvel's Black Panther?",
        "optionsJson": "[\"Genosha\",\"Latveria\",\"Wakanda\",\"Sokovia\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Wakanda is the technologically advanced, vibranium-rich African nation."
      }
    ]
  },
  {
    "id": "cmuz561gr001tnei0dekiqfc1",
    "title": "Bizarre True or False Facts",
    "slug": "bizarre-true-false",
    "description": "Truth is weirder than fiction! Decide which wacky facts are 100% genuine.",
    "category": "TRIVIA",
    "difficulty": "EASY",
    "timeLimit": 15,
    "thumbnail": "🧐",
    "questions": [
      {
        "id": "cmuz561gt001unei0za6grrs6",
        "question": "True or False: Bananas share about 50% of their DNA with human beings.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "True! Due to common evolutionary ancestry of cellular functions, humans and bananas share roughly 50-60% of basic genes."
      },
      {
        "id": "cmuz561gu001vnei069270jfi",
        "question": "True or False: Honey never ever spoils if stored in sealed containers.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "True! Archaeologists have discovered 3,000-year-old honey in Egyptian tombs that is still completely edible."
      },
      {
        "id": "cmuz561gu001wnei0h8665bd1",
        "question": "True or False: A cloud weighs about as much as a feather.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "False! An average cumulus cloud weighs approximately 500,000 kilograms (1.1 million pounds)!"
      },
      {
        "id": "cmuz561gu001xnei0bze4acw9",
        "question": "True or False: Flamingos are naturally pink when they hatch from eggs.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "False! Flamingos are born gray or white; their feathers turn pink from eating beta-carotene rich brine shrimp."
      },
      {
        "id": "cmuz561gu001ynei0ok382dgt",
        "question": "True or False: Wombat poop is cube-shaped.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "True! Wombats produce cubical feces due to variations in their intestinal elasticity, preventing it from rolling away."
      },
      {
        "id": "cmuz561gu001znei0ts4kgx8a",
        "question": "True or False: The Eiffel Tower can grow more than 15 cm taller in hot summer weather.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "True! Thermal expansion of the puddled iron causes it to expand and rise up to 15 cm during high temperatures."
      },
      {
        "id": "cmuzd220b0017qfi08mvsal71",
        "question": "True or False: Bananas are technically radioactive.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "True! Bananas contain potassium-40, a naturally occurring radioactive isotope (completely harmless)."
      },
      {
        "id": "cmuzd220j0018qfi0m520v9vb",
        "question": "True or False: Honey never spoils and edible 3,000-year-old honey was found in ancient Egyptian tombs.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "True! Honey's low moisture content and high acidity prevent bacteria from surviving."
      },
      {
        "id": "cmuzd220q0019qfi0fn7g67lm",
        "question": "True or False: Humans share about 50% of their DNA with a banana.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "True! About 50% of human genes have homologs in bananas that control basic cellular replication."
      },
      {
        "id": "cmuzd220v001aqfi0gcyl7ktd",
        "question": "True or False: A cloud can weigh over one million pounds.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "True! A typical cumulus cloud weighs around 500,000 kg (1.1 million pounds) due to its water droplet volume."
      },
      {
        "id": "cmuzd2212001bqfi056cdy6us",
        "question": "True or False: Lightning never strikes the same place twice.",
        "optionsJson": "[\"True\",\"False\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "False! Tall structures like the Empire State Building are struck by lightning 20 to 25 times every year."
      }
    ]
  },
  {
    "id": "cmuz561hq0020nei0gt03y93m",
    "title": "Gaming History & Legends",
    "slug": "gaming-legends",
    "description": "Level up your gaming knowledge from arcade classics to modern masterpieces.",
    "category": "TRIVIA",
    "difficulty": "MEDIUM",
    "timeLimit": 15,
    "thumbnail": "🕹️",
    "questions": [
      {
        "id": "cmuz561hv0021nei0ignp8o7h",
        "question": "What was Mario's original profession in the 1981 Donkey Kong arcade game?",
        "optionsJson": "[\"Plumber\",\"Carpenter\",\"Electrician\",\"Chef\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Mario (originally 'Jumpman') was designed as a carpenter because the game took place on a construction site."
      },
      {
        "id": "cmuz561hv0022nei0oupznc43",
        "question": "Which legendary video game introduced the Konami Code (↑ ↑ ↓ ↓ ← → ← → B A)?",
        "optionsJson": "[\"Contra\",\"Gradius\",\"Castlevania\",\"Metal Gear\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Developer Kazuhisa Hashimoto created the code in 1986 while testing the NES port of Gradius."
      },
      {
        "id": "cmuz561hv0023nei041xhe9o4",
        "question": "What is the best-selling video game of all time with over 300 million copies sold?",
        "optionsJson": "[\"Grand Theft Auto V\",\"Minecraft\",\"Tetris\",\"Wii Sports\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Minecraft officially crossed 300 million copies sold worldwide."
      },
      {
        "id": "cmuz561hv0024nei0g6wx54ew",
        "question": "In Pokémon, what type is Pikachu's primary evolutionary category?",
        "optionsJson": "[\"Fire\",\"Electric\",\"Steel\",\"Normal\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Pikachu is the flagship Electric-type mouse Pokémon."
      },
      {
        "id": "cmuz561hv0025nei02442n5xc",
        "question": "Which studio created the Soulsborne genre, including Dark Souls and Elden Ring?",
        "optionsJson": "[\"Capcom\",\"FromSoftware\",\"Square Enix\",\"Bethesda\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Hidetaka Miyazaki and FromSoftware revolutionized action RPGs with the Souls series."
      },
      {
        "id": "cmuz561hv0026nei0aahzc7jf",
        "question": "What is the name of the protagonist in the original Halo trilogy?",
        "optionsJson": "[\"Master Chief (John-117)\",\"Commander Shepard\",\"Gordon Freeman\",\"Doom Slayer\"]",
        "correctAnswer": 0,
        "points": 10,
        "explanation": "Master Chief Petty Officer John-117 is the Spartan hero of Halo."
      },
      {
        "id": "cmuzd221d001cqfi0sdpk8ooc",
        "question": "Which video game was the first to feature the iconic 'Konami Code' (↑ ↑ ↓ ↓ ← → ← → B A)?",
        "optionsJson": "[\"Contra\",\"Gradius\",\"Castlevania\",\"Metal Gear\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Kazuhisa Hashimoto invented the cheat code while testing Gradius on the NES in 1986."
      },
      {
        "id": "cmuzd221j001dqfi0nqmjjw8j",
        "question": "What was Mario's original profession in the 1981 arcade game Donkey Kong?",
        "optionsJson": "[\"Plumber\",\"Carpenter\",\"Architect\",\"Electrician\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Mario was known as 'Jumpman' and was a carpenter because the game took place on a construction site."
      },
      {
        "id": "cmuzd221q001eqfi0ocgk7pk6",
        "question": "Which legendary video game opening begins with the line: 'Hey, you. You're finally awake.'?",
        "optionsJson": "[\"Fallout: New Vegas\",\"The Elder Scrolls V: Skyrim\",\"The Witcher 3\",\"Dark Souls\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "Ralof's iconic line opens Skyrim on the wagon to Helgen."
      },
      {
        "id": "cmuzd221x001fqfi0aseyhopy",
        "question": "In Pokémon Red & Blue, which Pokémon is numbered #001 in the National Pokédex?",
        "optionsJson": "[\"Pikachu\",\"Charmander\",\"Bulbasaur\",\"Mew\"]",
        "correctAnswer": 2,
        "points": 10,
        "explanation": "Bulbasaur holds the #001 spot in the Kanto and National Pokédex."
      },
      {
        "id": "cmuzd2223001gqfi0xiwz3z7r",
        "question": "What was the first commercial home video game console ever released (1972)?",
        "optionsJson": "[\"Atari 2600\",\"Magnavox Odyssey\",\"Coleco Telstar\",\"Intellivision\"]",
        "correctAnswer": 1,
        "points": 10,
        "explanation": "The Magnavox Odyssey, engineered by Ralph Baer, debuted in 1972."
      }
    ]
  }
];

const achievementsData = [
  {
    "id": "ach_dots_boxes",
    "key": "DOTS_TACTICIAN",
    "title": "Dots & Boxes Tactician",
    "description": "Claim 10+ squares in a single Dots and Boxes strategy game",
    "icon": "🔲",
    "category": "GAMES",
    "xpReward": 80
  },
  {
    "id": "ach_nine_mens",
    "key": "MILL_CONQUEROR",
    "title": "Mill Conqueror",
    "description": "Form 3 Mills in Nine Men's Morris and reach Phase 3 flying",
    "icon": "⚔️",
    "category": "GAMES",
    "xpReward": 90
  },
  {
    "id": "ach_whack_mole",
    "key": "MOLE_SLAYER",
    "title": "Mole Slayer",
    "description": "Score over 300 points and chain a 5x combo in Whack-a-Mole Arcade",
    "icon": "🔨",
    "category": "GAMES",
    "xpReward": 75
  },
  {
    "id": "ach_sudoku",
    "key": "SUDOKU_MASTER",
    "title": "Sudoku Master",
    "description": "Solve a 9x9 Sudoku puzzle with zero mistakes",
    "icon": "🧩",
    "category": "GAMES",
    "xpReward": 100
  },
  {
    "id": "ach_word_guess",
    "key": "WORDLE_GENIUS",
    "title": "Wordle Genius",
    "description": "Deduce the secret 5-letter Daily Word in 3 guesses or fewer",
    "icon": "🔤",
    "category": "GAMES",
    "xpReward": 100
  },
  {
    "id": "ach_hangman",
    "key": "HANGMAN_SURVIVOR",
    "title": "Hangman Survivor",
    "description": "Solve a Hangman mystery word with zero incorrect guesses",
    "icon": "🎪",
    "category": "GAMES",
    "xpReward": 80
  },
  {
    "id": "ach_geo_detective",
    "key": "GEO_EXPLORER",
    "title": "World Cartographer",
    "description": "Identify 10 countries in Guess the Country without giving up",
    "icon": "🌐",
    "category": "QUIZZES",
    "xpReward": 90
  },
  {
    "id": "ach_fact_blitz",
    "key": "FACT_CHECKER",
    "title": "Fact Checker",
    "description": "Reach an 8x streak in True or False Blitz",
    "icon": "⚡",
    "category": "QUIZZES",
    "xpReward": 80
  },
  {
    "id": "cmuz561ij0027nei01rx1ra8y",
    "key": "FIRST_GAME",
    "title": "First Game Played",
    "description": "Complete any interactive mini-game on Bored?",
    "icon": "🎮",
    "category": "GAMES",
    "xpReward": 50
  },
  {
    "id": "cmuz561jt0029nei0ee43dw45",
    "key": "QUIZ_STARTER",
    "title": "Quiz Starter",
    "description": "Take and complete your first knowledge quiz",
    "icon": "🧠",
    "category": "QUIZZES",
    "xpReward": 50
  },
  {
    "id": "cmuz561kp002bnei0jipu583b",
    "key": "PERFECT_SCORE",
    "title": "Flawless Mind",
    "description": "Score 100% accuracy on any timed quiz",
    "icon": "🎯",
    "category": "QUIZZES",
    "xpReward": 100
  },
  {
    "id": "cmuz561kx002cnei07ekiodz1",
    "key": "SPEED_DEMON",
    "title": "Speed Demon",
    "description": "Hit an elite reaction time under 220ms in the Reflex Test",
    "icon": "⚡",
    "category": "GAMES",
    "xpReward": 75
  },
  {
    "id": "cmuz561l7002dnei0oxqy0pvq",
    "key": "MEMORY_MASTER",
    "title": "Memory Master",
    "description": "Finish the card memory challenge in under 12 moves",
    "icon": "🃏",
    "category": "GAMES",
    "xpReward": 80
  },
  {
    "id": "cmuz561lf002enei0720i4pyv",
    "key": "RANDOM_EXPLORER",
    "title": "Random Explorer",
    "description": "Use the Surprise Me roulette 5 times to discover new activities",
    "icon": "🎲",
    "category": "EXPLORATION",
    "xpReward": 60
  },
  {
    "id": "cmuz561lo002fnei0fxx9z5hm",
    "key": "CREATIVE_SOUL",
    "title": "Creative Soul",
    "description": "Export an artwork from Pixel Art Studio or jam on the Soundboard",
    "icon": "🎨",
    "category": "CREATIVE",
    "xpReward": 50
  },
  {
    "id": "cmuz561lv002gnei0pbzxqri5",
    "key": "DAILY_CHAMP",
    "title": "Daily Champion",
    "description": "Complete your first daily challenge",
    "icon": "🏆",
    "category": "CHALLENGES",
    "xpReward": 100
  },
  {
    "id": "cmuz561m4002hnei08q5hsljg",
    "key": "STREAK_7_DAYS",
    "title": "Week Warrior",
    "description": "Maintain a 7-day daily activity streak",
    "icon": "🔥",
    "category": "STREAKS",
    "xpReward": 250
  },
  {
    "id": "cmuz561mi002jnei0ap13jibv",
    "key": "CENTURY_CLUB",
    "title": "Boredom Crusher",
    "description": "Complete 100 activities across the platform",
    "icon": "👑",
    "category": "MILESTONES",
    "xpReward": 500
  }
];

const userAchievementsData = [
  {
    "id": "cmuz561jd0028nei0nnchwbcg",
    "userId": "cmuz5613x0001nei01jzbhv4r",
    "achievementId": "cmuz561ij0027nei01rx1ra8y"
  },
  {
    "id": "cmuz561ka002anei0m2mpdihp",
    "userId": "cmuz5613x0001nei01jzbhv4r",
    "achievementId": "cmuz561jt0029nei0ee43dw45"
  },
  {
    "id": "cmuz561ma002inei0lx2f7skh",
    "userId": "cmuz5613x0001nei01jzbhv4r",
    "achievementId": "cmuz561m4002hnei08q5hsljg"
  }
];

const dailyChallengesData = [
  {
    "id": "cmuz561mr002knei0x7smsftg",
    "title": "Tri-Boredom Trifecta",
    "description": "Complete 3 different activities today to earn bonus XP!",
    "dateStr": "2026-10-08",
    "targetType": "ACTIVITIES_PLAYED",
    "targetCount": 3,
    "xpReward": 150
  },
  {
    "id": "cmv0mp95x000s1pi05mhxpn8a",
    "title": "Boredom Destroyer",
    "description": "Complete any 3 activities or quizzes today to maintain your momentum!",
    "dateStr": "2026-10-09",
    "targetType": "ACTIVITIES_PLAYED",
    "targetCount": 3,
    "xpReward": 150
  }
];

const userChallengesData = [
  {
    "id": "cmuz561n2002lnei0pfgl699z",
    "userId": "cmuz5613x0001nei01jzbhv4r",
    "challengeId": "cmuz561mr002knei0x7smsftg",
    "progress": 2,
    "completed": false
  }
];

const gameResultsData = [
  {
    "id": "cmuz6mfh60000fqi03f2sjik3",
    "userId": null,
    "activityId": "cmuz561680004nei0ffnhej3d",
    "score": 518,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": 482,
    "createdAt": "2026-10-08T06:55:20.538Z"
  },
  {
    "id": "cmuz6mv8p0001fqi0tjvon406",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T06:55:40.969Z"
  },
  {
    "id": "cmuz6n82b0002fqi08gvbuhi4",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T06:55:57.587Z"
  },
  {
    "id": "cmuz6ni4k0003fqi00b3e9via",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T06:56:10.628Z"
  },
  {
    "id": "cmuz6nlaz0004fqi0mdlfm88q",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T06:56:14.747Z"
  },
  {
    "id": "cmuz6nzwn0005fqi0dosl1xyk",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T06:56:33.671Z"
  },
  {
    "id": "cmuz6o4r90006fqi0lcp4bija",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T06:56:39.957Z"
  },
  {
    "id": "cmuz6okst0007fqi0or8ca1du",
    "userId": null,
    "activityId": "cmuz5618k000anei09s565hg4",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T06:57:00.749Z"
  },
  {
    "id": "cmuz6tlt7000afqi08vh0chtw",
    "userId": null,
    "activityId": "cmuz5616q0005nei0zs60bzp1",
    "score": 230,
    "wpm": null,
    "accuracy": null,
    "moves": 18,
    "timeMs": 37000,
    "createdAt": "2026-10-08T07:00:55.339Z"
  },
  {
    "id": "cmuz6yaxm000bfqi0tu4efq2y",
    "userId": null,
    "activityId": "cmuz561750006nei0o99ntli2",
    "score": 10,
    "wpm": null,
    "accuracy": null,
    "moves": 13,
    "timeMs": null,
    "createdAt": "2026-10-08T07:04:34.522Z"
  },
  {
    "id": "cmuz6zdp2000cfqi0epo1tfvn",
    "userId": null,
    "activityId": "cmuz561750006nei0o99ntli2",
    "score": 20,
    "wpm": null,
    "accuracy": null,
    "moves": 8,
    "timeMs": null,
    "createdAt": "2026-10-08T07:05:24.758Z"
  },
  {
    "id": "cmuz70l3k000dfqi035g515h7",
    "userId": null,
    "activityId": "cmuz561750006nei0o99ntli2",
    "score": 40,
    "wpm": null,
    "accuracy": null,
    "moves": 6,
    "timeMs": null,
    "createdAt": "2026-10-08T07:06:21.008Z"
  },
  {
    "id": "cmuz78p7y000efqi0b3bni3zf",
    "userId": null,
    "activityId": "cmuz5619v000enei0bav36oux",
    "score": 65,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T07:12:39.599Z"
  },
  {
    "id": "cmuz83iee000ffqi0eixia6cv",
    "userId": null,
    "activityId": "cmuz5618k000anei09s565hg4",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T07:36:37.094Z"
  },
  {
    "id": "cmuz8d8na000hfqi0wb67tluk",
    "userId": null,
    "activityId": "cmuz5618k000anei09s565hg4",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T07:44:11.014Z"
  },
  {
    "id": "cmuz8plei000ifqi08zj997bg",
    "userId": null,
    "activityId": "cmuz5618k000anei09s565hg4",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T07:53:47.418Z"
  },
  {
    "id": "cmuz99y1c000jfqi02y0izptg",
    "userId": null,
    "activityId": "cmuz5617f0007nei01m0126vn",
    "score": 52,
    "wpm": 52,
    "accuracy": 100,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T08:09:36.912Z"
  },
  {
    "id": "cmuz9ajqa000kfqi0quzhnog3",
    "userId": null,
    "activityId": "cmuz5617r0008nei0szrhb0h4",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T08:10:05.026Z"
  },
  {
    "id": "cmuz9h2oo000lfqi01aq55cn0",
    "userId": null,
    "activityId": "cmuz5618k000anei09s565hg4",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T08:15:09.528Z"
  },
  {
    "id": "cmuz9ruhi000mfqi0s7o9f1gp",
    "userId": null,
    "activityId": "cmuz561680004nei0ffnhej3d",
    "score": 649,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": 351,
    "createdAt": "2026-10-08T08:23:32.118Z"
  },
  {
    "id": "cmuzacktu000ofqi0p53x2qez",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T08:39:39.378Z"
  },
  {
    "id": "cmuzd3f8w00001pi0nzq8ncn6",
    "userId": null,
    "activityId": "cmuz561a2000fnei0kwanff1t",
    "score": 582,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": 418,
    "createdAt": "2026-10-08T09:56:31.088Z"
  },
  {
    "id": "cmuzd6p9r00011pi0vu6o8z71",
    "userId": null,
    "activityId": "cmuz5616q0005nei0zs60bzp1",
    "score": 185,
    "wpm": null,
    "accuracy": null,
    "moves": 21,
    "timeMs": 38000,
    "createdAt": "2026-10-08T09:59:04.047Z"
  },
  {
    "id": "cmuzf7s5c00021pi0zricw3kt",
    "userId": null,
    "activityId": "cmuz561680004nei0ffnhej3d",
    "score": 614,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": 386,
    "createdAt": "2026-10-08T10:55:53.664Z"
  },
  {
    "id": "cmuzfc03400031pi001szl3ax",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T10:59:10.576Z"
  },
  {
    "id": "cmuzfmjh600041pi0k6jtbfol",
    "userId": null,
    "activityId": "cmuz561a2000fnei0kwanff1t",
    "score": 695,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": 305,
    "createdAt": "2026-10-08T11:07:22.266Z"
  },
  {
    "id": "cmuzg6xwp00051pi030h3yc1q",
    "userId": null,
    "activityId": "cmuz5617r0008nei0szrhb0h4",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T11:23:14.089Z"
  },
  {
    "id": "cmuzg7l3t00061pi0gympshx6",
    "userId": null,
    "activityId": "cmuz5618k000anei09s565hg4",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-08T11:23:44.153Z"
  },
  {
    "id": "cmuzg91ci00071pi08ddme93j",
    "userId": null,
    "activityId": "cmuz561a2000fnei0kwanff1t",
    "score": 660,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": 340,
    "createdAt": "2026-10-08T11:24:51.858Z"
  },
  {
    "id": "cmv0hjvt900081pi0dku65fo7",
    "userId": null,
    "activityId": "cmuz5616q0005nei0zs60bzp1",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T04:49:03.694Z"
  },
  {
    "id": "cmv0hjvtu00091pi0dhcpogbl",
    "userId": null,
    "activityId": "cmuz5616q0005nei0zs60bzp1",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T04:49:03.714Z"
  },
  {
    "id": "cmv0jy3tn000a1pi0pd8d2ywc",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:56:06.491Z"
  },
  {
    "id": "cmv0jyhcg000b1pi0h4f383t8",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:56:24.016Z"
  },
  {
    "id": "cmv0jyv4e000c1pi0vl0kbrez",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:56:41.870Z"
  },
  {
    "id": "cmv0jz7h6000d1pi0dku41hb6",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:56:57.882Z"
  },
  {
    "id": "cmv0jzuim000e1pi0eb2a30j7",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:57:27.742Z"
  },
  {
    "id": "cmv0k01uu000f1pi0lrlhu5co",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:57:37.254Z"
  },
  {
    "id": "cmv0k12sc000g1pi0bltom8iz",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:58:25.116Z"
  },
  {
    "id": "cmv0k1904000h1pi0sq3msm8s",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:58:33.172Z"
  },
  {
    "id": "cmv0k1nsc000i1pi0u6ve5xdk",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:58:52.332Z"
  },
  {
    "id": "cmv0k1r5p000j1pi0c8a99d36",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:58:56.701Z"
  },
  {
    "id": "cmv0k226b000k1pi00abq55yb",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:59:10.979Z"
  },
  {
    "id": "cmv0k2cnb000l1pi05octzl1y",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:59:24.551Z"
  },
  {
    "id": "cmv0k2egl000m1pi0d7p5rr0c",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:59:26.901Z"
  },
  {
    "id": "cmv0k2ggh000n1pi05104lmha",
    "userId": null,
    "activityId": "cmuz5619a000cnei0jqbczxdi",
    "score": 30,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T05:59:29.489Z"
  },
  {
    "id": "cmv0magry000p1pi06r25mkk2",
    "userId": null,
    "activityId": "cmuzdqi6l0000d8i02m60cuyk",
    "score": 50,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T07:01:42.382Z"
  },
  {
    "id": "cmv0meaq9000q1pi0k0j9nl6a",
    "userId": null,
    "activityId": "cmuzdqi6l0000d8i02m60cuyk",
    "score": 50,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T07:04:41.169Z"
  },
  {
    "id": "cmv0mlg7m000r1pi0b5cwbk6m",
    "userId": null,
    "activityId": "cmuz5618k000anei09s565hg4",
    "score": 100,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T07:10:14.866Z"
  },
  {
    "id": "cmv0mtf3o000t1pi0yc2yw436",
    "userId": null,
    "activityId": "cmuz5619v000enei0bav36oux",
    "score": 65,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T07:16:26.676Z"
  },
  {
    "id": "cmv0mtyse000u1pi0umozspv8",
    "userId": null,
    "activityId": "cmuz5619v000enei0bav36oux",
    "score": 74,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T07:16:52.190Z"
  },
  {
    "id": "cmv0muhmv000v1pi0d9diryww",
    "userId": null,
    "activityId": "cmuz5619v000enei0bav36oux",
    "score": 70,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T07:17:16.615Z"
  },
  {
    "id": "cmv0muuak000w1pi0jsvvdt0a",
    "userId": null,
    "activityId": "cmuz5619v000enei0bav36oux",
    "score": 87,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T07:17:33.020Z"
  },
  {
    "id": "cmv0mv020000x1pi0zfwqx7ml",
    "userId": null,
    "activityId": "cmuz5619v000enei0bav36oux",
    "score": 61,
    "wpm": null,
    "accuracy": null,
    "moves": null,
    "timeMs": null,
    "createdAt": "2026-10-09T07:17:40.488Z"
  }
];

const quizResultsData = [
  {
    "id": "cmuz6qcly0008fqi08f57cx79",
    "userId": null,
    "quizId": "cmuz561cl000knei0vamw9wb9",
    "score": 4,
    "totalQuestions": 7,
    "accuracy": 57,
    "pointsEarned": 70,
    "createdAt": "2026-10-08T06:58:23.447Z"
  },
  {
    "id": "cmuz6rhmp0009fqi0kdwyual8",
    "userId": null,
    "quizId": "cmuz561cl000knei0vamw9wb9",
    "score": 7,
    "totalQuestions": 7,
    "accuracy": 100,
    "pointsEarned": 170,
    "createdAt": "2026-10-08T06:59:16.609Z"
  },
  {
    "id": "cmuz8bd0s000gfqi04ds4ugnc",
    "userId": null,
    "quizId": "cmuz561ee0010nei051d2peea",
    "score": 3,
    "totalQuestions": 7,
    "accuracy": 43,
    "pointsEarned": 60,
    "createdAt": "2026-10-08T07:42:43.372Z"
  },
  {
    "id": "cmuz9yagp000nfqi0jogm7dx2",
    "userId": null,
    "quizId": "cmuz561dp000snei0slr77z1q",
    "score": 4,
    "totalQuestions": 7,
    "accuracy": 57,
    "pointsEarned": 70,
    "createdAt": "2026-10-08T08:28:32.761Z"
  },
  {
    "id": "cmv0ki1z4000o1pi06wt07fee",
    "userId": null,
    "quizId": "cmuz561dp000snei0slr77z1q",
    "score": 0,
    "totalQuestions": 16,
    "accuracy": 0,
    "pointsEarned": 30,
    "createdAt": "2026-10-09T06:11:37.216Z"
  }
];

async function main() {
  console.log("🌱 Seeding entire database from complete dataset snapshot...");

  // 1. Clean existing records in correct order of relations
  await prisma.bookmark.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.userChallenge.deleteMany();
  await prisma.dailyChallenge.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.gameResult.deleteMany();
  await prisma.quizResult.deleteMany();
  await prisma.userActivity.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared old database tables.");

  // 2. Seed Users
  for (const user of usersData) {
    await prisma.user.create({ data: user });
  }
  console.log("Created " + usersData.length + " users.");

  // 3. Seed Activities (Including All 11 Master Games, Connect 4, Memory Game, etc.)
  const seenSlugs = new Set<string>();
  const uniqueActivities = activitiesData.filter((act) => {
    if (seenSlugs.has(act.slug)) return false;
    seenSlugs.add(act.slug);
    return true;
  });
  for (const act of uniqueActivities) {
    await prisma.activity.create({ data: act });
  }
  console.log("Created " + uniqueActivities.length + " activities.");

  // 4. Seed Quizzes and All Questions
  const seenQuizSlugs = new Set<string>();
  const uniqueQuizzes = quizzesData.filter((q) => {
    if (seenQuizSlugs.has(q.slug)) return false;
    seenQuizSlugs.add(q.slug);
    return true;
  });
  for (const q of uniqueQuizzes) {
    const { questions, ...quizFields } = q;
    await prisma.quiz.create({ data: quizFields });
    if (questions && questions.length > 0) {
      for (const question of questions) {
        await prisma.question.create({
          data: {
            ...question,
            quizId: q.id,
          },
        });
      }
    }
  }
  console.log("Created " + uniqueQuizzes.length + " quizzes with all questions.");

  // 5. Seed Achievements
  const seenAchKeys = new Set<string>();
  const uniqueAchievements = achievementsData.filter((ach) => {
    if (seenAchKeys.has(ach.key)) return false;
    seenAchKeys.add(ach.key);
    return true;
  });
  for (const ach of uniqueAchievements) {
    await prisma.achievement.create({ data: ach });
  }
  console.log("Created " + uniqueAchievements.length + " achievements.");

  // 6. Seed User Achievements
  for (const ua of userAchievementsData) {
    await prisma.userAchievement.create({ data: ua });
  }
  console.log("Created " + userAchievementsData.length + " user achievements.");

  // 7. Seed Daily Challenges
  for (const dc of dailyChallengesData) {
    await prisma.dailyChallenge.create({ data: dc });
  }
  console.log("Created " + dailyChallengesData.length + " daily challenges.");

  // 8. Seed User Challenges
  for (const uc of userChallengesData) {
    await prisma.userChallenge.create({ data: uc });
  }
  console.log("Created " + userChallengesData.length + " user challenges.");

  // 9. Seed Game Results (Leaderboards & Histories)
  for (const gr of gameResultsData) {
    await prisma.gameResult.create({
      data: {
        ...gr,
        createdAt: new Date(gr.createdAt),
      },
    });
  }
  console.log("Created " + gameResultsData.length + " game results.");

  // 10. Seed Quiz Results
  for (const qr of quizResultsData) {
    await prisma.quizResult.create({
      data: {
        ...qr,
        createdAt: new Date(qr.createdAt),
      },
    });
  }
  console.log("Created " + quizResultsData.length + " quiz results.");

  console.log("✅ Complete database seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
