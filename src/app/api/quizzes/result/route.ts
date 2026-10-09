import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardUserPointsAndCheckAchievements, POINTS_CONFIG } from "@/lib/gamification";

const QuizSubmitSchema = z.object({
  quizSlug: z.string(),
  answers: z.record(z.string(), z.number().int().nonnegative()),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body = await req.json();
    const parsed = QuizSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quiz submission payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { quizSlug, answers } = parsed.data;

    const quiz = await prisma.quiz.findUnique({
      where: { slug: quizSlug },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const answeredKeys = Object.keys(answers);
    const relevantQuestions = answeredKeys.length > 0
      ? quiz.questions.filter((q) => answeredKeys.includes(q.id))
      : quiz.questions;

    const totalQuestions = relevantQuestions.length;
    if (totalQuestions === 0) {
      return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 });
    }

    // Evaluate answers strictly on the server
    let correctCount = 0;
    const reviewDetails: Array<{
      questionId: string;
      question: string;
      selected: number | undefined;
      correct: number;
      isCorrect: boolean;
      explanation: string | null;
    }> = [];

    for (const q of relevantQuestions) {
      const userSelected = answers[q.id];
      const isCorrect = userSelected === q.correctAnswer;
      if (isCorrect) {
        correctCount += 1;
      }

      reviewDetails.push({
        questionId: q.id,
        question: q.question,
        selected: userSelected,
        correct: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const isPerfect = correctCount === totalQuestions;

    let pointsEarned = correctCount * 10;
    if (isPerfect) {
      pointsEarned += POINTS_CONFIG.PERFECT_QUIZ;
    } else {
      pointsEarned += POINTS_CONFIG.COMPLETE_QUIZ;
    }

    // Record QuizResult
    await prisma.quizResult.create({
      data: {
        userId: userId || null,
        quizId: quiz.id,
        score: correctCount,
        totalQuestions,
        accuracy,
        pointsEarned,
      },
    });

    // Calculate percentile ranking against previous attempts
    const totalPreviousResults = await prisma.quizResult.count({
      where: { quizId: quiz.id },
    });
    const lowerResults = await prisma.quizResult.count({
      where: { quizId: quiz.id, score: { lt: correctCount } },
    });

    const percentile =
      totalPreviousResults > 1
        ? Math.min(99, Math.max(15, Math.round((lowerResults / totalPreviousResults) * 100)))
        : Math.round((correctCount / totalQuestions) * 90);

    // Gamification for authenticated users
    let gamificationResult = null;
    if (userId) {
      gamificationResult = await awardUserPointsAndCheckAchievements(
        userId,
        pointsEarned,
        {
          isPerfectQuiz: isPerfect,
        }
      );
    }

    return NextResponse.json({
      success: true,
      score: correctCount,
      totalQuestions,
      accuracy,
      percentile,
      pointsEarned,
      isPerfect,
      reviewDetails,
      user: gamificationResult?.user,
      newUnlockedAchievements: gamificationResult?.newUnlockedAchievements || [],
      dailyChallengeCompleted: gamificationResult?.dailyChallengeCompleted || false,
      isGuest: !userId,
    });
  } catch (error: any) {
    console.error("Quiz evaluation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
