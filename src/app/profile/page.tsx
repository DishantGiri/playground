"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  User as UserIcon, 
  Flame, 
  Trophy, 
  Gamepad2, 
  HelpCircle, 
  CheckCircle2, 
  Lock, 
  Loader2,
  Award,
  Sparkles,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { getActivityIcon } from "@/lib/icons";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const json = await res.json();
        setProfile(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading profile data...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !profile) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Join Bored? Today</h2>
        <p className="text-xs text-slate-600">
          Sign in or register an account to track your level progression, claim badges, and compete on the global leaderboard.
        </p>
        <div className="pt-2 flex gap-3">
          <Link
            href="/login"
            className="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="flex-1 py-3 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const { user, levelDetails, stats, achievements, recentGames, recentQuizzes } = profile;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-violet-100 border-2 border-violet-300 flex items-center justify-center text-2xl font-black text-violet-700 shadow-sm">
            {user.name?.slice(0, 2).toUpperCase() || "US"}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{user.name}</h1>
              <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {user.streak} Day Streak
              </span>
              <span className="text-slate-400">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Level & XP Gauge */}
        <div className="w-full md:w-72 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-violet-700">Level {levelDetails.level}</span>
            <span className="text-amber-700">{formatNumber(user.points)} XP</span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-violet-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${levelDetails.progressPercent}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 text-right">
            {levelDetails.xpUntilNextLevel} XP to Level {levelDetails.level + 1}
          </div>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mb-2">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.gamesPlayed}</div>
          <span className="text-xs text-slate-500 font-medium">Games Played</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 mb-2">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.quizzesTaken}</div>
          <span className="text-xs text-slate-500 font-medium">Quizzes Completed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalCompleted}</div>
          <span className="text-xs text-slate-500 font-medium">Unique Activities</span>
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Achievements & Badges</h3>
            <p className="text-xs text-slate-500">Unlock trophies by exploring games and reaching milestones</p>
          </div>
          <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
            {achievements.filter((a: any) => a.unlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {achievements.map((ach: any) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all ${
                ach.unlocked
                  ? "bg-violet-50/50 border-violet-200 shadow-xs"
                  : "bg-slate-50 border-slate-200 opacity-60"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-2">
                {ach.unlocked ? (
                  <Award className="w-6 h-6 text-violet-600" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{ach.title}</h4>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{ach.description}</p>
              <span className="text-[10px] font-bold text-amber-700 mt-2">+{ach.xpReward} XP</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Recent Activity History</h3>
        
        {recentGames.length === 0 && recentQuizzes.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No recent activity yet. Go play a game!</p>
        ) : (
          <div className="space-y-2">
            {recentGames.map((rg: any) => (
              <div
                key={rg.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    {getActivityIcon(rg.activity.slug, "w-4 h-4")}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{rg.activity.title}</h5>
                    <span className="text-[10px] text-slate-500">
                      {new Date(rg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-violet-700">Score: {rg.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
