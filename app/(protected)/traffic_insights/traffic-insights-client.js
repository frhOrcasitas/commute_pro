"use client";

import { Inspect, Sparkles } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect, useMemo } from "react";

export default function TrafficInsights() {
  const [commutes,   setCommutes]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [aiInsight,  setAiInsight]  = useState("");
  const [loadingAi,  setLoadingAi]  = useState(false);

  const getAiAdvice = async () => {
    if (commutes.length === 0) return alert("Log some commutes first!");
    setLoadingAi(true);
    try {
      const res  = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commutes }),
      });
      const data = await res.json();
      if (res.ok) { setAiInsight(data.insight); sendSystemAlert(data.insight); }
      else setAiInsight("Unable to calculate stats at this time.");
    } catch {
      setAiInsight("Error loading data insights.");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    async function getInsights() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("tbl_commutes").select("*").eq("user_id", user.id);
      setCommutes(data || []);
      setLoading(false);
    }
    getInsights();
  }, []);

  const weeklyData = useMemo(() => {
    const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const stats = days.map((day) => ({ day, avgDuration: 0, count: 0 }));
    commutes.forEach((c) => {
      const i = new Date(c.date_commuted).getDay();
      stats[i].avgDuration += c.duration_minutes || 0;
      stats[i].count += 1;
    });
    return stats.map((s) => ({ day: s.day, duration: s.count > 0 ? Math.round(s.avgDuration / s.count) : 0 }));
  }, [commutes]);

  const insights = useMemo(() => {
    if (!commutes || commutes.length === 0) return { peakWindow: "--", busiestDay: "--", avgDelay: 0, tips: [] };

    const days      = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayCounts = {};
    let totalDelay = 0, tripsWithData = 0;

    commutes.forEach((c) => {
      const day  = days[new Date(c.date_commuted).getDay()];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
      const actual = c.duration_minutes || 0;
      const ideal  = c.estimated_duration_minutes ? c.estimated_duration_minutes : Math.round((c.distance_km / 35) * 60);
      if (actual > 0) { totalDelay += Math.max(0, actual - ideal); tripsWithData++; }
    });

    const avgDelay    = tripsWithData > 0 ? Math.round(totalDelay / tripsWithData) : 0;
    const busiestDay  = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b, "--");

    const minuteBuckets = {};
    commutes.forEach((c) => {
      if (!c.start_time) return;
      const [h, m] = c.start_time.split(":");
      const key = `${h.padStart(2,"0")}:${m.padStart(2,"0")}`;
      minuteBuckets[key] = (minuteBuckets[key] || 0) + 1;
    });

    const topMinute = Object.keys(minuteBuckets).sort((a, b) => minuteBuckets[b] - minuteBuckets[a])[0] || "00:00";
    const [peakH, peakM] = topMinute.split(":").map(Number);
    const dateObj = new Date();
    dateObj.setHours(peakH, peakM);
    const startStr = new Date(dateObj.getTime() - 15 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    const endStr   = new Date(dateObj.getTime() + 30 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

    const tips = [];
    if (avgDelay > 10) tips.push(`AI Alert: High delays (${avgDelay}m). Consider leaving before ${startStr}.`);
    else tips.push(`Your routes are currently efficient with only ${avgDelay}m of delay.`);
    tips.push(`${busiestDay} is your most frequent commute day.`);

    return { peakWindow: `${startStr} - ${endStr}`, busiestDay, tips, peakH, avgDelay };
  }, [commutes]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i.toString().padStart(2,"0")}:00`, count: 0 }));
    commutes.forEach((c) => {
      if (!c.start_time) return;
      hours[parseInt(c.start_time.split(":")[0])].count += 1;
    });
    return hours.filter((h) => h.count > 0 || (h.hour > "06:00" && h.hour < "22:00"));
  }, [commutes]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const sendSystemAlert = (text) => {
    if (Notification.permission === "granted") new Notification("Commute Strategy Found", { body: text, icon: "/favicon.ico" });
  };

  const avgDuration = commutes.length
    ? Math.round(commutes.reduce((acc, c) => acc + (c.duration_minutes || 0), 0) / commutes.length)
    : 0;

  if (loading) return (
    <div className="p-4 sm:p-8 text-zinc-500">Calculating insights…</div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-10 text-black">

      {/* Header */}
      <header className="space-y-1.5 sm:space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
          {getGreeting()}, here are your Traffic Insights
        </h1>
        <p className="text-zinc-500 text-sm max-w-2xl">
          Based on {commutes.length} recorded trips, your most efficient departure window is{" "}
          <span className="font-semibold text-zinc-900">before {insights.peakWindow.split(" - ")[0]}</span>.
        </p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <InsightCard title="Busiest Day"   value={insights.busiestDay}         sub={`${commutes.length} entries analyzed`} color="#D1495B" />
        <InsightCard title="Peak Window"   value={insights.peakWindow}         sub="Peak traffic interval"                  color="#EDAE49" />
        <InsightCard title="Avg Duration"  value={`${avgDuration} min`}                                                     color="#30638E" />
        <InsightCard title="Avg Delay"     value={`${insights.avgDelay} min`}  sub="Lost to traffic vs Map Estimate"        color="#00798C" />
      </div>

      {/* AI block */}
      <div className="bg-[#30638E] rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl flex-shrink-0">
            <Inspect className="w-5 h-5 sm:w-6 sm:h-6 text-[#EDAE49]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Smart Traffic Analysis</h3>
            <p className="text-white/70 text-xs sm:text-sm max-w-xl mt-0.5">
              {aiInsight || "Click the button to analyze your history for patterns."}
            </p>
          </div>
        </div>
        <button
          onClick={getAiAdvice}
          disabled={loadingAi}
          className="w-full sm:w-auto bg-[#EDAE49] hover:bg-[#EDAE49]/90 text-zinc-900 font-bold py-2.5 sm:py-3 px-5 sm:px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm flex-shrink-0"
        >
          {loadingAi ? "Calculating…" : "Generate Smart Tip"}
        </button>
      </div>

      {/* Charts */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Traffic Patterns Analysis</h2>
          <div className="flex gap-3 sm:gap-4">
            <Legend color="#30638E" label="Duration" />
            <Legend color="#EDAE49" label="Volume"   />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
          <ChartCard title="Weekly Average Duration">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day"      axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} />
              <YAxis                    axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: 12 }} />
              <Line type="monotone" dataKey="duration" stroke="#30638E" strokeWidth={3} dot={{ r: 5, fill: "#30638E", stroke: "#fff", strokeWidth: 2 }} />
            </LineChart>
          </ChartCard>

          <ChartCard title="Commute Volume by Time">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="hour"     axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: 12 }} />
              <Line type="stepAfter" dataKey="count" stroke="#EDAE49" strokeWidth={3} dot={{ r: 4, fill: "#EDAE49" }} />
            </LineChart>
          </ChartCard>
        </div>
      </div>

      {/* System Patterns */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold">System Patterns</h2>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {insights.tips.map((tip, i) => <AIInsight key={i} text={tip} />)}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function InsightCard({ title, value, sub, color }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm" style={{ borderTop: `3px solid ${color}` }}>
      <p className="text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 mb-1.5 sm:mb-2">{title}</p>
      <p className="text-lg sm:text-xl md:text-2xl font-semibold text-black leading-tight">{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1 leading-tight">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-6 shadow-sm h-[320px] sm:h-[380px] md:h-[400px] flex flex-col">
      <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 mb-3 sm:mb-4">{title}</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function AIInsight({ text }) {
  const isTimeWarning = text.includes("spike") || text.includes("before");
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-sm flex items-start gap-3 sm:gap-4">
      <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: isTimeWarning ? "#EDAE4915" : "#30638E15" }}>
        {isTimeWarning
          ? <Sparkles className="w-4 h-4" style={{ color: "#EDAE49" }} />
          : <Inspect  className="w-4 h-4" style={{ color: "#30638E" }} />
        }
      </div>
      <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">{text}</p>
    </div>
  );
}