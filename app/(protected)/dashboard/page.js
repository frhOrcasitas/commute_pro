"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Zap } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

const trafficStyles = {
  High:   "bg-[#D1495B]/10 text-[#D1495B] border border-[#D1495B]/20",
  Medium: "bg-[#EDAE49]/10 text-[#EDAE49] border border-[#EDAE49]/20",
  Low:    "bg-[#00798C]/10 text-[#00798C] border border-[#00798C]/20",
};

export default function Dashboard() {
  const [commutes, setCommutes] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchCommutes(); }, []);

  async function fetchCommutes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("tbl_commutes")
      .select("*")
      .eq("user_id", user.id)
      .order("date_commuted", { ascending: false })
      .order("start_time",    { ascending: false });

    setCommutes(data || []);
    setLoading(false);
  }

  const statsData = useMemo(() => {
    if (commutes.length === 0) return { avg: 0, busiest: "--", best: "--", total: 0 };

    const total = commutes.length;
    const avg   = Math.round(commutes.reduce((acc, c) => acc + (c.duration_minutes || 0), 0) / total);

    const timeFrequency = {};
    commutes.forEach(c => {
      if (!c.start_time) return;
      const [h, m] = c.start_time.split(':');
      const key = `${h.padStart(2,'0')}:${m.padStart(2,'0')}`;
      timeFrequency[key] = (timeFrequency[key] || 0) + 1;
    });

    const sortedTimes  = Object.keys(timeFrequency).sort((a, b) => timeFrequency[b] - timeFrequency[a]);
    const busiestTime  = sortedTimes[0] || "--";
    const bestEntry    = [...commutes].sort((a, b) => a.duration_minutes - b.duration_minutes)[0];
    const bestTime     = bestEntry?.start_time ? bestEntry.start_time.slice(0, 5) : "--";

    return { avg, total, busiest: busiestTime || "--", best: bestTime || "--" };
  }, [commutes]);

  const recentCommutes = commutes.slice(0, 3);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-[#30638E]" size={32} />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-10">

        {/* Header */}
        <header>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your commute activity</p>
        </header>

        {/* Stat Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard label="Average Time"   value={`${statsData.avg} min`} color="#30638E" />
          <StatCard label="Most Congested" value={statsData.busiest}      color="#D1495B" />
          <StatCard label="Total Commutes" value={statsData.total}        color="#00798C" />
          <StatCard label="Best Time"      value={statsData.best}         color="#EDAE49" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 md:gap-8">

          {/* Recent Commutes */}
          <section className="lg:col-span-7 bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Recent Commutes</h2>
            <div className="space-y-3 sm:space-y-4">
              {recentCommutes.length > 0 ? recentCommutes.map((commute) => (
                <div
                  key={commute.id}
                  className="p-3 sm:p-4 rounded-xl border border-gray-100 hover:border-[#30638E]/20 hover:bg-[#30638E]/5 transition"
                >
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(commute.date_commuted).toLocaleDateString()}
                    </p>
                    <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full font-semibold ${
                      trafficStyles[commute.traffic_level] || trafficStyles.Low
                    }`}>
                      {commute.traffic_level}
                    </span>
                  </div>
                  <p className="font-medium text-sm sm:text-base text-gray-900 truncate">
                    {commute.start_location}
                    <span className="text-gray-300 mx-1.5">→</span>
                    {commute.end_location}
                  </p>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-1">
                    <span>Started at {commute.start_time?.slice(0, 5)}</span>
                    <span className="font-medium text-[#30638E]">{commute.duration_minutes} mins</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 sm:py-12 border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-gray-400 text-sm">No commutes logged yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* AI Suggestion */}
          <div className="lg:col-span-5">
            <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden h-full">
              <div className="flex items-center gap-2 mb-5 sm:mb-6">
                <Zap size={17} className="text-[#EDAE49] fill-[#EDAE49]" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">AI Suggestion</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <SuggestionRow label="Best Departure"    value={statsData.best} />
                <div className="h-px bg-gray-50" />
                <SuggestionRow
                  label="Estimated Savings"
                  value={commutes.length > 5 ? `${Math.abs(statsData.avg - 15)} mins` : "Calculating…"}
                  valueClass="text-[#00798C] font-semibold"
                />
                <div className="h-px bg-gray-50" />
                <SuggestionRow label="Target Departure" value={statsData.best} />
              </div>

              {/* Background flair */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.04] pointer-events-none">
                <Zap size={120} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div
      className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <p className="text-xs sm:text-sm text-gray-500 leading-tight">{label}</p>
      <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1.5 sm:mt-2">{value}</p>
    </div>
  );
}

function SuggestionRow({ label, value, valueClass = "font-medium text-gray-900" }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}