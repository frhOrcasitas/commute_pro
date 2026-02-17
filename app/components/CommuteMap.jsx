"use client";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// 1. Fix marker icons for Next.js environment
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// 2. Helper: Click handler to set start/end points
function LocationSelector({ setPoints }) {
  useMapEvents({
    click(e) {
      setPoints((prev) => {
        if (prev.length >= 2) return prev;
        return [...prev, [e.latlng.lat, e.latlng.lng]];
      });
    },
  });
  return null;
}

// 3. Helper: Routing Logic (Simplified and Stabilized)
function Routing({ points, setRoadMetrics }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Create control only once
    if (!routingRef.current) {
      routingRef.current = L.Routing.control({
        waypoints: [],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        show: false,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: "#2563eb", weight: 6, opacity: 0.8 }],
        },
      }).addTo(map);

      routingRef.current.on("routesfound", (e) => {
        if (e.routes && e.routes[0]) {
          const summary = e.routes[0].summary;
          setRoadMetrics({
            distance: summary.totalDistance,
            time: summary.totalTime,
          });
        }
      });
    }

    // Update waypoints instead of recreating control
    if (points.length === 2) {
      routingRef.current.setWaypoints([
        L.latLng(points[0][0], points[0][1]),
        L.latLng(points[1][0], points[1][1]),
      ]);
    } else {
      routingRef.current.setWaypoints([]);
      setRoadMetrics({ distance: 0, time: 0 });
    }

    // Cleanup only when component fully unmounts
    return () => {};
  }, [map, points, setRoadMetrics]);

  return null;
}


// 4. MAIN COMPONENT
export default function CommuteMap() {
  const [points, setPoints] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [roadMetrics, setRoadMetrics] = useState({ distance: 0, time: 0 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="h-[450px] bg-zinc-100 animate-pulse rounded-[2.5rem]" />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-zinc-200 shadow-sm bg-white">
        <MapContainer
          center={[3.1390, 101.6869]}
          zoom={13}
          style={{ height: "450px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <LocationSelector setPoints={setPoints} />

          {points.map((position, index) => (
            <Marker key={`marker-${index}`} position={position} />
          ))}

          {/* THE BIG FIX: We use a key based on the points' coordinates. 
              This forces React to safely 'reset' the routing engine 
              whenever the points change. */}
          {points.length === 2 && (
            <Routing 
              points={points} 
              setRoadMetrics={setRoadMetrics} 
            />
          )}
        </MapContainer>

        <div className="absolute top-4 right-4 z-[1000]">
          {points.length > 0 && (
            <button 
              onClick={() => {
                setRoadMetrics({ distance: 0, time: 0 });
                setPoints([]);
              }}
              className="bg-white px-6 py-2 rounded-full shadow-xl text-[10px] font-black text-red-500 border border-zinc-100"
            >
              RESET POINTS
            </button>
          )}
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        <div className="bg-zinc-100 p-8 rounded-[2rem] border border-zinc-200 flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Distance</span>
          <div className="text-3xl font-black">{(roadMetrics.distance / 1000).toFixed(2)} km</div>
        </div>
        <div className="bg-zinc-800 p-8 rounded-[2rem] text-white flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Time</span>
          <div className="text-3xl font-black text-emerald-400">{Math.floor(roadMetrics.time / 60)} mins</div>
        </div>
      </div>
    </div>
  );
}