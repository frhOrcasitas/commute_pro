"use client";

import { Inspect, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect, useMemo } from "react";

export default function traffic_insights() {
    const [commutes, setCommutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState("");
    const [loadingAi, setLoadingAi] = useState(false);

    const getAiAdvice = async () => {
        if (commutes.length === 0) return alert("Log some commutes first!");
        setLoadingAi(true);
        try {
            const res = await fetch('/api/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commutes }),
            });
            const data = await res.json();
            
            if (res.ok) {
                setAiInsight(data.insight);
                
                // Trigger the system alert with the new logic-based tip
                sendSystemAlert(data.insight); 
            } else {
                setAiInsight("Unable to calculate stats at this time.");
            }
        } catch (e) {
            setAiInsight("Error loading data insights.");
        } finally {
            setLoadingAi(false);
        }
    };

    useEffect(() => {
        async function getInsights() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("tbl_commutes")
                .select("*")
                .eq("user_id", user.id);

            setCommutes(data || []);
            setLoading(false);
        }
        getInsights();
    }, []);

    const weeklyData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const stats = days.map(day => ({ day, avgDuration: 0, count: 0 }));

        commutes.forEach(c => {
            const dayIndex = new Date(c.date_commuted).getDay();
            stats[dayIndex].avgDuration += c.duration_minutes || 0;
            stats[dayIndex].count += 1;
        });

        return stats.map(s => ({
            day: s.day,
            duration: s.count > 0 ? Math.round(s.avgDuration / s.count) : 0
        }));
    }, [commutes]);

    const insights = useMemo(() => {
        if (!commutes || commutes.length === 0) {
            return { peakWindow: "--", busiestDay: "--", avgDelay: 0, tips: [] };
        }

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayCounts = {};
        let totalDelay = 0;
        let tripsWithData = 0;

        commutes.forEach(c => {
            // Busiest day logic
            const day = days[new Date(c.date_commuted).getDay()];
            dayCounts[day] = (dayCounts[day] || 0) + 1;

            // REAL DELAY CALCULATION
            const actual = c.duration_minutes || 0;
            
            // --- FIX FOR OLDER NULL DATA START ---
            // If estimated_duration_minutes is null, we assume a 35km/h baseline
            const ideal = c.estimated_duration_minutes 
                ? c.estimated_duration_minutes 
                : Math.round((c.distance_km / 35) * 60);
            // --- FIX FOR OLDER NULL DATA END ---

            if (actual > 0) {
                const delay = Math.max(0, actual - ideal);
                totalDelay += delay;
                tripsWithData++;
            }
        });

        const avgDelay = tripsWithData > 0 ? Math.round(totalDelay / tripsWithData) : 0;
        const busiestDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b, "--");

        // Peak window logic
        const minuteBuckets = {};
        commutes.forEach(c => {
            if (!c.start_time) return;
            const [h, m] = c.start_time.split(':');
            const timeKey = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
            minuteBuckets[timeKey] = (minuteBuckets[timeKey] || 0) + 1;
        });

        const sortedMinutes = Object.keys(minuteBuckets).sort((a, b) => minuteBuckets[b] - minuteBuckets[a]);
        const topMinute = sortedMinutes[0] || "00:00";
        const [peakH, peakM] = topMinute.split(':').map(Number);
        const dateObj = new Date();
        dateObj.setHours(peakH, peakM);

        const startTimeStr = new Date(dateObj.getTime() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTimeStr = new Date(dateObj.getTime() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const peakWindow = `${startTimeStr} - ${endTimeStr}`;

        const tips = [];
        if (avgDelay > 10) {
            tips.push(`AI Alert: High delays (${avgDelay}m). Consider leaving before ${startTimeStr}.`);
        } else {
            tips.push(`Your routes are currently efficient with only ${avgDelay}m of delay.`);
        }
        tips.push(`${busiestDay} is your most frequent commute day.`);

        return { peakWindow, busiestDay, tips, peakH, avgDelay };
    }, [commutes]);

    const hourlyData = useMemo(() => {
        const hours = Array.from({length: 24}, (_, i) => ({
            hour: `${i.toString().padStart(2, '0')}:00`,
            count: 0
        }));
        commutes.forEach(c => {
            if (!c.start_time) return;
            const h = parseInt(c.start_time.split(':')[0]);
            hours[h].count += 1;
        });
        return hours.filter(h => h.count > 0 || (h.hour > '06:00' && h.hour < '22:00'));
    }, [commutes]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const sendSystemAlert = (insightText) => {
        if (Notification.permission === "granted") {
            new Notification("Commute Strategy Found", { // Renamed
                body: insightText,
                icon: "/favicon.ico",
                silent: false 
            });
        }
    };
    

    if (loading) return <div className="p-8 text-zinc-500 text-black">Calculating insights...</div>;

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-10 text-black">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    {getGreeting()}, here are your Traffic Insights
                </h1>
                <p className="text-zinc-500 max-w-2xl">
                    Based on {commutes.length} recorded trips, your most efficient departure window is 
                    <span className="font-semibold text-zinc-900"> before {insights.peakWindow.split(' - ')[0]}</span>.
                </p>
            </header>

            {/* CHANGED: md:grid-cols-4 to fit all 4 cards nicely */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-black">
                <InsightCard title="Busiest Day" value={insights.busiestDay} sub={`${commutes.length} entries analyzed`}/>
                <InsightCard title="Peak Window" value={insights.peakWindow} sub="Peak traffic interval" />
                <InsightCard title="Avg Duration" value={`${Math.round(commutes.reduce((acc,c) => acc + (c.duration_minutes || 0), 0) / commutes.length || 0)} min`} />
                <InsightCard title="Avg Delay" value={`${insights.avgDelay} min`} sub="Lost to traffic vs Map Estimate" />
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-lg border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                        <Inspect className="w-6 h-6 text-emerald-400" /> {/* Changed icon to Inspect */}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Smart Traffic Analysis</h3>
                        <p className="text-zinc-400 text-sm max-w-xl">
                            {aiInsight || "Click the button to analyze your history for patterns."}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={getAiAdvice}
                    disabled={loadingAi}
                    className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loadingAi ? "Calculating..." : "Generate Smart Tip"}
                </button>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight text-black">Traffic Patterns Analysis</h2>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                            <span className="w-2 h-2 rounded-full bg-[#576A8F]"></span> Duration
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                            <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span> Volume
                        </span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* CHANGED: Use h-[400px] to fix the Recharts width bug */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm h-[400px] flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-zinc-900">Weekly Average Duration</h3>
                        </div>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Line type="monotone" dataKey="duration" stroke="#576A8F" strokeWidth={4} dot={{ r: 6, fill: "#576A8F", stroke: "#fff" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm h-[400px] flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-zinc-900">Commute Volume by Time</h3>
                        </div>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} allowDecimals={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Line type="stepAfter" dataKey="count" stroke="#EAB308" strokeWidth={4} dot={{ r: 4, fill: "#EAB308" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-black">System Patterns</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {insights.tips.map((tip, index) => (
                        <AIInsight key={index} text={tip} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function InsightCard({ title, value, sub }) {
    return (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">{title}</p>
            <p className="text-2xl font-semibold text-black">{value}</p>
            {sub && <p className="text-sm text-zinc-400 mt-1">{sub}</p>}
        </div>
    );
}

function AIInsight({ text }) {
    // Determine if the tip is about time or volume
    const isTimeWarning = text.includes("spike") || text.includes("before");
    
    return (
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
            <div className={`p-2 rounded-lg ${isTimeWarning ? 'bg-amber-50' : 'bg-blue-50'}`}>
                {isTimeWarning ? (
                    <Sparkles className="w-4 h-4 text-amber-600" />
                ) : (
                    <Inspect className="w-4 h-4 text-blue-600" />
                )}
            </div>
            <p className="text-sm text-zinc-700 leading-relaxed font-medium">{text}</p>
        </div>
    );
}