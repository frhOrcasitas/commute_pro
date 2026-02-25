"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

if (typeof window !== "undefined") {
    delete L.Icon.Default.prototype._getIconIrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
}

export default function LocationPicker ({ isOpen, onClose, onConfirm, label }) {
    const [tempPos, setTempPos] = useState([14.5995, 120.9842]); // Default: Manila
    const [addressName, setAddressName] = useState("");

    function MapClickHandler() {
        useMapEvents({
            async click(e) {
                const {lat, lng} = e.latlng;
                setTempPos([lat, lng]);

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    const parts = data.display_name.split(',');
                    setAddressName(parts[0] + (parts[1] ? ", " + parts[1] : ""));

                } catch (err) {
                    setAddressName("Unknown Location");
                }
            },
        });
        return tempPos ? <Marker position={tempPos} /> : null;
    }

    if (!isOpen) return null;

    return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="font-bold text-xl text-zinc-800">Set {label} Location</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">✕</button>
        </div>

        <div className="h-[350px] relative">
          <MapContainer center={tempPos} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler />
          </MapContainer>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Selected Address</p>
            <p className="text-sm font-medium text-zinc-700 truncate">{addressName || "Click on the map..."}</p>
          </div>

          <button
            onClick={() => onConfirm({ lat: tempPos[0], lng: tempPos[1], address: addressName })}
            className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition active:scale-95"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

