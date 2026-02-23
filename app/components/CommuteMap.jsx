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
function LocationSelector({ setPoints, onPointAdded }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;

      let name = "Selected Location";
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        name = data.display_name.split(',')[0] + ", " + data.display_name.split(',')[1];

        if (data.display_name) {
          const parts = data.display_name.split(',');
          name = parts[0] + (parts[1] ? ", " + parts[1] : "");
        }

      } catch (err) {
        console.log("Geocoding failed: ", err);
      }

      setPoints((prev) => {
        if (prev.length >= 2) return prev;
        const newPoints = [...prev, [lat, lng]];

        // FIX: Wrap in setTimeout to avoid the "update while rendering" error
        if (onPointAdded) {
          setTimeout(() => {
            onPointAdded(newPoints.length, { lat, lng, name });
          }, 0);
        }

        return newPoints;
      });
    },
  });

  return null;
}

// 3. Helper: Routing Logic (Stabilized with Manual Cleanup)
function Routing({ points, setRoadMetrics }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || points.length !== 2) return;

    // Create the control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(points[0][0], points[0][1]),
        L.latLng(points[1][0], points[1][1]),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      containerClassName: 'hidden', 
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: "#2563eb", weight: 6, opacity: 0.8 }]
      }
    });

    try {
      routingControl.addTo(map);
      routingControlRef.current = routingControl;
    } catch (err) {
      console.warn("Routing initialization prevented a crash.");
    }

    routingControl.on('routesfound', (e) => {
      if (e.routes && e.routes[0]) {
        const summary = e.routes[0].summary;
        setRoadMetrics({
          distance: summary.totalDistance,
          time: summary.totalTime
        });
      }
    });

    // CRITICAL FIX: The Safe Cleanup
    return () => {
      if (routingControlRef.current && map) {
        const ctrl = routingControlRef.current;
        // Remove listeners first
        ctrl.getPlan().setWaypoints([]);
        ctrl.off('routesfound');
        
        setTimeout(() => {
          try {
            // Check if map still exists and container is attached
            if (map && map._container) {
              map.removeControl(ctrl);
            }
          } catch (e) {
            // This catches the 'removeLayer' of null error silently
            console.log("Routing cleanup suppressed a potential crash.");
          }
        }, 0);
      }
    };
  }, [map, points, setRoadMetrics]);

  return null;
}

// 4. MAIN COMPONENT
export default function CommuteMap({ onPointAdded, setDistance, setDuration }) {
  const [points, setPoints] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [roadMetrics, setRoadMetrics] = useState({ distance: 0, time: 0 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (setDistance) setDistance(roadMetrics.distance);
      if (setDuration) setDuration(roadMetrics.time);
    }, 0);
  }, [roadMetrics.distance, roadMetrics.time]);

  if (!isClient) return <div className="h-[450px] bg-zinc-100 animate-pulse rounded-[2.5rem]" />;

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .leaflet-routing-container, .leaflet-routing-error {
          display: none !important;
        }
      `}</style>

      <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-zinc-200 shadow-sm bg-white">
        <MapContainer
          center={[3.1390, 101.6869]}
          zoom={13}
          style={{ height: "450px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <LocationSelector setPoints={setPoints} onPointAdded={onPointAdded} />

          {points.map((position, index) => (
            <Marker key={`marker-${index}`} position={position} />
          ))}

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
                if (onPointAdded) onPointAdded(0, null);
              }}
              className="bg-white px-6 py-2 rounded-full shadow-xl text-[10px] font-black text-red-500 border border-zinc-100 hover:bg-red-50 transition-colors"
            >
              RESET POINTS
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        <div className="bg-zinc-100 p-8 rounded-[2rem] border border-zinc-200 flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Distance</span>
          <div className="text-3xl font-black">
            {(roadMetrics.distance / 1000).toFixed(2)} <span className="text-sm font-normal">km</span>
          </div>
        </div>
        <div className="bg-zinc-800 p-8 rounded-[2rem] text-white flex flex-col items-center shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Est. Time</span>
          <div className="text-3xl font-black text-emerald-400">
            {Math.floor(roadMetrics.time / 60)} <span className="text-sm font-normal text-white">mins</span>
          </div>
        </div>
      </div>
    </div>
  );
}