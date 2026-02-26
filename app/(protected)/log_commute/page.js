"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Play, Square, RotateCcw, Loader2 } from "lucide-react";

const CommuteMap = dynamic(
  () => import("../../components/CommuteMap"), // Use two sets of dots instead of three
  { ssr: false }
);

export default function LogCommute() {
  const [userId, setUserId] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [path, setPath] = useState([]);
  const watchId = useRef(null);

  const [date_commuted, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [trafficLevel, setTrafficLevel] = useState("");
  const [notes, setNotes] = useState("");
  
  // Map 
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Coordinates to Name, Reverse Geocoding

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      return data.display_name.split(',').slice(0, 2).join(', ');

    } catch (error) {
      return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
  };

  const startLiveCommute = async () => {
    const {data: settings, error } = await supabase 
      .from("tbl_user_settings")
      .select("location_access")
      .eq("user_id", userId)
      .single();

      // if settings don't exist yet, assume false
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching settings:", error);
        return;
      }

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
      // START TRACKING
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCoord = [latitude, longitude];
          
          setPath((prev) => {
            if (prev.length === 0) {
              setStartPoint({ lat: latitude, lng: longitude, name: "Current Location" });
            }
            return [...prev, newCoord];
          });
          
          if (path.length === 0) {
              setStartPoint({ lat: latitude, lng: longitude, name: "Current Location" });
          }
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, distanceFilter: 10 } // Update every 10 meters
      );
    }
  };

  const stopLiveCommute = () => {
    setIsLive(false);    
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }

    if (path.length > 0 ) {
      const lastCoord = path[path.length - 1];
      setEndPoint({lat: lastCoord[0], lng: lastCoord[1], name: "Destination"});
    }
  };

  const handleReset = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime("");
    setEndTime("");
    setTrafficLevel("");
    setNotes("");
    setStartPoint(null);
    setEndPoint(null);
    setDistance(0);
    setDuration(0);
  }

  const handlePointAdded = (count, data) => {
    if (count === 0) {
      // Handling Reset
      setStartPoint(null);
      setEndPoint(null);
      setDistance(0);
      setDuration(0);

    } else if (count === 1) {
      setStartPoint(data);

    } else if (count === 2) {
      setEndPoint(data);
    }
  };

  const handleSave = async () => {
    if (!userId) return alert("User not authenticated.");
    if (!startPoint || !endPoint || !date_commuted) {
      alert("Please select a route on the map and a date.");
      return;
    }

    // Use map duration (seconds to minutes) if time inputs are empty,
    // otherwise calculate from inputs
    let durationMinutes = Math.floor(duration / 60);
    if (startTime && endTime) {
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      const diff = (end - start) / 60000;
      if(diff > 0) durationMinutes = diff;
    }

    const { error } = await supabase.from("tbl_commutes").insert([
      {
        user_id: userId,
        date_commuted,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        distance_km: parseFloat((distance / 1000).toFixed(2)),
        start_location: startPoint.name,
        end_location: endPoint.name,
        start_lat: startPoint.lat,
        start_lng: startPoint.lng,
        end_lat: endPoint.lat,
        end_lng: endPoint.lng,
        traffic_level: trafficLevel,
        notes: notes || "",
      }]);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert("Commute saved!");
      handleReset();
    }

  };


return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Log Commute</h1>
          <p className="text-sm text-gray-500 mt-1">Record travel details manually or via GPS</p>
        </div>

        <button 
          onClick={isLive ? stopLiveCommute : startLiveCommute}
          disabled={loadingAddr}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition shadow-sm ${
            isLive 
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          } disabled:opacity-70`}
        >
          {loadingAddr ? <Loader2 className="animate-spin" size={18} /> : isLive ? <Square size={18} /> : <Play size={18} />}
          {isLive ? "Stop Live Commute" : "Start Live Commute"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-5 bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Commute Details</h2>
            <button onClick={handleReset} className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm transition">
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div className="space-y-4">
            {/* DATE FIELD - Added value attribute */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input 
                type="date" 
                value={date_commuted}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* START TIME - Added value attribute */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Time</label>
                <input 
                  type="time" 
                  value={startTime}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              {/* END TIME - Added value attribute */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Time</label>
                <input 
                  type="time"
                  value={endTime}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                  onChange={(e) => setEndTime(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Starting Point</label>
              <input 
                type="text" 
                value={startPoint?.name || ""} 
                placeholder="Select from map or use Live"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-black"
                onChange={(e) => setStartPoint({ ...startPoint, name: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ending Point</label>
              <input 
                type="text" 
                value={endPoint?.name || ""} 
                placeholder="Selected from map or use Live"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-black"
                onChange={(e) => setEndPoint({ ...endPoint, name: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Traffic Level</label>
              <select
                value={trafficLevel}
                onChange={(e) => setTrafficLevel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-black"
              >
                <option value="">Select traffic level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea 
                rows="3" 
                value={notes}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition"
          >
            Save Commute
          </button>
        </section>

        <section className="lg:col-span-7">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Preview</h2>
            <CommuteMap 
              onPointAdded={(count, data) => {
                if (count === 1) setStartPoint(data);
                if (count === 2) setEndPoint(data);
              }}
              setDistance={setDistance}
              setDuration={setDuration}
              livePath={path}
            />
          </div>
        </section>
      </div>
    </main>
  );
}