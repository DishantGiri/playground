import "dotenv/config";
import bcrypt from "bcryptjs";
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

async function main() {
  console.log("🌱 Seeding Bored? entertainment platform database...");

  // 1. Clean existing records in correct order
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

  // 2. Create Users
  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin Boss",
      email: "admin@bored.app",
      password: adminPassword,
      role: "ADMIN",
      points: 15400,
      level: 15,
      streak: 14,
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin",
      lastActiveDate: new Date().toISOString().split("T")[0],
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: "Alex Gamer",
      email: "alex@example.com",
      password: hashedPassword,
      role: "USER",
      points: 12450,
      level: 12,
      streak: 7,
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
      lastActiveDate: new Date().toISOString().split("T")[0],
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Sam Explorer",
      email: "sam@example.com",
      password: hashedPassword,
      role: "USER",
      points: 9830,
      level: 10,
      streak: 5,
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=Sam",
      lastActiveDate: new Date().toISOString().split("T")[0],
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: "John Swift",
      email: "john@example.com",
      password: hashedPassword,
      role: "USER",
      points: 8920,
      level: 9,
      streak: 4,
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=John",
      lastActiveDate: new Date().toISOString().split("T")[0],
    },
  });

  console.log("Created users.");

  // 3. Create 16 Activities (Games, Interactive Tools, Generators)
  const activitiesData = [
    {
      title: "How Fast Are Your Reflexes?",
      slug: "reaction-test",
      description: "Test your raw reaction speed in milliseconds when the color shifts. Can you beat the 200ms human reflex threshold?",
      category: "GAME",
      type: "REACTION_TEST",
      thumbnail: "⚡",
      difficulty: "MEDIUM",
      estimatedTime: "1 min",
      points: 25,
      playCount: 14320,
      rating: 4.9,
    },
    {
      title: "Can You Remember These Cards?",
      slug: "memory-game",
      description: "Flip, match, and conquer! Train your working memory with this addictive card matching mini-game.",
      category: "GAME",
      type: "MEMORY_GAME",
      thumbnail: "🃏",
      difficulty: "MEDIUM",
      estimatedTime: "2 min",
      points: 30,
      playCount: 9840,
      rating: 4.8,
    },
    {
      title: "Guess the Secret Number",
      slug: "number-guess",
      description: "A mysterious number between 1 and 100 is chosen. Use hotter/colder hints to guess it in as few tries as possible.",
      category: "GAME",
      type: "GUESSING_GAME",
      thumbnail: "🔢",
      difficulty: "EASY",
      estimatedTime: "1 min",
      points: 20,
      playCount: 6510,
      rating: 4.7,
    },
    {
      title: "Speed Typing Sprint",
      slug: "typing-test",
      description: "Test your words-per-minute (WPM) and accuracy against dynamic entertainment quotes.",
      category: "GAME",
      type: "TYPING_TEST",
      thumbnail: "⌨️",
      difficulty: "HARD",
      estimatedTime: "2 min",
      points: 35,
      playCount: 11200,
      rating: 4.9,
    },
    {
      title: "Would You Rather? Impossible Choices",
      slug: "would-you-rather",
      description: "Face excruciating dilemmas and see how your moral compass stacks up against thousands of other players.",
      category: "FUN",
      type: "WOULD_YOU_RATHER",
      thumbnail: "⚖️",
      difficulty: "EASY",
      estimatedTime: "2 min",
      points: 15,
      playCount: 22800,
      rating: 4.9,
    },
    {
      title: "Pixel Art Studio",
      slug: "pixel-art",
      description: "Unleash your creativity on an 8-bit retro canvas! Draw sprites, select vibrant palettes, and download your artwork.",
      category: "CREATIVE",
      type: "PIXEL_ART",
      thumbnail: "🎨",
      difficulty: "EASY",
      estimatedTime: "4 min",
      points: 40,
      playCount: 5410,
      rating: 4.8,
    },
    {
      title: "Lo-Fi Synth & Soundboard",
      slug: "soundboard",
      description: "Tap 16 interactive sound pads synthesized in real time via Web Audio API. Jam your own chill beats in seconds.",
      category: "CREATIVE",
      type: "SOUNDBOARD",
      thumbnail: "🎹",
      difficulty: "EASY",
      estimatedTime: "3 min",
      points: 30,
      playCount: 7890,
      rating: 4.9,
    },
    {
      title: "Shower Thoughts & Mindblown Facts",
      slug: "shower-thoughts",
      description: "Explore paradoxical thoughts and bizarre facts that will genuinely alter how you look at the universe today.",
      category: "RANDOM",
      type: "FACT",
      thumbnail: "🚿",
      difficulty: "EASY",
      estimatedTime: "1 min",
      points: 15,
      playCount: 16400,
      rating: 4.7,
    },
    {
      title: "Dad Joke & Pun Generator",
      slug: "dad-jokes",
      description: "Groan-inducing dad jokes, witty tech one-liners, and laugh buttons designed to cure boredom instantly.",
      category: "FUN",
      type: "JOKE_GEN",
      thumbnail: "😂",
      difficulty: "EASY",
      estimatedTime: "1 min",
      points: 15,
      playCount: 8900,
      rating: 4.6,
    },
    {
      title: "What Type of Bored Soul Are You?",
      slug: "personality-archetype",
      description: "A fast 5-question psychological archetype test. Are you the Chaos Gremlin, the Brainiac, or the Chill Sloth?",
      category: "QUIZ",
      type: "PERSONALITY_TEST",
      thumbnail: "🔮",
      difficulty: "EASY",
      estimatedTime: "2 min",
      points: 40,
      playCount: 13500,
      rating: 4.8,
    },
    {
      title: "The 10-Second Click Frenzy",
      slug: "click-frenzy",
      description: "How many times can you click in exactly 10 seconds? Test your jitter click and CPS (clicks per second).",
      category: "GAME",
      type: "MINI_GAME",
      thumbnail: "👆",
      difficulty: "EASY",
      estimatedTime: "10 sec",
      points: 20,
      playCount: 18700,
      rating: 4.8,
    },
    {
      title: "Bizarre Dilemmas & Random Wheel",
      slug: "random-wheel",
      description: "Spin the digital wheel of spontaneous challenges. Sing a song in reverse, do 10 pushups, or text your best friend a duck emoji.",
      category: "RANDOM",
      type: "RANDOM_GENERATOR",
      thumbnail: "🎡",
      difficulty: "MEDIUM",
      estimatedTime: "2 min",
      points: 25,
      playCount: 4200,
      rating: 4.5,
    },
    {
      title: "Quick General Knowledge Blitz",
      slug: "general-knowledge-blitz",
      description: "10 rapid-fire questions covering geography, history, pop culture, and science. Beat the countdown!",
      category: "QUIZ",
      type: "TRIVIA",
      thumbnail: "🧠",
      difficulty: "MEDIUM",
      estimatedTime: "3 min",
      points: 50,
      playCount: 12900,
      rating: 4.9,
    },
    {
      title: "The Impossible Logic Quiz",
      slug: "impossible-quiz",
      description: "Riddles that seem obvious until they twist your brain in knots. Only 4% of players get a perfect 10/10.",
      category: "QUIZ",
      type: "TRIVIA",
      thumbnail: "🤯",
      difficulty: "HARD",
      estimatedTime: "4 min",
      points: 60,
      playCount: 15300,
      rating: 4.8,
    },
    {
      title: "Guess the Country Flag & Capital",
      slug: "guess-the-country",
      description: "Can you recognize the world's most unique flags and tricky capitals under time pressure?",
      category: "QUIZ",
      type: "TRIVIA",
      thumbnail: "🌍",
      difficulty: "MEDIUM",
      estimatedTime: "3 min",
      points: 45,
      playCount: 8200,
      rating: 4.7,
    },
    {
      title: "Ultimate 90s & 2000s Nostalgia Quiz",
      slug: "nostalgia-quiz",
      description: "Dial-up sounds, Tamagotchis, cartoons, and millennium hits. How sharp is your retro memory?",
      category: "QUIZ",
      type: "TRIVIA",
      thumbnail: "📼",
      difficulty: "EASY",
      estimatedTime: "3 min",
      points: 35,
      playCount: 7100,
      rating: 4.8,
    },
  ];

  for (const act of activitiesData) {
    await prisma.activity.create({ data: act });
  }

  console.log(`Created ${activitiesData.length} activities.`);

  // 4. Create 8 Quizzes with 50+ Questions
  const quizzesData = [
    {
      title: "Quick General Knowledge Blitz",
      slug: "general-knowledge-blitz",
      description: "10 rapid-fire questions to test your general worldly knowledge against the clock.",
      category: "TRIVIA",
      difficulty: "MEDIUM",
      timeLimit: 15,
      thumbnail: "🧠",
      questions: [
        {
          question: "Which planet in our solar system has the most moons?",
          options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
          correctAnswer: 1, // Saturn (146 moons)
          points: 10,
          explanation: "Saturn holds the official record with 146 confirmed moons, edging out Jupiter.",
        },
        {
          question: "What is the only mammal capable of true sustained flight?",
          options: ["Flying Squirrel", "Bat", "Sugar Glider", "Colugo"],
          correctAnswer: 1,
          points: 10,
          explanation: "Bats are the only mammals with the physiological ability for true sustained flight.",
        },
        {
          question: "What is the chemical symbol for Gold?",
          options: ["Go", "Gd", "Au", "Ag"],
          correctAnswer: 2,
          points: 10,
          explanation: "Au comes from the Latin word 'Aurum', meaning shining dawn.",
        },
        {
          question: "Which country has the longest coastline in the world?",
          options: ["Russia", "Australia", "Canada", "Chile"],
          correctAnswer: 2,
          points: 10,
          explanation: "Canada's coastline stretches over 202,080 km, making it the longest on Earth.",
        },
        {
          question: "In what year was the first iPhone released?",
          options: ["2005", "2007", "2008", "2010"],
          correctAnswer: 1,
          points: 10,
          explanation: "Steve Jobs unveiled the original iPhone on January 9, 2007.",
        },
        {
          question: "What is the hardest natural substance known on Earth?",
          options: ["Titanium", "Diamond", "Graphene", "Tungsten"],
          correctAnswer: 1,
          points: 10,
          explanation: "Diamond scores a 10 on the Mohs hardness scale.",
        },
        {
          question: "How many bones are in the adult human body?",
          options: ["186", "206", "216", "226"],
          correctAnswer: 1,
          points: 10,
          explanation: "Adult humans have 206 bones after several infant bones fuse together.",
        },
      ],
    },
    {
      title: "The Impossible Logic Quiz",
      slug: "impossible-quiz",
      description: "Mind-bending logic riddles where nothing is as straightforward as it seems.",
      category: "TRIVIA",
      difficulty: "HARD",
      timeLimit: 20,
      thumbnail: "🤯",
      questions: [
        {
          question: "If you overtake the person in second place in a race, what place are you in?",
          options: ["First", "Second", "Third", "Last"],
          correctAnswer: 1,
          points: 15,
          explanation: "You take their spot, which means you are now in second place!",
        },
        {
          question: "A cowboy rides into town on Friday, stays for three days, and leaves on Friday. How?",
          options: ["Time travel", "His horse is named Friday", "It was a leap year", "He took a detour"],
          correctAnswer: 1,
          points: 15,
          explanation: "The horse's name is Friday!",
        },
        {
          question: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
          options: ["A piano", "A keyboard", "A map", "A prison"],
          correctAnswer: 1,
          points: 15,
          explanation: "A computer keyboard has keys, spacebar, and an enter key.",
        },
        {
          question: "How many months have 28 days?",
          options: ["1", "6", "11", "All 12"],
          correctAnswer: 3,
          points: 15,
          explanation: "All 12 months have at least 28 days!",
        },
        {
          question: "What can travel around the world while staying in a corner?",
          options: ["A postage stamp", "An airplane", "A satellite", "A compass"],
          correctAnswer: 0,
          points: 15,
          explanation: "A postage stamp stays tucked in the corner of an envelope.",
        },
        {
          question: "I have branches, but no fruit, trunk or leaves. What am I?",
          options: ["A bank", "A river", "A family tree", "A railway"],
          correctAnswer: 0,
          points: 15,
          explanation: "A bank has branch locations across cities.",
        },
        {
          question: "What gets wetter the more it dries?",
          options: ["A sponge", "A towel", "A cloud", "Ice"],
          correctAnswer: 1,
          points: 15,
          explanation: "A towel absorbs moisture while drying other things.",
        },
      ],
    },
    {
      title: "Guess the Country Flag & Capital",
      slug: "guess-the-country",
      description: "Test your geographic prowess across world capitals and iconic nations.",
      category: "TRIVIA",
      difficulty: "MEDIUM",
      timeLimit: 15,
      thumbnail: "🌍",
      questions: [
        {
          question: "What is the capital city of Australia?",
          options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
          correctAnswer: 2,
          points: 10,
          explanation: "Canberra was chosen as a compromise between rival cities Sydney and Melbourne in 1908.",
        },
        {
          question: "Which country's flag is the only national flag that is NOT rectangular or square?",
          options: ["Switzerland", "Nepal", "Bhutan", "Monaco"],
          correctAnswer: 1,
          points: 10,
          explanation: "Nepal's flag is formed by two pennants (triangular shapes) stacked on top of each other.",
        },
        {
          question: "What is the capital of Canada?",
          options: ["Toronto", "Vancouver", "Montreal", "Ottawa"],
          correctAnswer: 3,
          points: 10,
          explanation: "Ottawa is the political capital of Canada, located in Ontario.",
        },
        {
          question: "Which country features a cedar tree in the center of its national flag?",
          options: ["Lebanon", "Cyprus", "Greece", "Jordan"],
          correctAnswer: 0,
          points: 10,
          explanation: "The green cedar tree has been the historical emblem of Lebanon for centuries.",
        },
        {
          question: "What is the capital of Japan?",
          options: ["Kyoto", "Osaka", "Tokyo", "Hiroshima"],
          correctAnswer: 2,
          points: 10,
          explanation: "Tokyo has been the capital and seat of the Emperor since 1868.",
        },
        {
          question: "Which African country was formerly known as Abyssinia?",
          options: ["Ethiopia", "Sudan", "Kenya", "Nigeria"],
          correctAnswer: 0,
          points: 10,
          explanation: "Ethiopia was historically referred to by Europeans as Abyssinia.",
        },
        {
          question: "What is the capital of Brazil?",
          options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
          correctAnswer: 2,
          points: 10,
          explanation: "Brasília was inaugurated in 1960 as a planned capital city.",
        },
      ],
    },
    {
      title: "Ultimate 90s & 2000s Nostalgia Quiz",
      slug: "nostalgia-quiz",
      description: "How well do you remember the golden era of cartoon networks, dial-up, and pop culture?",
      category: "TRIVIA",
      difficulty: "EASY",
      timeLimit: 15,
      thumbnail: "📼",
      questions: [
        {
          question: "What virtual digital pet on a keychain had 90s kids panicking to feed it daily?",
          options: ["Tamagotchi", "Furby", "Digimon", "Neopet"],
          correctAnswer: 0,
          points: 10,
          explanation: "Tamagotchi was released by Bandai in 1996 and sold over 82 million units worldwide.",
        },
        {
          question: "Which company released the iconic Windows 95 operating system?",
          options: ["Apple", "IBM", "Microsoft", "Intel"],
          correctAnswer: 2,
          points: 10,
          explanation: "Microsoft launched Windows 95 with an epic marketing campaign featuring the Rolling Stones.",
        },
        {
          question: "What was the name of the social network with custom HTML music profiles founded by Tom?",
          options: ["Friendster", "MySpace", "Hi5", "Orkut"],
          correctAnswer: 1,
          points: 10,
          explanation: "Everyone had Tom as their first friend on MySpace in the 2000s.",
        },
        {
          question: "Which band sang the smash 1999 hit 'All Star' featured in Shrek?",
          options: ["Smash Mouth", "Blink-182", "Green Day", "Sugar Ray"],
          correctAnswer: 0,
          points: 10,
          explanation: "Smash Mouth's 'All Star' became a legendary pop culture and meme anthem.",
        },
        {
          question: "What was the original release year of the Nintendo Game Boy?",
          options: ["1989", "1993", "1995", "1998"],
          correctAnswer: 0,
          points: 10,
          explanation: "The original gray monochrome Game Boy was released in 1989.",
        },
        {
          question: "In The Matrix (1999), which color pill does Neo swallow to learn the truth?",
          options: ["Blue", "Red", "Green", "Yellow"],
          correctAnswer: 1,
          points: 10,
          explanation: "Neo takes the red pill to see how deep the rabbit hole goes.",
        },
      ],
    },
    {
      title: "Science & Nature Wonders",
      slug: "science-wonders",
      description: "Explore the fascinating mysteries of biology, cosmos, and physics.",
      category: "TRIVIA",
      difficulty: "MEDIUM",
      timeLimit: 15,
      thumbnail: "🧬",
      questions: [
        {
          question: "What is the speed of light in a vacuum approximately?",
          options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"],
          correctAnswer: 0,
          points: 10,
          explanation: "Light travels at roughly 299,792 kilometers per second in a vacuum.",
        },
        {
          question: "Which blood type is known as the universal donor for red blood cells?",
          options: ["A Positive", "AB Negative", "O Negative", "B Positive"],
          correctAnswer: 2,
          points: 10,
          explanation: "O Negative red blood cells lack A, B, and Rh antigens, making them safe for almost any recipient.",
        },
        {
          question: "How long does light from the Sun take to reach Earth?",
          options: ["About 8 minutes", "About 8 seconds", "About 1 hour", "Instantaneous"],
          correctAnswer: 0,
          points: 10,
          explanation: "Sunlight takes approximately 8 minutes and 20 seconds to travel 93 million miles.",
        },
        {
          question: "What organelle is known as the 'powerhouse of the cell'?",
          options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
          correctAnswer: 2,
          points: 10,
          explanation: "Mitochondria generate most of the chemical energy needed by cells in the form of ATP.",
        },
        {
          question: "What is the largest living species of lizard?",
          options: ["Gila Monster", "Komodo Dragon", "Monitor Lizard", "Iguana"],
          correctAnswer: 1,
          points: 10,
          explanation: "Komodo dragons can grow up to 3 meters (10 ft) in length and weigh over 70 kg.",
        },
        {
          question: "What percentage of the Earth's surface is covered by water?",
          options: ["51%", "61%", "71%", "81%"],
          correctAnswer: 2,
          points: 10,
          explanation: "About 71% of Earth's surface is water-covered, with oceans holding 96.5% of it.",
        },
      ],
    },
    {
      title: "Cinematic Movie Buff Challenge",
      slug: "movie-buff",
      description: "Think you know your Oscars, cult classics, and blockbuster franchises?",
      category: "TRIVIA",
      difficulty: "MEDIUM",
      timeLimit: 15,
      thumbnail: "🎬",
      questions: [
        {
          question: "Which movie won the first-ever Academy Award for Best Animated Feature in 2002?",
          options: ["Monsters, Inc.", "Shrek", "Jimmy Neutron", "Ice Age"],
          correctAnswer: 1,
          points: 10,
          explanation: "DreamWorks' Shrek took home the inaugural Best Animated Feature Oscar.",
        },
        {
          question: "Who directed the sci-fi masterpieces Inception and Interstellar?",
          options: ["Steven Spielberg", "Christopher Nolan", "Denis Villeneuve", "James Cameron"],
          correctAnswer: 1,
          points: 10,
          explanation: "Christopher Nolan directed both acclaimed sci-fi epics.",
        },
        {
          question: "What is the fictional metal alloy that covers Wolverine's skeleton?",
          options: ["Vibranium", "Adamantium", "Mithril", "Beskar"],
          correctAnswer: 1,
          points: 10,
          explanation: "Adamantium is the indestructible metal bonded to Wolverine's skeleton.",
        },
        {
          question: "In Pulp Fiction, what time are the clocks famously set to?",
          options: ["12:00", "4:20", "9:15", "6:30"],
          correctAnswer: 1,
          points: 10,
          explanation: "Many clocks seen throughout Pulp Fiction are famously set to 4:20.",
        },
        {
          question: "Which actor played Aragorn in Peter Jackson's Lord of the Rings trilogy?",
          options: ["Sean Bean", "Viggo Mortensen", "Orlando Bloom", "Karl Urban"],
          correctAnswer: 1,
          points: 10,
          explanation: "Viggo Mortensen delivered the iconic portrayal of Aragorn.",
        },
        {
          question: "What was the highest-grossing film of all time before Avengers: Endgame temporarily surpassed it?",
          options: ["Titanic", "Avatar", "Jurassic Park", "Star Wars: The Force Awakens"],
          correctAnswer: 1,
          points: 10,
          explanation: "James Cameron's Avatar held the crown since 2009.",
        },
      ],
    },
    {
      title: "Bizarre True or False Facts",
      slug: "bizarre-true-false",
      description: "Truth is weirder than fiction! Decide which wacky facts are 100% genuine.",
      category: "TRIVIA",
      difficulty: "EASY",
      timeLimit: 15,
      thumbnail: "🧐",
      questions: [
        {
          question: "True or False: Bananas share about 50% of their DNA with human beings.",
          options: ["True", "False"],
          correctAnswer: 0,
          points: 10,
          explanation: "True! Due to common evolutionary ancestry of cellular functions, humans and bananas share roughly 50-60% of basic genes.",
        },
        {
          question: "True or False: Honey never ever spoils if stored in sealed containers.",
          options: ["True", "False"],
          correctAnswer: 0,
          points: 10,
          explanation: "True! Archaeologists have discovered 3,000-year-old honey in Egyptian tombs that is still completely edible.",
        },
        {
          question: "True or False: A cloud weighs about as much as a feather.",
          options: ["True", "False"],
          correctAnswer: 1,
          points: 10,
          explanation: "False! An average cumulus cloud weighs approximately 500,000 kilograms (1.1 million pounds)!",
        },
        {
          question: "True or False: Flamingos are naturally pink when they hatch from eggs.",
          options: ["True", "False"],
          correctAnswer: 1,
          points: 10,
          explanation: "False! Flamingos are born gray or white; their feathers turn pink from eating beta-carotene rich brine shrimp.",
        },
        {
          question: "True or False: Wombat poop is cube-shaped.",
          options: ["True", "False"],
          correctAnswer: 0,
          points: 10,
          explanation: "True! Wombats produce cubical feces due to variations in their intestinal elasticity, preventing it from rolling away.",
        },
        {
          question: "True or False: The Eiffel Tower can grow more than 15 cm taller in hot summer weather.",
          options: ["True", "False"],
          correctAnswer: 0,
          points: 10,
          explanation: "True! Thermal expansion of the puddled iron causes it to expand and rise up to 15 cm during high temperatures.",
        },
      ],
    },
    {
      title: "Gaming History & Legends",
      slug: "gaming-legends",
      description: "Level up your gaming knowledge from arcade classics to modern masterpieces.",
      category: "TRIVIA",
      difficulty: "MEDIUM",
      timeLimit: 15,
      thumbnail: "🕹️",
      questions: [
        {
          question: "What was Mario's original profession in the 1981 Donkey Kong arcade game?",
          options: ["Plumber", "Carpenter", "Electrician", "Chef"],
          correctAnswer: 1,
          points: 10,
          explanation: "Mario (originally 'Jumpman') was designed as a carpenter because the game took place on a construction site.",
        },
        {
          question: "Which legendary video game introduced the Konami Code (↑ ↑ ↓ ↓ ← → ← → B A)?",
          options: ["Contra", "Gradius", "Castlevania", "Metal Gear"],
          correctAnswer: 1,
          points: 10,
          explanation: "Developer Kazuhisa Hashimoto created the code in 1986 while testing the NES port of Gradius.",
        },
        {
          question: "What is the best-selling video game of all time with over 300 million copies sold?",
          options: ["Grand Theft Auto V", "Minecraft", "Tetris", "Wii Sports"],
          correctAnswer: 1,
          points: 10,
          explanation: "Minecraft officially crossed 300 million copies sold worldwide.",
        },
        {
          question: "In Pokémon, what type is Pikachu's primary evolutionary category?",
          options: ["Fire", "Electric", "Steel", "Normal"],
          correctAnswer: 1,
          points: 10,
          explanation: "Pikachu is the flagship Electric-type mouse Pokémon.",
        },
        {
          question: "Which studio created the Soulsborne genre, including Dark Souls and Elden Ring?",
          options: ["Capcom", "FromSoftware", "Square Enix", "Bethesda"],
          correctAnswer: 1,
          points: 10,
          explanation: "Hidetaka Miyazaki and FromSoftware revolutionized action RPGs with the Souls series.",
        },
        {
          question: "What is the name of the protagonist in the original Halo trilogy?",
          options: ["Master Chief (John-117)", "Commander Shepard", "Gordon Freeman", "Doom Slayer"],
          correctAnswer: 0,
          points: 10,
          explanation: "Master Chief Petty Officer John-117 is the Spartan hero of Halo.",
        },
      ],
    },
  ];

  for (const qData of quizzesData) {
    const createdQuiz = await prisma.quiz.create({
      data: {
        title: qData.title,
        slug: qData.slug,
        description: qData.description,
        category: qData.category,
        difficulty: qData.difficulty,
        timeLimit: qData.timeLimit,
        thumbnail: qData.thumbnail,
        questions: {
          create: qData.questions.map((q) => ({
            question: q.question,
            optionsJson: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            points: q.points,
            explanation: q.explanation,
          })),
        },
      },
    });
  }

  console.log(`Created ${quizzesData.length} quizzes with 52+ questions.`);

  // 5. Create 10 Gamification Achievements
  const achievementsData = [
    {
      key: "FIRST_GAME",
      title: "First Game Played",
      description: "Complete any interactive mini-game on Bored?",
      icon: "🎮",
      category: "GAMES",
      xpReward: 50,
    },
    {
      key: "QUIZ_STARTER",
      title: "Quiz Starter",
      description: "Take and complete your first knowledge quiz",
      icon: "🧠",
      category: "QUIZZES",
      xpReward: 50,
    },
    {
      key: "PERFECT_SCORE",
      title: "Flawless Mind",
      description: "Score 100% accuracy on any timed quiz",
      icon: "🎯",
      category: "QUIZZES",
      xpReward: 100,
    },
    {
      key: "SPEED_DEMON",
      title: "Speed Demon",
      description: "Hit an elite reaction time under 220ms in the Reflex Test",
      icon: "⚡",
      category: "GAMES",
      xpReward: 75,
    },
    {
      key: "MEMORY_MASTER",
      title: "Memory Master",
      description: "Finish the card memory challenge in under 12 moves",
      icon: "🃏",
      category: "GAMES",
      xpReward: 80,
    },
    {
      key: "RANDOM_EXPLORER",
      title: "Random Explorer",
      description: "Use the Surprise Me roulette 5 times to discover new activities",
      icon: "🎲",
      category: "EXPLORATION",
      xpReward: 60,
    },
    {
      key: "CREATIVE_SOUL",
      title: "Creative Soul",
      description: "Export an artwork from Pixel Art Studio or jam on the Soundboard",
      icon: "🎨",
      category: "CREATIVE",
      xpReward: 50,
    },
    {
      key: "DAILY_CHAMP",
      title: "Daily Champion",
      description: "Complete your first daily challenge",
      icon: "🏆",
      category: "CHALLENGES",
      xpReward: 100,
    },
    {
      key: "STREAK_7_DAYS",
      title: "Week Warrior",
      description: "Maintain a 7-day daily activity streak",
      icon: "🔥",
      category: "STREAKS",
      xpReward: 250,
    },
    {
      key: "CENTURY_CLUB",
      title: "Boredom Crusher",
      description: "Complete 100 activities across the platform",
      icon: "👑",
      category: "MILESTONES",
      xpReward: 500,
    },
  ];

  for (const ach of achievementsData) {
    const createdAch = await prisma.achievement.create({ data: ach });

    // Grant some achievements to demo user
    if (ach.key === "FIRST_GAME" || ach.key === "QUIZ_STARTER" || ach.key === "STREAK_7_DAYS") {
      await prisma.userAchievement.create({
        data: {
          userId: demoUser.id,
          achievementId: createdAch.id,
        },
      });
    }
  }

  console.log(`Created ${achievementsData.length} achievements.`);

  // 6. Create Daily Challenge for today
  const todayStr = new Date().toISOString().split("T")[0];
  const challenge = await prisma.dailyChallenge.create({
    data: {
      title: "Tri-Boredom Trifecta",
      description: "Complete 3 different activities today to earn bonus XP!",
      dateStr: todayStr,
      targetType: "ACTIVITIES_PLAYED",
      targetCount: 3,
      xpReward: 150,
    },
  });

  // Track progress for demo user
  await prisma.userChallenge.create({
    data: {
      userId: demoUser.id,
      challengeId: challenge.id,
      progress: 2,
      completed: false,
    },
  });

  console.log("Created daily challenge.");
  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
