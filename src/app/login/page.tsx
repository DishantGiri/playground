"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dices, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/profile");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-sm">
              <Dices className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              BORED<span className="text-violet-600">?</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500">
            Sign in to track your XP, preserve daily streaks, and view achievements.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-violet-600 hover:bg-violet-700 active:scale-98 transition-all shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Quick Demo Logins:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo("alex@example.com", "password123")}
              className="flex-1 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Demo User
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@bored.app", "admin123")}
              className="flex-1 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[11px] font-semibold text-amber-800 border border-amber-200 transition-colors cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>

        <div className="text-center space-y-2 pt-2">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-violet-600 font-bold hover:underline">
              Sign Up
            </Link>
          </p>
          <div>
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
              Continue playing as Anonymous Guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
