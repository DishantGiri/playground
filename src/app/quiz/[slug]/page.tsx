import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizPlayer } from "@/components/quizzes/QuizPlayer";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArrowLeft, Clock, HelpCircle } from "lucide-react";
import { getQuizIcon } from "@/lib/icons";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { slug } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    include: {
      questions: true,
    },
  });

  if (!quiz) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Quiz Top Navigation */}
      <div className="space-y-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Explore</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
              {getQuizIcon(quiz.slug, "w-7 h-7")}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  {quiz.category}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {quiz.difficulty}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {quiz.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
            <div className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-600" />
              <span>{quiz.questions.length} Questions</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-violet-600" />
              <span>{quiz.timeLimit}s / Q</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quiz Engine */}
      <QuizPlayer quiz={quiz} />

      {/* Non-intrusive Ad Banner */}
      <div className="pt-8">
        <AdSlot placement="banner" />
      </div>
    </div>
  );
}
