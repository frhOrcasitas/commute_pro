"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Play, Square, RotateCcw, Loader2 } from "lucide-react";

const CommuteMap = dynamic(
  () => import("../../components/CommuteMap"),
  { ssr: false }
);

export default function LogCommute() {
  const [userId, setUserId]           = useState(null);
  const [isLive, setIsLive]           = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [path, setPath]               = useState([]);
  const watchId                       = useRef(null);

  const [date_commuted, setDate]      = useState("");
  const [startTime, setStartTime]     = useState("");
  const [endTime, setEndTime]         = useState("");
  const [trafficLevel, setTrafficLevel] = useState("");
  const [notes, setNotes]             = useState("");

  const [startPoint, setStartPoint]   = useState(null);
  const [endPoint, setEndPoint]       = useState(null);
  const [distance, setDistance]       = useState(0);
  const [duration, setDuration]       = useState(0);
  const [savedLocs, setSavedLocs]     = useState([]);

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: locations } = await supabase
        .from("tbl_saved_locations")
        .select("label, address, lat, lng")
        .eq("user_id", user.id);

      if (locations) setSavedLocs(locations);
    };
    initData();
  }, []);

  const fetchAddress = async (lat, lng) => {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      return data.display_name.split(',').slice(0, 2).join(', ');
    } catch {
      return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
  };

  const startLiveCommute = async () => {
    const { data: settings, error } = await supabase
      .from("tbl_user_settings")
      .select("location_access")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') { console.error(error); return; }
    if (!settings || !settings.location_access) {
      alert("Please enable Location Access in your Profile settings first.");
      return;
    }

    setIsLive(true);
    setPath([]);
    const now = new Date();
    setStartTime(now.toTimeString().slice(0, 5));
    setDate(now.toISOString().split('T')[0]);

    if ("geolocation" in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPath((prev) => {
            if (prev.length === 0) setStartPoint({ lat: latitude, lng: longitude, name: "Current Location" });
            return [...prev, [latitude, longitude]];
          });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, distanceFilter: 10 }
      );
    }
  };

  const stopLiveCommute = () => {
    setIsLive(false);
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    if (path.length > 0) {
      const last = path[path.length - 1];
      setEndPoint({ lat: last[0], lng: last[1], name: "Destination" });
    }
  };

  const handleReset = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime(""); setEndTime(""); setTrafficLevel(""); setNotes("");
    setStartPoint(null); setEndPoint(null); setDistance(0); setDuration(0);
  };

  const handlePointAdded = (count, data) => {
    if (count === 0) { setStartPoint(null); setEndPoint(null); setDistance(0); setDuration(0); }
    else if (count === 1) setStartPoint(data);
    else if (count === 2) setEndPoint(data);
  };

  const handleSave = async () => {
    if (!userId) return alert("User not authenticated.");
    if (!startPoint || !endPoint || !date_commuted) {
      alert("Please select a route on the map and a date.");
      return;
    }

    let actualDuration = Math.floor(duration / 60);
    if (startTime && endTime) {
      const diff = (new Date(`1970-01-01T${endTime}`) - new Date(`1970-01-01T${startTime}`)) / 60000;
      if (diff > 0) actualDuration = diff;
    }

    const { error } = await supabase.from("tbl_commutes").insert([{
      user_id:                    userId,
      date_commuted,
      start_time:                 startTime,
      end_time:                   endTime,
      duration_minutes:           actualDuration,
      estimated_duration_minutes: Math.floor(duration / 60),
      distance_km:                parseFloat((distance / 1000).toFixed(2)),
      start_location:             startPoint.name,
      end_location:               endPoint.name,
      start_lat:                  startPoint.lat,
      start_lng:                  startPoint.lng,
      end_lat:                    endPoint.lat,
      end_lng:                    endPoint.lng,
      traffic_level:              trafficLevel,
      notes:                      notes || "",
    }]);

    if (error) { alert("Error saving: " + error.message); }
    else { alert("Commute saved!"); handleReset(); }
  };

  /* ─── Traffic level colours ─── */
  const trafficColor = {
    Low:    "border-[#00798C]  text-[#00798C]  bg-[#00798C]/5",
    Medium: "border-[#EDAE49] text-[#EDAE49] bg-[#EDAE49]/5",
    High:   "border-[#D1495B]  text-[#D1495B]  bg-[#D1495B]/5",
    "":     "border-zinc-300   text-zinc-500",
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Log Commute</h1>
          <p className="text-sm text-gray-500 mt-0.5">Record travel details manually or via GPS</p>
        </div>

        <button
          onClick={isLive ? stopLiveCommute : startLiveCommute}
          disabled={loadingAddr}
          className={`self-start sm:self-auto flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm transition shadow-sm ${
            isLive
              ? "bg-[#D1495B] hover:bg-[#D1495B]/90 text-white"
              : "bg-[#00798C] hover:bg-[#00798C]/90 text-white"
          } disabled:opacity-70`}
        >
          {loadingAddr
            ? <Loader2 className="animate-spin" size={16} />
            : isLive ? <Square size={16} /> : <Play size={16} />}
          {isLive ? "Stop Live Commute" : "Start Live Commute"}
        </button>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 md:gap-8 lg:gap-10">

        {/* ── Form panel ── */}
        <section className="lg:col-span-5 bg-white p-5 sm:p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm space-y-5 sm:space-y-6">

          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Commute Details</h2>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-[#D1495B] flex items-center gap-1 text-xs sm:text-sm transition"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>

          <div className="space-y-4">

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date_commuted}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#30638E] outline-none text-black text-sm bg-gray-50"
              />
            </div>

            {/* Start / End Time */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { label: "Start Time", value: startTime, setter: setStartTime },
                { label: "End Time",   value: endTime,   setter: setEndTime   },
              ].map(({ label, value, setter }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type="time"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#30638E] outline-none text-black text-sm bg-gray-50"
                  />
                </div>
              ))}
            </div>

            {/* Starting / Ending Point */}
            {[
              { label: "Starting Point", point: startPoint, setPoint: setStartPoint, prefix: "start" },
              { label: "Ending Point",   point: endPoint,   setPoint: setEndPoint,   prefix: "end"   },
            ].map(({ label, point, setPoint, prefix }) => (
              <div key={prefix} className="space-y-1.5">
                <div className="flex justify-between items-center flex-wrap gap-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">{label}</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {savedLocs.map((loc) => (
                      <button
                        key={`${prefix}-${loc.label}`}
                        onClick={() => setPoint({ lat: loc.lat, lng: loc.lng, name: loc.address })}
                        className="text-[10px] bg-zinc-100 hover:bg-[#30638E] hover:text-white px-2 py-1 rounded-md font-bold transition"
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={point?.name || ""}
                  placeholder="Select from map or use Live"
                  onChange={(e) => setPoint({ ...point, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 text-black text-sm outline-none focus:ring-2 focus:ring-[#30638E]"
                />
              </div>
            ))}

            {/* Traffic Level */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Traffic Level</label>
              <div className="grid grid-cols-3 gap-2">
                {["Low", "Medium", "High"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setTrafficLevel(level)}
                    className={`py-2 rounded-lg text-xs font-bold border-2 transition ${
                      trafficLevel === level
                        ? trafficColor[level]
                        : "border-zinc-200 text-zinc-500 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:ring-2 focus:ring-[#30638E] outline-none text-black text-sm bg-gray-50 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#30638E] hover:bg-[#30638E]/90 active:bg-[#30638E]/80 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm transition shadow-sm"
          >
            Save Commute
          </button>
        </section>

        {/* ── Map panel ── */}
        <section className="lg:col-span-7">
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm min-h-[380px] sm:min-h-[480px] lg:min-h-[550px]">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Route Preview</h2>
            <CommuteMap
              onPointAdded={(count, data) => {
                if (count === 1) setStartPoint(data);
                if (count === 2) setEndPoint(data);
              }}
              setDistance={setDistance}
              setDuration={setDuration}
              livePath={path}
              externalStart={startPoint}
              externalEnd={endPoint}
            />
          </div>
        </section>
      </div>
    </main>
  );
}