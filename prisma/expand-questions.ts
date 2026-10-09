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

interface QuestionSeed {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  explanation: string;
}

const NEW_QUESTIONS: Record<string, QuestionSeed[]> = {
  "general-knowledge-blitz": [
    {
      question: "Which sea is considered the saltiest water body in the world?",
      options: ["Dead Sea", "Red Sea", "Baltic Sea", "Mediterranean Sea"],
      correctAnswer: 0,
      points: 10,
      explanation: "The Dead Sea is nearly 10 times saltier than the ocean, making it so buoyant people easily float.",
    },
    {
      question: "What is the capital of Australia?",
      options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
      correctAnswer: 2,
      points: 10,
      explanation: "Canberra was chosen as the compromise capital between rivals Sydney and Melbourne in 1908.",
    },
    {
      question: "How many hearts does an octopus have?",
      options: ["1", "2", "3", "4"],
      correctAnswer: 2,
      points: 10,
      explanation: "Octopuses have 3 hearts: two pump blood to the gills and one pumps blood to the rest of the body.",
    },
    {
      question: "What is the brightest star in the night sky?",
      options: ["North Star (Polaris)", "Sirius", "Betelgeuse", "Vega"],
      correctAnswer: 1,
      points: 10,
      explanation: "Sirius (the Dog Star) is the brightest star in Earth's night sky.",
    },
    {
      question: "Which element has the atomic number 1?",
      options: ["Helium", "Oxygen", "Hydrogen", "Carbon"],
      correctAnswer: 2,
      points: 10,
      explanation: "Hydrogen has 1 proton, giving it atomic number 1.",
    },
    {
      question: "In what year did the Titanic sink in the North Atlantic Ocean?",
      options: ["1905", "1912", "1918", "1923"],
      correctAnswer: 1,
      points: 10,
      explanation: "The Titanic sank on the night of April 14–15, 1912 on its maiden voyage.",
    },
    {
      question: "What is the largest internal organ in the human body?",
      options: ["Heart", "Brain", "Liver", "Lungs"],
      correctAnswer: 2,
      points: 10,
      explanation: "The liver is the heaviest and largest internal organ, weighing about 1.5 kg.",
    },
    {
      question: "What currency is officially used in Japan?",
      options: ["Won", "Yen", "Yuan", "Ringgit"],
      correctAnswer: 1,
      points: 10,
      explanation: "The Japanese Yen (JPY) is the third most traded currency in the world.",
    },
    {
      question: "Who painted the famous masterpiece 'The Starry Night'?",
      options: ["Pablo Picasso", "Vincent van Gogh", "Claude Monet", "Salvador Dalí"],
      correctAnswer: 1,
      points: 10,
      explanation: "Vincent van Gogh painted The Starry Night in June 1889 from his asylum room in Saint-Rémy.",
    },
    {
      question: "What is the tallest mountain in the world when measured base to peak?",
      options: ["Mount Everest", "Mauna Kea", "K2", "Kilimanjaro"],
      correctAnswer: 1,
      points: 10,
      explanation: "Mauna Kea in Hawaii is over 10,210 meters tall from its underwater oceanic base.",
    },
  ],

  "impossible-quiz": [
    {
      question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
      options: ["A blink", "The letter 'M'", "A shadow", "A second"],
      correctAnswer: 1,
      points: 15,
      explanation: "The letter 'M' appears once in 'minute', twice in 'moment', and zero times in 'thousand years'.",
    },
    {
      question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      options: ["An echo", "A kite", "A whisper", "A cloud"],
      correctAnswer: 0,
      points: 15,
      explanation: "An echo responds without vocal cords and carries through the air.",
    },
    {
      question: "A clerk in a butcher shop is 5 feet 10 inches tall and wears size 11 shoes. What does he weigh?",
      options: ["175 lbs", "Meat", "210 lbs", "Feathers"],
      correctAnswer: 1,
      points: 15,
      explanation: "He's a butcher, so he weighs meat!",
    },
    {
      question: "Forward I am heavy, but backward I am not. What am I?",
      options: ["A ton", "A lead weight", "The word 'not'", "The word 'ton'"],
      correctAnswer: 3,
      points: 15,
      explanation: "The word 'ton' spelled backward is 'not'!",
    },
    {
      question: "What has a head and a tail, but no body?",
      options: ["A coin", "A snake", "A comet", "A needle"],
      correctAnswer: 0,
      points: 15,
      explanation: "A coin has a heads side and a tails side, but no torso or legs.",
    },
    {
      question: "What can you break, even if you never pick it up or touch it?",
      options: ["Glass", "A promise", "Silence", "A mirror"],
      correctAnswer: 1,
      points: 15,
      explanation: "You can break a promise (or a vow) without physically touching anything.",
    },
    {
      question: "If there are three apples and you take away two, how many apples do you have?",
      options: ["One", "Two", "Three", "Zero"],
      correctAnswer: 1,
      points: 15,
      explanation: "You took two apples, so you have two apples!",
    },
    {
      question: "What five-letter word becomes shorter when you add two letters to it?",
      options: ["Small", "Brief", "Short", "Quick"],
      correctAnswer: 2,
      points: 15,
      explanation: "The word 'short' becomes 'shorter' (+er).",
    },
    {
      question: "Which weighs more: a pound of feathers or a pound of gold?",
      options: ["A pound of feathers", "A pound of gold", "They weigh the exact same", "It depends on altitude"],
      correctAnswer: 0,
      points: 15,
      explanation: "Feathers are weighed in avoirdupois pounds (453.6 g), while gold uses troy pounds (373.2 g)! Feathers are heavier!",
    },
  ],

  "guess-the-country": [
    {
      question: "Which country's flag features a red maple leaf at its center?",
      options: ["Canada", "Norway", "Denmark", "Lebanon"],
      correctAnswer: 0,
      points: 10,
      explanation: "Canada adopted the iconic 11-pointed red maple leaf flag in 1965.",
    },
    {
      question: "What is the capital of Brazil?",
      options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"],
      correctAnswer: 2,
      points: 10,
      explanation: "Brasília was constructed in 1960 to move the capital inland.",
    },
    {
      question: "Which country is home to the ancient Incan citadel of Machu Picchu?",
      options: ["Bolivia", "Peru", "Chile", "Ecuador"],
      correctAnswer: 1,
      points: 10,
      explanation: "Machu Picchu is situated high in the Andes mountains in southern Peru.",
    },
    {
      question: "Which nation's national flag is the only one in the world that is non-quadrilateral (double-pennant)?",
      options: ["Bhutan", "Nepal", "Switzerland", "Vatican City"],
      correctAnswer: 1,
      points: 10,
      explanation: "Nepal's flag is the only non-rectangular national flag in the world.",
    },
    {
      question: "What is the capital of Iceland?",
      options: ["Oslo", "Reykjavík", "Helsinki", "Bergen"],
      correctAnswer: 1,
      points: 10,
      explanation: "Reykjavík is the northernmost capital of a sovereign state in the world.",
    },
    {
      question: "Which country has the most natural lakes in the world?",
      options: ["Finland", "Russia", "Canada", "Sweden"],
      correctAnswer: 2,
      points: 10,
      explanation: "Canada contains over 879,000 lakes, more than all other countries combined.",
    },
    {
      question: "What is the capital city of Kenya?",
      options: ["Mombasa", "Nairobi", "Kampala", "Addis Ababa"],
      correctAnswer: 1,
      points: 10,
      explanation: "Nairobi is known as the 'Green City in the Sun'.",
    },
    {
      question: "Which country consists of over 17,000 tropical islands, making it the world's largest archipelagic state?",
      options: ["Philippines", "Indonesia", "Maldives", "Fiji"],
      correctAnswer: 1,
      points: 10,
      explanation: "Indonesia spans over 17,508 islands across Southeast Asia and Oceania.",
    },
  ],

  "nostalgia-quiz": [
    {
      question: "Which handheld virtual pet toy took the late 90s by storm with feeding and cleaning mini-beeps?",
      options: ["Furby", "Tamagotchi", "Giga Pet", "Poo-Chi"],
      correctAnswer: 1,
      points: 10,
      explanation: "Bandai launched Tamagotchi in 1996, selling over 80 million units worldwide.",
    },
    {
      question: "What sound greeted dial-up internet users trying to connect in the 1990s?",
      options: ["Bleep-screech dial modem handshake", "A loud fog horn", "A ticking analog clock", "A whistle chime"],
      correctAnswer: 0,
      points: 10,
      explanation: "The iconic 56k screech-and-static handshake negotiated analog audio carrier frequencies.",
    },
    {
      question: "Which instant messaging application made the famous 'Uh-oh!' audio alert sound?",
      options: ["AIM (AOL Instant Messenger)", "ICQ", "MSN Messenger", "Yahoo! Messenger"],
      correctAnswer: 1,
      points: 10,
      explanation: "ICQ featured the world-famous 'Uh-oh!' sound whenever a message arrived.",
    },
    {
      question: "What was the default background wallpaper called in Microsoft Windows XP?",
      options: ["Serenity", "Bliss", "Autumn Calm", "Azure Vista"],
      correctAnswer: 1,
      points: 10,
      explanation: "'Bliss' is an unedited photograph of Sonoma County green hills taken by Charles O'Rear in 1996.",
    },
    {
      question: "Which handheld Nintendo console was released in 1989 and bundled with Tetris?",
      options: ["Game & Watch", "Game Boy", "Game Boy Color", "Virtual Boy"],
      correctAnswer: 1,
      points: 10,
      explanation: "The monochrome Game Boy revolutionized portable gaming with Tetris.",
    },
    {
      question: "What video rental giant dominated Friday nights before Netflix and streaming took over?",
      options: ["Blockbuster Video", "Hollywood Video", "Family Video", "Redbox"],
      correctAnswer: 0,
      points: 10,
      explanation: "Blockbuster had over 9,000 stores at its peak with the motto 'Be Kind, Rewind'.",
    },
    {
      question: "What was the name of the animated paperclip assistant in Microsoft Office 97 to 2003?",
      options: ["Pinny", "Clippy", "Helper Bob", "Office Pal"],
      correctAnswer: 1,
      points: 10,
      explanation: "Clippy (Clippit) popped up with 'It looks like you're writing a letter!'",
    },
  ],

  "science-wonders": [
    {
      question: "How long does light from the Sun take to reach Earth?",
      options: ["8 seconds", "8 minutes and 20 seconds", "8 hours", "Instantly"],
      correctAnswer: 1,
      points: 10,
      explanation: "At 300,000 km/s across 150 million kilometers, photons take roughly 8 minutes and 20 seconds.",
    },
    {
      question: "What is the powerhouse organelle of the eukaryotic cell?",
      options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
      correctAnswer: 2,
      points: 10,
      explanation: "Mitochondria generate most of the chemical energy needed by the cell (ATP).",
    },
    {
      question: "What is the only letter that does NOT appear on the periodic table of elements?",
      options: ["Q", "J", "X", "Z"],
      correctAnswer: 1,
      points: 10,
      explanation: "The letter 'J' does not appear in any chemical element symbol on the periodic table.",
    },
    {
      question: "Which gas makes up roughly 78% of Earth's atmosphere?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
      correctAnswer: 1,
      points: 10,
      explanation: "Nitrogen makes up ~78%, oxygen is ~21%, and argon is ~0.93%.",
    },
    {
      question: "What phenomenon happens when a massive star collapses under its own gravity at the end of its life?",
      options: ["Black hole or Neutron Star", "Comet explosion", "Solar eclipse", "Nebular freeze"],
      correctAnswer: 0,
      points: 10,
      explanation: "A supernova core collapse forms either an ultra-dense neutron star or a black hole singularity.",
    },
    {
      question: "At what temperature are Fahrenheit and Celsius equal to each other?",
      options: ["0 degrees", "-40 degrees", "32 degrees", "-100 degrees"],
      correctAnswer: 1,
      points: 10,
      explanation: "-40°C equals -40°F (-40 × 9/5 + 32 = -72 + 32 = -40).",
    },
  ],

  "movie-buff": [
    {
      question: "Which movie won the Academy Award for Best Picture in 1994, beating Pulp Fiction and The Shawshank Redemption?",
      options: ["Forrest Gump", "Speed", "The Lion King", "Quiz Show"],
      correctAnswer: 0,
      points: 10,
      explanation: "Forrest Gump took home 6 Oscars, including Best Picture, Best Director, and Best Actor.",
    },
    {
      question: "In The Matrix (1999), what color pill does Neo take to wake up in the real world?",
      options: ["Blue", "Red", "Green", "Yellow"],
      correctAnswer: 1,
      points: 10,
      explanation: "Morpheus offers the blue pill to remain asleep, or the red pill to see how deep the rabbit hole goes.",
    },
    {
      question: "Who directed the groundbreaking sci-fi epics Interstellar, Inception, and Oppenheimer?",
      options: ["Denis Villeneuve", "Christopher Nolan", "Steven Spielberg", "Ridley Scott"],
      correctAnswer: 1,
      points: 10,
      explanation: "Christopher Nolan directed these visionary films known for practical effects and non-linear timelines.",
    },
    {
      question: "What is the highest-grossing box office movie of all time (unadjusted for inflation)?",
      options: ["Avengers: Endgame", "Avatar", "Titanic", "Star Wars: The Force Awakens"],
      correctAnswer: 1,
      points: 10,
      explanation: "James Cameron's Avatar (2009) holds the top spot with over $2.92 billion.",
    },
    {
      question: "What is the name of the fictional kingdom ruled by King T'Challa in Marvel's Black Panther?",
      options: ["Genosha", "Latveria", "Wakanda", "Sokovia"],
      correctAnswer: 2,
      points: 10,
      explanation: "Wakanda is the technologically advanced, vibranium-rich African nation.",
    },
  ],

  "bizarre-true-false": [
    {
      question: "True or False: Bananas are technically radioactive.",
      options: ["True", "False"],
      correctAnswer: 0,
      points: 10,
      explanation: "True! Bananas contain potassium-40, a naturally occurring radioactive isotope (completely harmless).",
    },
    {
      question: "True or False: Honey never spoils and edible 3,000-year-old honey was found in ancient Egyptian tombs.",
      options: ["True", "False"],
      correctAnswer: 0,
      points: 10,
      explanation: "True! Honey's low moisture content and high acidity prevent bacteria from surviving.",
    },
    {
      question: "True or False: Humans share about 50% of their DNA with a banana.",
      options: ["True", "False"],
      correctAnswer: 0,
      points: 10,
      explanation: "True! About 50% of human genes have homologs in bananas that control basic cellular replication.",
    },
    {
      question: "True or False: A cloud can weigh over one million pounds.",
      options: ["True", "False"],
      correctAnswer: 0,
      points: 10,
      explanation: "True! A typical cumulus cloud weighs around 500,000 kg (1.1 million pounds) due to its water droplet volume.",
    },
    {
      question: "True or False: Lightning never strikes the same place twice.",
      options: ["True", "False"],
      correctAnswer: 1,
      points: 10,
      explanation: "False! Tall structures like the Empire State Building are struck by lightning 20 to 25 times every year.",
    },
    {
      question: "True or False: Wombat poop is cube-shaped.",
      options: ["True", "False"],
      correctAnswer: 0,
      points: 10,
      explanation: "True! Wombats are the only known animals with cubic feces, shaped by the elastic grooves of their intestines.",
    },
  ],

  "gaming-legends": [
    {
      question: "Which video game was the first to feature the iconic 'Konami Code' (↑ ↑ ↓ ↓ ← → ← → B A)?",
      options: ["Contra", "Gradius", "Castlevania", "Metal Gear"],
      correctAnswer: 1,
      points: 10,
      explanation: "Kazuhisa Hashimoto invented the cheat code while testing Gradius on the NES in 1986.",
    },
    {
      question: "What is the best-selling video game of all time with over 300 million copies sold?",
      options: ["Grand Theft Auto V", "Minecraft", "Tetris", "Wii Sports"],
      correctAnswer: 1,
      points: 10,
      explanation: "Mojang's Minecraft crossed 300 million copies sold in late 2023.",
    },
    {
      question: "What was Mario's original profession in the 1981 arcade game Donkey Kong?",
      options: ["Plumber", "Carpenter", "Architect", "Electrician"],
      correctAnswer: 1,
      points: 10,
      explanation: "Mario was known as 'Jumpman' and was a carpenter because the game took place on a construction site.",
    },
    {
      question: "Which legendary video game opening begins with the line: 'Hey, you. You're finally awake.'?",
      options: ["Fallout: New Vegas", "The Elder Scrolls V: Skyrim", "The Witcher 3", "Dark Souls"],
      correctAnswer: 1,
      points: 10,
      explanation: "Ralof's iconic line opens Skyrim on the wagon to Helgen.",
    },
    {
      question: "In Pokémon Red & Blue, which Pokémon is numbered #001 in the National Pokédex?",
      options: ["Pikachu", "Charmander", "Bulbasaur", "Mew"],
      correctAnswer: 2,
      points: 10,
      explanation: "Bulbasaur holds the #001 spot in the Kanto and National Pokédex.",
    },
    {
      question: "What was the first commercial home video game console ever released (1972)?",
      options: ["Atari 2600", "Magnavox Odyssey", "Coleco Telstar", "Intellivision"],
      correctAnswer: 1,
      points: 10,
      explanation: "The Magnavox Odyssey, engineered by Ralph Baer, debuted in 1972.",
    },
  ],
};

async function seedMoreQuestions() {
  console.log("Expanding quiz question pools...");

  for (const [slug, questions] of Object.entries(NEW_QUESTIONS)) {
    const quiz = await prisma.quiz.findUnique({
      where: { slug },
      include: { questions: true },
    });

    if (!quiz) {
      console.log(`Quiz ${slug} not found, skipping.`);
      continue;
    }

    const existingQuestionTexts = new Set(quiz.questions.map((q) => q.question.toLowerCase().trim()));

    let addedCount = 0;
    for (const q of questions) {
      if (!existingQuestionTexts.has(q.question.toLowerCase().trim())) {
        await prisma.question.create({
          data: {
            quizId: quiz.id,
            question: q.question,
            optionsJson: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            points: q.points,
            explanation: q.explanation,
          },
        });
        addedCount++;
      }
    }

    console.log(`Quiz [${slug}]: Added ${addedCount} new questions. Total now: ${quiz.questions.length + addedCount}`);
  }

  const finalCount = await prisma.question.count();
  console.log(`Done! Total questions in database across all quizzes: ${finalCount}`);
  process.exit(0);
}

seedMoreQuestions().catch((e) => {
  console.error("Error expanding questions:", e);
  process.exit(1);
});
