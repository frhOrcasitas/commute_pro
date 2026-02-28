"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

const trafficStyles = {
  Low:    "bg-[#00798C]/10 text-[#00798C] border border-[#00798C]/20",
  Medium: "bg-[#EDAE49]/10 text-[#EDAE49] border border-[#EDAE49]/20",
  High:   "bg-[#D1495B]/10 text-[#D1495B] border border-[#D1495B]/20",
};

const trafficDot = {
  Low:    "bg-[#00798C]",
  Medium: "bg-[#EDAE49]",
  High:   "bg-[#D1495B]",
};

export default function CommuteHistory() {
  const [commutes, setCommutes]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [openId, setOpenId]           = useState(null);
  const [search, setSearch]           = useState("");
  const [filterTraffic, setFilterTraffic] = useState("");

  useEffect(() => {
    const fetchCommutes = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) { setLoading(false); return; }

        const { data, error } = await supabase
          .from("tbl_commutes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formatted = data.map((c) => ({
          id:        c.id,
          date:      c.date_commuted ? new Date(c.date_commuted).toDateString() : "No Date",
          startTime: c.start_time    || "--:--",
          endTime:   c.end_time      || "--:--",
          duration:  c.duration_minutes || 0,
          distance:  c.distance_km   || 0,
          start:     c.start_location || "Unknown",
          end:       c.end_location   || "Unknown",
          traffic:   c.traffic_level  || "Medium",
          notes:     c.notes          || "",
        }));

        setCommutes(formatted);
      } catch (err) {
        console.error("Fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCommutes();
  }, []);

  const filteredCommutes = useMemo(() => {
    return commutes.filter((c) => {
      const matchesSearch  = `${c.start} ${c.end} ${c.date}`.toLowerCase().includes(search.toLowerCase());
      const matchesTraffic = filterTraffic === "" || c.traffic === filterTraffic;
      return matchesSearch && matchesTraffic;
    });
  }, [search, filterTraffic, commutes]);

  const grouped = filteredCommutes.reduce((acc, commute) => {
    acc[commute.date] = acc[commute.date] || [];
    acc[commute.date].push(commute);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this commute?")) return;
    try {
      const { error } = await supabase.from("tbl_commutes").delete().eq("id", id);
      if (error) throw error;
      setCommutes((prev) => prev.filter((c) => c.id !== id));
      setOpenId(null);
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-10 text-black max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Commute History</h1>
          <p className="text-zinc-500 text-sm mt-1">Review your past travels and patterns</p>
        </div>
        {/* Optional: stat pill */}
        <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-full bg-[#30638E]/10 text-[#30638E] border border-[#30638E]/20">
          {filteredCommutes.length} trip{filteredCommutes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-[3] bg-zinc-100 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center shadow-inner">
          <span className="mr-3 opacity-40 text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="bg-transparent outline-none text-sm w-full text-zinc-700 placeholder:text-zinc-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="ml-2 text-zinc-400 hover:text-zinc-600 text-xs font-bold">✕</button>
          )}
        </div>

        {/* Traffic filter */}
        <div className="w-full sm:w-56 relative">
          <select
            value={filterTraffic}
            onChange={(e) => setFilterTraffic(e.target.value)}
            className="w-full h-full bg-white border border-zinc-200 rounded-2xl pl-4 sm:pl-6 pr-10 py-3 sm:py-4 text-sm font-medium focus:ring-2 focus:ring-[#30638E] outline-none shadow-sm cursor-pointer appearance-none text-black"
          >
            <option value="">All Traffic Levels</option>
            <option value="Low">Low Traffic</option>
            <option value="Medium">Medium Traffic</option>
            <option value="High">High Traffic</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-zinc-400">▼</div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 sm:h-24 bg-zinc-50 animate-pulse rounded-2xl border border-zinc-100" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 sm:py-20 border-2 border-dashed border-zinc-100 rounded-3xl">
          <p className="text-zinc-400 text-sm">No commutes found matching your search.</p>
        </div>
      ) : (
        Object.keys(grouped).map((date) => (
          <div key={date} className="space-y-3 sm:space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-2">{date}</h3>

            {grouped[date].map((commute) => {
              const isOpen = openId === commute.id;
              return (
                <div
                  key={commute.id}
                  className={`bg-white rounded-2xl sm:rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-[#30638E] ring-4 ring-[#30638E]/10"
                      : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                  }`}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => setOpenId(isOpen ? null : commute.id)}
                    className="p-4 sm:p-6 flex justify-between items-center cursor-pointer gap-3"
                  >
                    {/* Left: duration badge + route */}
                    <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 bg-[#30638E] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white">
                        <span className="text-sm sm:text-base font-bold leading-none">{commute.duration}</span>
                        <span className="text-[8px] opacity-70">min</span>
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold text-sm sm:text-base leading-tight truncate max-w-[180px] sm:max-w-xs md:max-w-sm">
                          {commute.start}
                          <span className="text-zinc-300 mx-1.5">→</span>
                          {commute.end}
                        </h2>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          {commute.startTime} – {commute.endTime}
                        </p>
                      </div>
                    </div>

                    {/* Right: traffic badge + chevron */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      {/* On mobile show just a dot, on sm+ show the full pill */}
                      <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${trafficStyles[commute.traffic]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${trafficDot[commute.traffic]}`} />
                        {commute.traffic}
                      </span>
                      <span className={`sm:hidden w-2.5 h-2.5 rounded-full flex-shrink-0 ${trafficDot[commute.traffic]}`} />
                      <span className={`text-zinc-400 text-[10px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▼</span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div className="px-4 sm:px-6 pb-6 sm:pb-8 animate-fadeIn">
                      <div className="h-px bg-zinc-100 w-full mb-5 sm:mb-6" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">

                        {/* Route details */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">Route Details</p>
                          <div className="text-sm space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 w-2 h-2 rounded-full bg-[#00798C] flex-shrink-0" />
                              <div><span className="font-semibold text-zinc-500 text-xs">FROM</span><p>{commute.start}</p></div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 w-2 h-2 rounded-full bg-[#D1495B] flex-shrink-0" />
                              <div><span className="font-semibold text-zinc-500 text-xs">TO</span><p>{commute.end}</p></div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="w-2 h-2 rounded-full bg-[#EDAE49] flex-shrink-0" />
                              <p><span className="font-semibold">Duration:</span> {commute.duration} minutes</p>
                            </div>
                          </div>
                        </div>

                        {/* Notes + delete */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">Notes & Observations</p>
                          <p className="text-sm italic text-zinc-600 leading-relaxed">
                            "{commute.notes || "No extra notes for this trip."}"
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(commute.id); }}
                            className="text-xs font-bold text-[#D1495B] hover:bg-[#D1495B]/10 px-3 py-1.5 rounded-lg transition-colors mt-1 border border-transparent hover:border-[#D1495B]/20"
                          >
                            DELETE PERMANENTLY
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}