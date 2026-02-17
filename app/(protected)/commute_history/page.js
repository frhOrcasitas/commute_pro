"use client";

import { useState } from "react";

const fakeCommutes = [
  {
    id: 1,
    date: "31 Jan 2026",
    startTime: "7:15",
    endTime: "8:45",
    duration: 90,
    start: "Home",
    end: "University",
    traffic: "High",
    notes: "Heavy jam near highway.",
  },
  {
    id: 2,
    date: "30 Jan 2026",
    startTime: "18:04",
    endTime: "18:45",
    duration: 41,
    start: "University",
    end: "Home",
    traffic: "Medium",
    notes: "",
  },
  {
    id: 3,
    date: "30 Jan 2026",
    startTime: "7:20",
    endTime: "8:30",
    duration: 70,
    start: "Home",
    end: "University",
    traffic: "Low",
    notes: "",
  },
];

const trafficStyles = {
  Low: "bg-green-100 text-green-600",
  Medium: "bg-yellow-100 text-yellow-600",
  High: "bg-red-100 text-red-600",
};

export default function CommuteHistory() {
  const [openId, setOpenId] = useState(null);

  // Group by date
  const grouped = fakeCommutes.reduce((acc, commute) => {
    acc[commute.date] = acc[commute.date] || [];
    acc[commute.date].push(commute);
    return acc;
  }, {});

  return (
    <div className="p-8 space-y-10 text-black">
      <h1 className="text-3xl font-bold">Commute History</h1>

      {/* Filter (UI only for now) */}
      <div className="flex justify-between items-center bg-zinc-100 rounded-xl px-4 py-3">
        <input
          placeholder="Filter by..."
          className="bg-transparent outline-none text-sm w-full"
        />
        <span className="text-zinc-400">▼</span>
      </div>

      {/* Date Groups */}
      {Object.keys(grouped).map((date) => (
        <div key={date} className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-zinc-400">
            {date}
          </h3>

          {grouped[date].map((commute) => {
            const isOpen = openId === commute.id;

            return (
              <div
                key={commute.id}
                className="bg-white rounded-2xl border border-zinc-200 p-5 transition-all duration-300 hover:shadow-md"
              >
                {/* Header */}
                <div
                  onClick={() =>
                    setOpenId(isOpen ? null : commute.id)
                  }
                  className="flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <h2 className="font-bold text-lg">
                      From {commute.start} to {commute.end}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      {commute.startTime} - {commute.endTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${trafficStyles[commute.traffic]}`}
                    >
                      {commute.traffic}
                    </span>

                    <button className="p-2 rounded-full hover:bg-zinc-100 transition">
                      {isOpen ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {/* Expandable Section */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? "max-h-96 mt-4" : "max-h-0"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-6 text-sm text-zinc-700">
                    <div>
                      <p><strong>Duration:</strong> {commute.duration} min</p>
                      <p><strong>Starting Point:</strong> {commute.start}</p>
                      <p><strong>Ending Point:</strong> {commute.end}</p>
                    </div>

                    <div>
                      <p><strong>Traffic:</strong> {commute.traffic}</p>
                      <p><strong>Notes:</strong> {commute.notes || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
