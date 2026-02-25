"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

const trafficStyles = {
  Low: "bg-green-100 text-green-600",
  Medium: "bg-yellow-100 text-yellow-600",
  High: "bg-red-100 text-red-600",
};

export default function CommuteHistory() {
  const [commutes, setCommutes] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTraffic, setFilterTraffic] = useState("");

  useEffect(() => {
  const fetchCommutes = async () => {
      setLoading(true);
      try {
        // 1. Get the current logged-in user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("User not logged in");
          setLoading(false);
          return;
        }

        // 2. Fetch data directly for this user
        const { data, error } = await supabase
          .from("tbl_commutes")
          .select("*")
          .eq("user_id", user.id) // This matches your "view their own" policy
          .order("created_at", { ascending: false });

        if (error) throw error;

        console.log("Supabase Direct Data:", data);

        const formatted = data.map((c) => ({
          id: c.id,
          date: c.date_commuted ? new Date(c.date_commuted).toDateString() : "No Date",
          startTime: c.start_time || "--:--",
          endTime: c.end_time || "--:--",
          duration: c.duration_minutes || 0,
          distance: c.distance_km || 0, // Using the float8 column from your schema
          start: c.start_location || "Unknown",
          end: c.end_location || "Unknown",
          traffic: c.traffic_level || "Medium",
          notes: c.notes || "",
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

  // 🔎 Filter logic - check for nulls to avoid crashes
  const filteredCommutes = useMemo(() => {
    return commutes.filter((c) => {
      const matchesSearch = `${c.start} ${c.end} ${c.date}`
        .toLowerCase()
        .includes(search.toLowerCase());
      
      const matchesTraffic = filterTraffic === "" || c.traffic === filterTraffic;

      return matchesSearch && matchesTraffic;
    });
  }, [search, filterTraffic, commutes]);

  // Group by date
  const grouped = filteredCommutes.reduce((acc, commute) => {
    acc[commute.date] = acc[commute.date] || [];
    acc[commute.date].push(commute);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this commute?")) return;

    try {
      const {error} = await supabase
        .from("tbl_commutes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setCommutes((prev) => prev.filter((c) => c.id !== id));

      setOpenId(null);
      
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="p-8 space-y-10 text-black max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold">Commute History</h1>
           <p className="text-zinc-500 text-sm">Review your past travels and patterns</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
  {/* Compact Search Bar */}
  <div className="flex-[3] bg-zinc-100 rounded-2xl px-6 py-4 flex items-center shadow-inner">
    <span className="mr-3 opacity-40">🔍</span>
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search history..."
      className="bg-transparent outline-none text-sm w-full text-zinc-700 placeholder:text-zinc-500"
    />
  </div>

        {/* Traffic Filter with Custom Arrow */}
        <div className="w-full md:w-64 relative">
          <select
            value={filterTraffic}
            onChange={(e) => setFilterTraffic(e.target.value)}
            className="w-full h-full bg-white border border-zinc-200 rounded-2xl pl-6 pr-12 py-4 text-sm font-medium focus:ring-2 focus:ring-zinc-900 outline-none shadow-sm cursor-pointer appearance-none text-black"
          >
            <option value="">All Traffic Levels</option>
            <option value="Low">Low Traffic</option>
            <option value="Medium">Medium Traffic</option>
            <option value="High">High Traffic</option>
          </select>
          
          {/* The Triangle Icon */}
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-zinc-400">
            ▼
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-zinc-50 animate-pulse rounded-2xl border border-zinc-100" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-3xl">
          <p className="text-zinc-400">No commutes found matching your search.</p>
        </div>
      ) : (
        Object.keys(grouped).map((date) => (
          <div key={date} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 pl-2">
              {date}
            </h3>

            {grouped[date].map((commute, index) => {
              const isOpen = openId === commute.id;
              return (
                <div
                  key={commute.id}
                  className={`bg-white rounded-[2rem] border transition-all duration-300 ${
                    isOpen ? "border-zinc-900 ring-4 ring-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {/* Header */}
                  <div
                    onClick={() => setOpenId(isOpen ? null : commute.id)}
                    className="p-6 flex justify-between items-center cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                       <div className="h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white font-bold">
                          {commute.duration}<span className="text-[8px] ml-0.5">m</span>
                       </div>
                       <div>
                          <h2 className="font-bold text-base leading-tight">
                            {commute.start} <span className="text-zinc-300 mx-1">→</span> {commute.end}
                          </h2>
                          <p className="text-xs text-zinc-500 font-medium mt-1">
                            {commute.startTime} - {commute.endTime}
                          </p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${trafficStyles[commute.traffic]}`}>
                        {commute.traffic}
                      </span>
                      <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Expandable */}
                  {isOpen && (
                    <div className="px-6 pb-8 animate-fadeIn">
                       <div className="h-px bg-zinc-100 w-full mb-6" />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <p className="text-xs text-zinc-400 uppercase font-bold tracking-tighter">Route Details</p>
                             <div className="text-sm space-y-1">
                                <p><strong>From:</strong> {commute.start}</p>
                                <p><strong>To:</strong> {commute.end}</p>
                                <p><strong>Duration:</strong> {commute.duration} minutes</p>
                             </div>
                          </div>
                          <div className="space-y-3">
                             <p className="text-xs text-zinc-400 uppercase font-bold tracking-tighter">Notes & Observations</p>
                             <p className="text-sm italic text-zinc-600">"{commute.notes || "No extra notes for this trip."}"</p>
                             <button
                               onClick={(e) => { e.stopPropagation(); handleDelete(commute.id); }}
                               className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors mt-2"
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
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}