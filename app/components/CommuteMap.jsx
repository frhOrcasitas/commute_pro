"use client";

import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 1. Fix marker icons for Next.js
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// 2. The missing LocationSelector helper
function LocationSelector({ setPoints }) {
  useMapEvents({
    click(e) {
      setPoints((prev) => {
        if (prev.length >= 2) return prev; // Only allow Start and End points
        return [...prev, [e.latlng.lat, e.latlng.lng]];
      });
    },
  });
  return null;
}

export default function CommuteMap() {
  const [points, setPoints] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevents Hydration Mismatch
  if (!isClient) {
    return (
      <div 
        style={{ height: "400px", width: "100%" }} 
        className="bg-zinc-200 animate-pulse rounded-xl flex items-center justify-center text-zinc-400"
      >
        Loading Map...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MapContainer
        center={[3.1390, 101.6869]}
        zoom={13}
        style={{ height: "400px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationSelector setPoints={setPoints} />

        {points.map((position, index) => (
          <Marker key={index} position={position} />
        ))}

        {points.length === 2 && (
          <Polyline positions={points} color="blue" />
        )}
      </MapContainer>

      {/* Helper UI to clear points */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-zinc-200">
        <p className="text-xs text-zinc-500">
          {points.length === 0 ? "Click map to set Start" : 
           points.length === 1 ? "Click map to set Destination" : 
           "Route set!"}
        </p>
        <button 
          onClick={() => setPoints([])}
          className="text-xs font-bold text-red-500 hover:text-red-700"
        >
          Reset Points
        </button>
      </div>
    </div>
  );
}