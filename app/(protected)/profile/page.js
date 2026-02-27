"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import LocationPicker from "@/app/components/LocationPicker";

export default function Profile() {
  const [locationAccess, setLocationAccess] = useState(true);
  const [reminders, setReminders]           = useState(true);
  const [aiSuggestions, setAiSuggestions]   = useState(true);
  const [loading, setLoading]               = useState(true);
  const [userData, setUserData]             = useState({ email: "", name: "", password: "" });

  const [savedLocations, setSavedLocations] = useState({
    home:   { address: "", lat: null, lng: null },
    work:   { address: "", lat: null, lng: null },
    school: { address: "", lat: null, lng: null },
  });

  const [modalConfig, setModalConfig] = useState({ isOpen: false, target: "" });

  useEffect(() => {
    const fetchAllUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("tbl_users")
        .select("user_name")
        .eq("user_id", user.id)
        .single();

      setUserData({
        email: user.email,
        name: profileData?.user_name || user.user_metadata?.full_name || "New User",
      });

      const { data: locData, error: locError } = await supabase
        .from("tbl_saved_locations")
        .select("label, address, lat, lng")
        .eq("user_id", user.id);

      if (locError) console.error("Location Fetch Error:", locError);
      if (locData) {
        const loadedLocs = {
          home:   { address: "", lat: null, lng: null },
          work:   { address: "", lat: null, lng: null },
          school: { address: "", lat: null, lng: null },
        };
        locData.forEach((loc) => {
          if (!loc.label) return;
          const key = loc.label.toLowerCase();
          if (key in loadedLocs) loadedLocs[key] = { address: loc.address || "", lat: loc.lat || null, lng: loc.lng || null };
        });
        setSavedLocations(loadedLocs);
      }

      const { data: settingsData } = await supabase
        .from("tbl_user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settingsData) {
        setLocationAccess(settingsData.location_access);
        setReminders(settingsData.commute_reminders);
        setAiSuggestions(settingsData.ai_suggestions);
      }

      if ("Notification" in window && Notification.permission !== "granted") setReminders(false);
      if (navigator.permissions) {
        navigator.permissions.query({ name: "geolocation" }).then((r) => {
          if (r.state !== "granted") setLocationAccess(false);
        });
      }

      setLoading(false);
    };
    fetchAllUserData();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert("Error logging out");
    else window.location.href = "/login";
  };

  const handleSaveSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("tbl_user_settings").upsert({
      user_id: user.id,
      location_access: locationAccess,
      commute_reminders: reminders,
      ai_suggestions: aiSuggestions,
    });
    if (error) alert("Error saving settings");
    else alert("Preferences updated!");
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("tbl_users").update({ user_name: userData.name }).eq("user_id", user.id);
    if (error) alert("Error: " + error.message);
    else alert("Name updated successfully!");
    setLoading(false);
  };

  const handleSaveLocations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please log in first");

    const updates = Object.entries(savedLocations)
      .filter(([_, d]) => d.address.trim() !== "")
      .map(([label, d]) => ({
        user_id: user.id,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        address: d.address,
        lat: d.lat,
        lng: d.lng,
      }));

    const { error } = await supabase.from("tbl_saved_locations").upsert(updates, { onConflict: "user_id, label" });
    if (error) { console.error(error); alert("Error saving locations"); }
    else alert("Locations updated!");
  };

  const handleMapConfirm = (data) => {
    setSavedLocations((prev) => ({ ...prev, [modalConfig.target]: data }));
    setModalConfig({ isOpen: false, target: "" });
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) { alert("This browser does not support notifications."); return; }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Notifications Enabled!", { body: "You will now receive traffic strategy alerts here.", icon: "/favicon.ico" });
      setReminders(true);
    } else {
      setReminders(false);
      alert("Notifications were denied. Please enable them in browser settings.");
    }
  };

  const requestLocationPermission = () => {
    if (!("geolocation" in navigator)) { alert("Geolocation is not supported."); setLocationAccess(false); return; }
    navigator.geolocation.getCurrentPosition(
      () => setLocationAccess(true),
      () => { alert("Please enable location permissions in your browser settings."); setLocationAccess(false); }
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-10 text-black max-w-7xl mx-auto">

      <LocationPicker
        isOpen={modalConfig.isOpen}
        label={modalConfig.target}
        onClose={() => setModalConfig({ isOpen: false, target: "" })}
        onConfirm={handleMapConfirm}
      />

      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={handleLogout}
          className="text-xs sm:text-sm bg-[#D1495B] hover:bg-[#D1495B]/80 text-white px-3 sm:px-4 py-2 rounded-lg transition font-medium"
        >
          Log Out
        </button>
      </div>

      {/* Account Information */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Account Information</h2>

        <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-6 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="space-y-3 sm:space-y-4">
            <InputField
              label="Name"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            />
            <InputField label="Email"    value={userData.email}    disabled />
            <InputField label="Password" placeholder="••••••••••••" type="password" value={userData.password} disabled />

            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="mt-1 bg-[#30638E] hover:bg-[#30638E]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save Info"}
            </button>
          </div>

          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-zinc-100 border-4 border-[#30638E]/20 overflow-hidden flex items-center justify-center">
              {userData.email
                ? <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${userData.email}`} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="text-zinc-400 text-4xl">?</span>
              }
            </div>
          </div>
        </div>
      </section>

      {/* Settings + Saved Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">

        {/* Settings */}
        <section className="space-y-4 sm:space-y-5">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Settings</h2>

          <SettingToggle
            label="Location Access"
            state={locationAccess}
            setState={(val) => val ? requestLocationPermission() : setLocationAccess(false)}
            color="#00798C"
          />
          <SettingToggle
            label="Commute Reminders"
            state={reminders}
            setState={(val) => { setReminders(val); if (val) requestNotificationPermission(); }}
            color="#EDAE49"
          />
          <SettingToggle
            label="AI Suggestions"
            state={aiSuggestions}
            setState={setAiSuggestions}
            color="#30638E"
          />

          <button
            onClick={handleSaveSettings}
            className="w-full mt-1 bg-[#30638E] hover:bg-[#30638E]/90 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm transition"
          >
            Save Preferences
          </button>
        </section>

        {/* Saved Locations */}
        <section className="space-y-4 sm:space-y-5">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Saved Locations</h2>

          <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-6 space-y-4">
            {[
              { key: "home",   label: "Home",   color: "#00798C" },
              { key: "work",   label: "Work",   color: "#30638E" },
              { key: "school", label: "School", color: "#EDAE49" },
            ].map(({ key, label, color }) => (
              <LocationInput
                key={key}
                label={label}
                color={color}
                value={savedLocations[key].address}
                onMapClick={() => setModalConfig({ isOpen: true, target: key })}
                onChange={(val) => setSavedLocations({ ...savedLocations, [key]: { ...savedLocations[key], address: val } })}
              />
            ))}

            <button
              onClick={handleSaveLocations}
              className="bg-[#30638E] hover:bg-[#30638E]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition mt-1"
            >
              Save Locations
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function InputField({ label, value, onChange, placeholder, type = "text", disabled = false }) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-xs sm:text-sm text-zinc-500 font-medium">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        readOnly={!onChange && !disabled}
        placeholder={placeholder}
        className="bg-zinc-100 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#30638E] transition disabled:opacity-60"
      />
    </div>
  );
}

function SettingToggle({ label, state, setState, color = "#30638E" }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 flex justify-between items-center">
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium">{label}</span>
      </div>

      <button
        onClick={() => setState(!state)}
        className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0"
        style={{ backgroundColor: state ? color : "#d1d5db" }}
      >
        <div className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${state ? "translate-x-7" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

function LocationInput({ label, value, onChange, onMapClick, color }) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</label>
      <div className="relative flex items-center">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="search"
          name={`location-${label.toLowerCase()}`}
          placeholder={`Enter your ${label.toLowerCase()} address`}
          className="w-full bg-zinc-100 px-3 py-2.5 pr-11 rounded-lg outline-none focus:ring-2 transition text-sm"
          style={{ "--tw-ring-color": color }}
          onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${color}40`}
          onBlur={(e)  => e.target.style.boxShadow = "none"}
        />
        <button
          type="button"
          onClick={onMapClick}
          className="absolute right-2 p-1.5 bg-white rounded-md shadow-sm border border-zinc-200 hover:bg-zinc-50 transition"
          title="Set on map"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}