"use client";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Polyline } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

// Fix for Leaflet Default Icon
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Automatically centers map when points are added
function MapRecenter({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p[0], p[1]]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [points, map]);
  return null;
}

function LocationSelector({ points, onPointAdded }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      if (points.length >= 2) return;

      let name = "Selected Location";
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        if (data.display_name) {
          const parts = data.display_name.split(',');
          name = parts[0] + (parts[1] ? ", " + parts[1] : "");
        }
      } catch (err) { console.log(err); }

      onPointAdded(points.length + 1, { lat, lng, name });
    },
  });
  return null;
}

function Routing({ points, setRoadMetrics }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  // 1. Setup the control once and only once
  useEffect(() => {
    if (!map || routingControlRef.current) return;

    const control = L.Routing.control({
      waypoints: [],
      lineOptions: {
        styles: [{ color: "#2563eb", weight: 6, opacity: 0.8 }],
        addWaypoints: false,
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
    }).addTo(map);

    control.on("routesfound", (e) => {
      const routes = e.routes;
      if (routes && routes[0]) {
        setRoadMetrics({
          distance: routes[0].summary.totalDistance,
          time: routes[0].summary.totalTime
        });
      }
    });

    routingControlRef.current = control;

    return () => {
      if (routingControlRef.current) {
        try {
          // Remove the routes and the control safely
          routingControlRef.current.setWaypoints([]);
          map.removeControl(routingControlRef.current);
        } catch (e) {
          console.warn("Leaflet cleanup swallowed:", e);
        }
        routingControlRef.current = null;
      }
    };
  }, [map]); // Only depends on map init

  // 2. Separate Effect for updating Waypoints
  useEffect(() => {
    const control = routingControlRef.current;
    if (!control) return;

    if (points && points.length === 2) {
      const wp1 = L.latLng(points[0][0], points[0][1]);
      const wp2 = L.latLng(points[1][0], points[1][1]);
      
      // Only update if coordinates actually changed to prevent loops
      const currentWps = control.getWaypoints();
      const isSame = currentWps.length === 2 && 
                     currentWps[0].latLng?.lat === wp1.lat && 
                     currentWps[1].latLng?.lat === wp2.lat;

      if (!isSame) {
        control.setWaypoints([wp1, wp2]);
      }
    } else if (points.length === 0) {
      control.setWaypoints([]);
    }
  }, [points]); // Only depends on points changing

  return null;
}

export default function CommuteMap({ onPointAdded, setDistance, setDuration, livePath = [], externalStart, externalEnd }) {
  const [isClient, setIsClient] = useState(false);
  const [roadMetrics, setRoadMetrics] = useState({ distance: 0, time: 0 });

  const points = [];
  if (externalStart?.lat) points.push([externalStart.lat, externalStart.lng, externalStart.name]);
  if (externalEnd?.lat) points.push([externalEnd.lat, externalEnd.lng, externalEnd.name]);

  useEffect(() => { setIsClient(true); }, []);

  // Pass metrics back up to parent
  useEffect(() => {
    if (setDistance) setDistance(roadMetrics.distance);
    if (setDuration) setDuration(roadMetrics.time);
  }, [roadMetrics, setDistance, setDuration]);

  if (!isClient) return <div className="h-[450px] bg-zinc-100 animate-pulse rounded-[2.5rem]" />;

  return (
    <div className="space-y-6">
      <style jsx global>{`
        .leaflet-routing-container { display: none !important; }
      `}</style>
      
      <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-zinc-200 shadow-sm bg-white">
        <MapContainer center={[7.07, 125.6]} zoom={13} style={{ height: "450px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          <MapRecenter points={points} />
          
          {livePath && livePath.length > 1 && (
            <Polyline 
              positions={livePath} 
              pathOptions={{ color: "#10b981", weight: 4, dashArray: "5, 10" }} 
            />
          )}

          <LocationSelector points={points} onPointAdded={onPointAdded} />
          
          {points.map((p, i) => (
            <Marker key={`${i}-${p[0]}`} position={[p[0], p[1]]} />
          ))}

          <Routing points={points} setRoadMetrics={setRoadMetrics} />
        </MapContainer>

        <div className="absolute top-4 right-4 z-[1000]">
          {points.length > 0 && (
            <button 
              onClick={() => {
                setRoadMetrics({ distance: 0, time: 0 });
                onPointAdded(0, null);
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