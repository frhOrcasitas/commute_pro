"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

const CommuteMap = dynamic(
  () => import("../../components/CommuteMap"), // Use two sets of dots instead of three
  { ssr: false }
);

export default function LogCommute() {
  const [userId, setUserId] = useState(null);
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
        start_time: startTime || null,
        end_time: endTime || null,
        duration_minutes: durationMinutes,
        distance_km: parseFloat((distance / 1000).toFixed(2)),
        start_location: startPoint.name,
        end_location: endPoint.name,
        start_lat: startPoint.lat,
        start_lng: startPoint.lng,
        end_lat: endPoint.lat,
        end_lng: endPoint.lng,
        traffic_level: trafficLevel || null,
        notes: notes || "",
      },
    ]);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert("Commute saved!");
    }

  };


  return (
    <main className="min-h-screen bg-gray-50 p-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Log Commute
          </h1>
          <p className="text-sm text-gray-500 mt-1">Record your travel details and route information</p>
        </div>

        <button className="bg-green-600  hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition">Start Live Commute</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <section className="lg:col-span-5 bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Commute Details</h2>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <input type="date" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Time</label>
                  <input type="time" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    onChange={(e) => setStartTime(e.target.value)}/>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Time</label>
                  <input type="time"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Starting Point</label>
                  <input type="text" placeholder="Select from map" className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-black"
                    value={startPoint?.name || ""}
                    onChange={(e) => setStartPoint({ ...startPoint, name: e.target.value})} />
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ending Point</label>
                  <input type="text" placeholder="Selected from map" className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                    value={endPoint?.name || ""}
                    onChange={(e) => setEndPoint({ ...endPoint, name: e.target.value})} />
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Traffic Level</label>
                  <select
                    value={trafficLevel}
                    onChange={(e) => setTrafficLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  >
                    <option value="">Select traffic level</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea rows="3" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    onChange={(e) => setNotes(e.target.value)} />
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition">Save Commute</button>
        </section>

        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select route</h2>

            <div className="flex flex-wrap gap-3 mb-4">
              <button className="px-4 py-2 text-sm bg-red-400 hover:bg-red-500 text-white rounded-lg">Reset</button>
              <button className="px-4 py-2 text-sm bg-blue-400 hover:bg-blue-500 text-white rounded-lg">Calculate Distance</button>
              <button className="px-4 py-2 text-sm bg-blue-400 hover:bg-blue-500 text-white rounded-lg">Real Routing</button>
            </div>
            
            <CommuteMap 
              onPointAdded={handlePointAdded}
              setDistance={setDistance}
              setDuration={setDuration}
            />
          </div>
        </section>
      </div>
  
    </main>
  );
}
