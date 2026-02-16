"use client";

import dynamic from "next/dynamic";

const CommuteMap = dynamic(
  () => import("../../components/CommuteMap"), // Use two sets of dots instead of three
  { ssr: false }
);

export default function LogCommute() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Log Commute
      </h1>

      <CommuteMap />
    </main>
  );
}
