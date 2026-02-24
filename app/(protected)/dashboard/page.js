"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Zap } from "lucide-react"; // Swapped Plus for Zap for AI feel
import { supabase } from "@/app/lib/supabaseClient";

export default function Dashboard() {
  const [commutes, setCommutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommutes();
  }, []);

  async function fetchCommutes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tbl_commutes")
      .select("*")
      .eq("user_id", user.id)
      .order("date_commuted", { ascending: false })
      .order("start_time", { ascending: false });

    setCommutes(data || []);
    setLoading(false);
  }

  const statsData = useMemo(() => {
    if (commutes.length === 0) return { avg: 0, busiest: "--", best: "--", total: 0 };

    const total = commutes.length;
    const avg = Math.round(commutes.reduce((acc, c) => acc + (c.duration_minutes || 0), 0) / total);

    const timeFrequency = {};
    commutes.forEach(c => {
      if (!c.start_time) return;

      const parts = c.start_time.split(':');
      const h = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const timeKey = `${h}:${m}`;

      timeFrequency[timeKey] = (timeFrequency[timeKey] || 0) + 1;
    });

    const sortedTimes = Object.keys(timeFrequency).sort((a, b) => timeFrequency[b] - timeFrequency[a]);
    const busiestTime = sortedTimes[0] || "--";
    
    // Find the commute with the absolute lowest duration for "Best Time"
    const bestEntry = [...commutes].sort((a, b) => a.duration_minutes - b.duration_minutes)[0];
    const bestTime = bestEntry?.start_time ? bestEntry?.start_time?.slice(0, 5) : "--";

    return {
      avg, total,
      busiest: busiestTime || "--",
      best: bestTime || "--"
    };
  }, [commutes]);

  const recentCommutes = commutes.slice(0, 3);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <header>
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your commute activity</p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Average Time" value={`${statsData.avg} min`} />
          <StatCard label="Most Congested" value={statsData.busiest} />
          <StatCard label="Total Commutes" value={statsData.total} />
          <StatCard label="Best Time" value={statsData.best} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Commutes List */}
          <section className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Commutes</h2>
            <div className="space-y-4">
              {recentCommutes.length > 0 ? recentCommutes.map((commute) => (
                <div key={commute.id} className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">{new Date(commute.date_commuted).toLocaleDateString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        commute.traffic_level === "High" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    }`}>
                      {commute.traffic_level}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{commute.start_location} → {commute.end_location}</p>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Started at {commute.start_time?.slice(0, 5)}</span>
                    <span>{commute.duration_minutes} mins</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-400">No commutes logged yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* AI Suggestion Side Block */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <Zap size={18} className="text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">AI Suggestion</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Best Departure</span>
                  <span className="font-medium text-gray-900">{statsData.best}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estimated Savings</span>
                  <span className="font-medium text-emerald-600">
                    {commutes.length > 5 ? `${Math.abs(statsData.avg - 15)} mins` : 'Calculating...'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target Departure</span>
                  <span className="font-medium text-gray-900">{statsData.best}</span>
                </div>
              </div>
              {/* Subtle background flair */}
              <div className="absolute -right-4 -bottom-4 opacity-5">
                 <Zap size={120} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
    </div>
  );
}