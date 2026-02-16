"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = [
    { label: "Average Time", value: "45 min" },
    { label: "Most Congested", value: "8:00 – 9:00" },
    { label: "Total Commutes", value: "120" },
    { label: "Best Time", value: "6:30 – 7:30" },
  ];

  const recentCommutes = [
    {
      id: 1,
      date: "31 Jan 2026",
      route: "Home → Office",
      time: "7:15 – 8:45",
      duration: "1h 30m",
      status: "High",
    },
    {
      id: 2,
      date: "30 Jan 2026",
      route: "Office → Home",
      time: "5:10 – 6:00",
      duration: "50m",
      status: "Low",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-semibold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your commute activity
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recent Commutes */}
          <section className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Recent Commutes
            </h2>

            <div className="space-y-4">
              {recentCommutes.map((commute) => (
                <div
                  key={commute.id}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-500">{commute.date}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        commute.status === "High"
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {commute.status}
                    </span>
                  </div>

                  <p className="font-medium text-gray-900">
                    {commute.route}
                  </p>

                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{commute.time}</span>
                    <span>{commute.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right Side */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* AI Suggestion */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                AI Suggestion
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Best Departure
                  </span>
                  <span className="font-medium text-gray-900">
                    07:00 – 07:30
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Estimated Savings
                  </span>
                  <span className="font-medium text-emerald-600">
                    15 mins
                  </span>
                </div>
              </div>
            </div>

            {/* Log Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition"
            >
              <Plus size={18} />
              Log Commute
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Commute
            </h2>

            <div className="h-32 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
              Form goes here
            </div>

            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition">
              Save
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
