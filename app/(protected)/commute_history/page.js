"use client";

import { useState, useMemo, useEffect } from "react";

const trafficStyles = {
  Low: "bg-green-100 text-green-600",
  Medium: "bg-yellow-100 text-yellow-600",
  High: "bg-red-100 text-red-600",
};

export default function CommuteHistory() {
  const [commutes, setCommutes] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/commutes")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(c => ({
          id: c.id,
          date: new Date(c.date).toDateString(),
          startTime: c.start_time,
          endTime: c.end_time,
          duration: c.duration_minutes,
          start: c.start_location || "Unknown",
          end: c.end_location || "Unknown",
          traffic: c.traffic_level,
          notes: c.notes,
        }));

        setCommutes(formatted);
      });
  }, []);


  // 🔎 Real Search Filter
  const filteredCommutes = useMemo(() => {
    return commutes.filter((c) =>
      `${c.start} ${c.end} ${c.date} ${c.traffic}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, commutes]);

  // Group by date
  const grouped = filteredCommutes.reduce((acc, commute) => {
    acc[commute.date] = acc[commute.date] || [];
    acc[commute.date].push(commute);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    await fetch("/api/commutes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setCommutes(prev => prev.filter(c => c.id !== id));
  };


  return (
    <div className="p-8 space-y-10 text-black">
      <h1 className="text-3xl font-bold">Commute History</h1>

      {/* Search */}
      <div className="flex justify-between items-center bg-zinc-100 rounded-xl px-4 py-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by location, date, traffic..."
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      {/* Date Groups */}
      {Object.keys(grouped).length === 0 && (
        <p className="text-zinc-400 text-sm">No results found.</p>
      )}

      {Object.keys(grouped).map((date) => (
        <div key={date} className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-zinc-400">
            {date}
          </h3>

          {grouped[date].map((commute, index) => {
            const isOpen = openId === commute.id;

            return (
              <div
                key={commute.id}
                className="bg-white rounded-2xl border border-zinc-200 p-5 transition-all duration-500 hover:shadow-md animate-slideIn"
                style={{
                  animationDelay: `${index * 60}ms`,
                }}
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
                    isOpen ? "max-h-96 mt-4 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-6 text-sm text-zinc-700 pt-4">
                    <div>
                      <p><strong>Duration:</strong> {commute.duration} min</p>
                      <p><strong>Starting Point:</strong> {commute.start}</p>
                      <p><strong>Ending Point:</strong> {commute.end}</p>
                    </div>

                    <div>
                      <p><strong>Traffic:</strong> {commute.traffic}</p>
                      <p><strong>Notes:</strong> {commute.notes || "—"}</p>

                      {/* 🗑 Delete Button (only when open) */}
                      <button
                        onClick={() => handleDelete(commute.id)}
                        className="mt-4 text-sm text-red-500 font-semibold hover:text-red-700 transition"
                      >
                        Delete Commute
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Slide-in animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease forwards;
        }
      `}</style>
    </div>
  );
}
