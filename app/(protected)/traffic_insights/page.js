"use client";

import { Inspect } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function traffic_insights() {

    return (
        <div className="p-8 space-y-10 text-black">
            <h1 className="text-3xl font-bold">Traffic Insights</h1>

            <div className="grid md:grid-cols-3 gap-6">
                <InsightCard title="Busiest Day" value="30 Jan 2026" sub="Friday"/>
                <InsightCard title="Peak Time Window" value="18:30 - 19:15"/>
                <InsightCard title="Average Delay" value="15 min"/>
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-semibold">Traffic Patterns Charts</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <ChartPlaceholder title="Weekly Traffic Pattern"/>
                    <ChartPlaceholder title="Time-based Congestion"/>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">AI Insights</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <AIInsight text="Congestion frequently occurs at 18:00 until 20:00." />
                    <AIInsight text="Earlier departures are recommended to reduce commute time." />
                    <AIInsight text="Monday mornings show consistently high traffic." />
                    <AIInsight text="Consider alternative routes during peak hours." />
                </div>
             </div>
        </div>
    )
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

function ChartPlaceholder({ title }) {
    return (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center justify-center h-48">
            <h3 className="text-sm font-medium text-zinc-600">{title}</h3>

            <div className="h-48 bg-zinc-100 rounded-lg mt-4 w-full flex items-center justify-center">
                Line Chart Placeholder
            </div>
        </div>
    );
}

function AIInsight({ text }) {
    return (
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-4">
            {text}
        </div>
    );
}
