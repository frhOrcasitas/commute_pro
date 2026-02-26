"use client";

import { Inspect } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {useState, useEffect, useMemo} from "react";

export default function traffic_insights() {
    const [commutes, setCommutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getInsights() {
            const { data: { user } } = await supabase.auth.getUser();
            if(!user) return;

            const { data } = await supabase
                .from("tbl_commutes")
                .select("*")
                .eq("user_id", user.id);

            setCommutes(data || []);
            setLoading(false);
        }
        getInsights();
    }, []);

// Fixed: Corrected typo 'abgDuration' to 'avgDuration'
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
        if (commutes.length === 0) return { peakWindow: "--", busiestDay: "--", avgDelay: 0, tips: [] };

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayCounts = {};
        
        commutes.forEach(c => {
            const day = days[new Date(c.date_commuted).getDay()];
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });
        
        const busiestDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b);

        // Peak Time Window Logic
        const minuteBuckets = {};
        commutes.forEach(c => {
            if (!c.start_time) return;
            const [h, m] = c.start_time.split(':');
            const timeKey = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
            minuteBuckets[timeKey] = (minuteBuckets[timeKey] || 0) + 1;
        });

        // FIXED: Convert object keys to an array before reducing
        const sortedMinutes = Object.keys(minuteBuckets).sort((a, b) => minuteBuckets[b] - minuteBuckets[a]);
        const topMinute = sortedMinutes[0];

        const [peakH, peakM] = topMinute.split(':').map(Number);
        const dateObj = new Date();
        dateObj.setHours(peakH, peakM);

        const startTime = new Date(dateObj.getTime() - 15 * 60000).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTime = new Date(dateObj.getTime() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false});
        const peakWindow = `${startTime} - ${endTime}`;

        const totalActual = commutes.reduce((acc, c) => acc + (c.duration_minutes || 0), 0);
        // based on the average speed(60 + 40 + 30)/3 = 43
        const totalBaseline = commutes.reduce((acc, c) => acc + ((c. distance_km / 40) * 60), 0);
        const avgDelay = Math.max(0, Math.round((totalActual - totalBaseline) / commutes.length));

        // AI Insights Engine
        const tips = [];
        if (peakH >= 16) {
            tips.push(`AI detected a sharp traffic spike at ${topMinute}. Leaving before ${startTime} could save you significant time.`);
        } else {
            tips.push(`Morning rush is most intense around ${topMinute}. We recommend arriving at your destination before this window starts.`);
        }

        tips.push(`${busiestDay}s are your most active days. Expect a ${Math.round((dayCounts[busiestDay]/commutes.length)*100)}% higher commute volume.`);

        const highTrafficCount = commutes.filter(c => c.traffic_level === 'High').length;
        if (highTrafficCount > (commutes.length / 2)) {
            tips.push("Heavy congestion pattern recognized. If possible, negotiate a remote start or shift your schedule by 45 minutes.");
        } else {
            tips.push("Your commute timing is currently optimal compared to local averages. Stick to your current routine.");
        }

        return { peakWindow, busiestDay, tips, peakH, avgDelay };
    }, [commutes]); // Added missing commutes dependency here

    const hourlyData = useMemo(() => {

        // 24 hours of empty data
        const hours = Array.from({length: 24}, (_, i) => ({
            hour: `${i.toString().padStart(2, '0')}:00`,
            count: 0
        }));

        commutes.forEach(c => {
            if (!c.start_time) return;
            const h = parseInt(c.start_time.split(':')[0]);
            hours[h].count += 1;
        });

        // Optional: Filter to only show hours that actually have data to keep chart clean
        return hours.filter(h => h.count > 0 || (h.hour > '06:00' && h.hour < '22:00'));
    }, [commutes]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    if (loading) return <div className="p-8 text-zinc-500">Calculating insights...</div>;

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-10 text-black">
            {/* Smart Summary Header */}
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    {getGreeting()}, here are your Traffic Insights
                </h1>
                <p className="text-zinc-500 max-w-2xl">
                    Based on {commutes.length} recorded trips, your most efficient departure window is currently 
                    <span className="font-semibold text-zinc-900"> before {insights.peakWindow.split(' - ')[0]}</span>.
                </p>
            </header>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InsightCard title="Busiest Day" value={insights.busiestDay} sub={`${commutes.length} entries analyzed`}/>
                <InsightCard title="Peak Time Window" value={insights.peakWindow} sub="Highly specific 1-min interval" />
                <InsightCard title="Average Duration" value={`${Math.round(commutes.reduce((acc,c) => acc + c.duration_minutes, 0) / commutes.length || 0)} min`} />
                <InsightCard title="Average Delay" value={`${insights.avgDelay} min`} sub="Minutes lost to traffic" />
            </div>

            {/* Charts Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Traffic Patterns Analysis</h2>
                    <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                        <span className="w-2 h-2 rounded-full bg-[#576A8F]"></span> Duration
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                        <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span> Volume
                    </span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Weekly Average Chart */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-zinc-900">Weekly Average Duration</h3>
                            <p className="text-xs text-zinc-500">Average minutes spent per trip</p>
                        </div>
                        <div className="flex-1 w-full" style={{ minHeight: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="day" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#888', fontSize: 12}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#888', fontSize: 12}}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="duration"
                                        stroke="#576A8F"
                                        strokeWidth={4}
                                        dot={{ r: 6, fill: "#576A8F", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Volume Chart */}
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm min-h-[450px] flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold text-zinc-900">Commute Volume by Time</h3>
                            <p className="text-xs text-zinc-500">Trips distributed by hour</p>
                        </div>
                        <div className="flex-1 w-full" style={{ minHeight: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={hourlyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="hour" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#888', fontSize: 12}}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#888', fontSize: 12}}
                                        allowDecimals={false}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line 
                                        type="stepAfter" 
                                        dataKey="count" 
                                        stroke="#EAB308" 
                                        strokeWidth={4} 
                                        dot={{ r: 4, fill: "#EAB308" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">AI Insights</h2>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-emerald-100">
                        {Math.min(Math.round((commutes.length / 20) * 100), 99)}% Data Confidence
                    </span>
                </div>

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
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
        </div>
    );
}

function AIInsight({ text }) {
    return (
        <div className="bg-gradient-to-br from-white to-zinc-50 border border-zinc-200 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <p className="text-sm text-zinc-700 leading-relaxed">{text}</p>
        </div>
    );
}
