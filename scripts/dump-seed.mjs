import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "127.0.0.1",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "bored_db",
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function dumpSeed() {
  console.log("Fetching all tables from database...");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      image: true,
      role: true,
      points: true,
      level: true,
      streak: true,
      lastActiveDate: true,
    },
  });

  const activities = await prisma.activity.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      type: true,
      thumbnail: true,
      difficulty: true,
      estimatedTime: true,
      points: true,
      playCount: true,
      rating: true,
      active: true,
    },
  });

  const quizzes = await prisma.quiz.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      category: true,
      difficulty: true,
      timeLimit: true,
      thumbnail: true,
      questions: {
        select: {
          id: true,
          question: true,
          optionsJson: true,
          correctAnswer: true,
          points: true,
          explanation: true,
        },
      },
    },
  });

  const achievements = await prisma.achievement.findMany({
    select: {
      id: true,
      key: true,
      title: true,
      description: true,
      icon: true,
      category: true,
      xpReward: true,
    },
  });

  const userAchievements = await prisma.userAchievement.findMany({
    select: {
      id: true,
      userId: true,
      achievementId: true,
    },
  });

  const dailyChallenges = await prisma.dailyChallenge.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      dateStr: true,
      targetType: true,
      targetCount: true,
      xpReward: true,
    },
  });

  const userChallenges = await prisma.userChallenge.findMany({
    select: {
      id: true,
      userId: true,
      challengeId: true,
      progress: true,
      completed: true,
    },
  });

  const gameResults = await prisma.gameResult.findMany({
    select: {
      id: true,
      userId: true,
      activityId: true,
      score: true,
      wpm: true,
      accuracy: true,
      moves: true,
      timeMs: true,
      createdAt: true,
    },
  });

  const quizResults = await prisma.quizResult.findMany({
    select: {
      id: true,
      userId: true,
      quizId: true,
      score: true,
      totalQuestions: true,
      accuracy: true,
      pointsEarned: true,
      createdAt: true,
    },
  });

  const totalQuestions = quizzes.reduce((sum, q) => sum + q.questions.length, 0);

  console.log("Summary of data to seed:");
  console.log({
    users: users.length,
    activities: activities.length,
    quizzes: quizzes.length,
    questions: totalQuestions,
    achievements: achievements.length,
    userAchievements: userAchievements.length,
    dailyChallenges: dailyChallenges.length,
    userChallenges: userChallenges.length,
    gameResults: gameResults.length,
    quizResults: quizResults.length,
  });

  const code = `import "dotenv/config";
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

const usersData = ${JSON.stringify(users, null, 2)};

const activitiesData = ${JSON.stringify(activities, null, 2)};

const quizzesData = ${JSON.stringify(quizzes, null, 2)};

const achievementsData = ${JSON.stringify(achievements, null, 2)};

const userAchievementsData = ${JSON.stringify(userAchievements, null, 2)};

const dailyChallengesData = ${JSON.stringify(dailyChallenges, null, 2)};

const userChallengesData = ${JSON.stringify(userChallenges, null, 2)};

const gameResultsData = ${JSON.stringify(gameResults, null, 2)};

const quizResultsData = ${JSON.stringify(quizResults, null, 2)};

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

  // 3. Seed Activities (Including Connect 4, Memory Game, Number Guess, etc.)
  for (const act of activitiesData) {
    await prisma.activity.create({ data: act });
  }
  console.log("Created " + activitiesData.length + " activities.");

  // 4. Seed Quizzes and All Questions
  for (const q of quizzesData) {
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
  console.log("Created " + quizzesData.length + " quizzes with all questions.");

  // 5. Seed Achievements
  for (const ach of achievementsData) {
    await prisma.achievement.create({ data: ach });
  }
  console.log("Created " + achievementsData.length + " achievements.");

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
`;

  // Backup existing seed.ts
  if (fs.existsSync("prisma/seed.ts")) {
    fs.copyFileSync("prisma/seed.ts", "prisma/seed.backup.ts");
    console.log("Backed up old seed.ts to prisma/seed.backup.ts");
  }

  fs.writeFileSync("prisma/seed.ts", code, "utf-8");
  console.log("Successfully generated prisma/seed.ts with all database data!");
}

dumpSeed()
  .catch((err) => {
    console.error("Error dumping seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
