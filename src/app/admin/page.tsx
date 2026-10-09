"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  ShieldCheck, 
  BarChart3, 
  Gamepad2, 
  Users, 
  DollarSign, 
  Plus, 
  Trash2, 
  Power, 
  Loader2, 
  AlertCircle,
  Star,
} from "lucide-react";
import { getActivityIcon } from "@/lib/icons";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"analytics" | "activities" | "users">("analytics");

  // New activity form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("GAME");
  const [newType, setNewType] = useState("MINI_GAME");
  const [newDifficulty, setNewDifficulty] = useState("EASY");
  const [newTime, setNewTime] = useState("2 min");
  const [newPoints, setNewPoints] = useState(20);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAdminData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, actRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/activities"),
      ]);

      if (statsRes.status === 403 || actRes.status === 403) {
        setError("Access Denied: You must be an administrator to view this dashboard.");
        return;
      }

      const statsData = await statsRes.json();
      const actData = await actRes.json();

      setStats(statsData);
      setActivities(actData.activities || []);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await fetch("/api/admin/activities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !currentActive } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    try {
      await fetch(`/api/admin/activities?id=${id}`, {
        method: "DELETE",
      });
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug || newTitle.toLowerCase().replace(/\s+/g, "-"),
          description: newDesc,
          category: newCategory,
          type: newType,
          thumbnail: "activity",
          difficulty: newDifficulty,
          estimatedTime: newTime,
          points: newPoints,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        <p className="text-xs text-slate-500">Verifying administrative access...</p>
      </div>
    );
  }

  if (error || (session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white border border-rose-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-600">
          {error || "Your account does not have permission to access the control panel."}
        </p>
        <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          Tip: Log in with <span className="text-violet-700 font-mono font-bold">admin@bored.app</span> / <span className="text-violet-700 font-mono font-bold">admin123</span> to manage platform content.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-md shadow-violet-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Activity</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab("activities")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "activities"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Activities ({activities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users ({stats?.analytics?.totalUsers || 0})</span>
        </button>
      </div>

      {/* Tab: Analytics */}
      {activeTab === "analytics" && stats && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] uppercase font-bold text-slate-500">Total Users</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {stats.analytics.totalUsers}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">+12% this week</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] uppercase font-bold text-slate-500">Total Plays</span>
              <div className="text-2xl font-black text-violet-700 mt-1">
                {stats.analytics.totalPlays.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">Games & Quizzes</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] uppercase font-bold text-slate-500">Ad Impressions</span>
              <div className="text-2xl font-black text-cyan-700 mt-1">
                {stats.analytics.estimatedAdImpressions.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">Banners & Rewarded</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] uppercase font-bold text-slate-500">Est. Ad Revenue</span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {stats.analytics.estimatedAdRevenue}
              </div>
              <span className="text-[11px] text-amber-800 font-semibold">CPM ~$3.50</span>
            </div>
          </div>

          {/* Top Activities */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Top Performing Activities</h3>
            <div className="space-y-2">
              {stats.topActivities.map((act: any, i: number) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-400">#{i + 1}</span>
                    <span className="font-bold text-slate-900">{act.title}</span>
                    <span className="text-[10px] text-violet-700 bg-violet-100 px-2 py-0.5 rounded font-bold">
                      {act.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 font-medium">
                    <span>Plays: {act.playCount.toLocaleString()}</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {act.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Activities */}
      {activeTab === "activities" && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Plays</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                        {getActivityIcon(a.slug, "w-4 h-4")}
                      </div>
                      <span>{a.title}</span>
                    </td>
                    <td className="py-3.5">{a.category}</td>
                    <td className="py-3.5 text-slate-500">{a.type}</td>
                    <td className="py-3.5">{a.estimatedTime}</td>
                    <td className="py-3.5">{a.playCount.toLocaleString()}</td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {a.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleActive(a.id, a.active)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Toggle Active"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(a.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === "users" && stats && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-2">
            {stats.recentUsers.map((u: any) => (
              <div
                key={u.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{u.name}</span>
                    <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {u.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{u.email}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-700">{u.points.toLocaleString()} XP</span>
                  <div className="text-[10px] text-slate-500">Lv. {u.level}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Create New Activity</h3>

            <form onSubmit={handleCreateActivity} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Speed Typing Challenge"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  required
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Short engaging description..."
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                  >
                    <option value="GAME">GAME</option>
                    <option value="QUIZ">QUIZ</option>
                    <option value="FUN">FUN</option>
                    <option value="CREATIVE">CREATIVE</option>
                    <option value="RANDOM">RANDOM</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                  >
                    <option value="MINI_GAME">MINI_GAME</option>
                    <option value="TRIVIA">TRIVIA</option>
                    <option value="PERSONALITY_TEST">PERSONALITY_TEST</option>
                    <option value="WOULD_YOU_RATHER">WOULD_YOU_RATHER</option>
                    <option value="REACTION_TEST">REACTION_TEST</option>
                    <option value="PIXEL_ART">PIXEL_ART</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Points</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(parseInt(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500 text-center"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
