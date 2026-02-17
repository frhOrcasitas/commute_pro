"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const CommuteMap = dynamic(
  () => import("../../components/CommuteMap"), // Use two sets of dots instead of three
  { ssr: false }
);

export default function LogCommute() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

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
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Time</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"/>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Time</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"/>
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
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
                    <option>Select traffic level</option>
                    <option>Light</option>
                    <option>Moderate</option>
                    <option>Heavy</option>
                  </select>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea rows="3" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"/>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition">Save Commute</button>
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
