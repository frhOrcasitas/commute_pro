"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const CommuteMap = dynamic(
  () => import("../../components/CommuteMap"), // Use two sets of dots instead of three
  { ssr: false }
);

export default function LogCommute() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [trafficLevel, setTrafficLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const handleSave = async () => {
    const durationMinutes =
      (new Date(`1970-01-01T${endTime}`) -
        new Date(`1970-01-01T${startTime}`)) / 60000;

    await fetch("/api/commutes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: 1,
        date,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,

        start_location: startPoint?.name || null,
        end_location: endPoint?.name || null,

        start_lat: startPoint?.lat || null,
        start_lng: startPoint?.lng || null,
        end_lat: endPoint?.lat || null,
        end_lng: endPoint?.lng || null,

        traffic_level: trafficLevel || null,
        notes,
      }),
    });

    alert("Commute saved!");
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
                  <input type="text" placeholder="Selected from map" className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"/>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ending Point</label>
                  <input type="text" placeholder="Selected from map" className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"/>
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
              startPoint={startPoint}
              endPoint={endPoint}
              setStartPoint={setStartPoint}
              setEndPoint={setEndPoint}
              setDistance={setDistance}
              setDuration={setDuration}
            />
          </div>
        </section>
      </div>
  
    </main>
  );
}
