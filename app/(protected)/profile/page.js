"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import LocationPicker from "@/app/components/LocationPicker";

export default function profile() {
    const [locationAccess, setLocationAccess] = useState(true);
    const [reminders, setReminders] = useState(true);
    const [aiSuggestions, setAiSuggestions] = useState(true);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({email: "", name: "", password: ""});

    const [savedLocations, setSavedLocations] = useState({
        home: { address: "", lat: null, lng: null },
        work: { address: "", lat: null, lng: null },
        school: { address: "", lat: null, lng: null },
    });

    const [modalConfig, setModalConfig] = useState({ isOpen: false, target: "" });

    useEffect(() => {
        const fetchAllUserData = async () => {
            const { data: {user} } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profileData } = await supabase
                .from("tbl_users")
                .select("user_name")
                .eq("user_id", user.id)
                .single();

            setUserData({
                email: user.email,
                name: profileData?.user_name || user.user_metadata?.full_name || "New User"
            });

            // Locations
            const { data: locData, error: locError } = await supabase 
                .from("tbl_saved_locations")
                .select("label, address, lat, lng")
                .eq("user_id", user.id);

                if(locError) console.error("Location Fetch Error: ", locError);
            
                if (locData) {
                    console.log("Raw Location Data from DB: ", locData);
                    const loadedLocs = { 
                        home: {address: "", lat: null, lng: null}, 
                        work: {address: "", lat: null, lng: null}, 
                        school: {address: "", lat: null, lng: null}
                    };

                    locData.forEach((loc) => {
                        if(!loc.label) return;

                        const key = loc.label.toLowerCase();
                        if (key in loadedLocs) {
                            loadedLocs[key] = { address: loc.address || "", lat: loc.lat || null, lng: loc.lng || null };
                        }
                    });
                    setSavedLocations(loadedLocs);
                }

                const {data: settingsData } = await supabase
                    .from("tbl_user_settings")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();
                
                    if (settingsData) {
                        setLocationAccess(settingsData.location_access);
                        setReminders(settingsData.commute_reminders);
                        setAiSuggestions(settingsData.ai_suggestions);
                    }

                setLoading(false);
        };
        fetchAllUserData();
    }, []);

    const handleLogout = async () => {
        const {error} = await supabase.auth.signOut();
        if(error) {
            alert("Error logging out");

        } else {
            window.location.href = "/login";
        }
    }

    const handleSaveSettings = async () => {
        const {data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const {error} = await supabase
            .from("tbl_user_settings")
            .upsert({
                user_id: user.id,
                location_access: locationAccess,
                commute_reminders: reminders,
                ai_suggestions: aiSuggestions,
            });
        
        if (error) alert ("Error saving settings");
        else alert ("Preferences updated!");
    };

    const handleUpdateProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // This updates the 'user_name' column in your custom table
    const { error: dbError } = await supabase
            .from("tbl_users")
            .update({ user_name: userData.name }) 
            .eq("user_id", user.id);

        if (dbError) {
            alert("Error: " + dbError.message);
        } else {
            alert("Name updated successfully!");
        }
        setLoading(false);
    };

    const handleSaveLocations = async () => {
        const { data: {user} } = await supabase.auth.getUser();
        if (!user) return alert("Please log in first");

        const updates = Object.entries(savedLocations)
            .filter(([_, data]) => data.address.trim() !== "")
            .map(([label, data]) => ({
                user_id: user.id,
                label: label.charAt(0).toUpperCase() + label.slice(1),
                address: data.address,
                lat: data.lat,   // Added to database upsert
                lng: data.lng    // Added to database upsert
            }));
        
        const { error } = await supabase
            .from("tbl_saved_locations")
            .upsert(updates, { onConflict: "user_id, label"});

        if (error) {
            console.error(error);
            alert("Error saving locations");
        } else {
            alert("Locations updated!");
        }
    };

    // Handler for when map confirms a location
    const handleMapConfirm = (data) => {
        setSavedLocations(prev => ({
            ...prev,
            [modalConfig.target]: data 
        }));
        setModalConfig({ isOpen: false, target: "" });
    };

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            alert("This browser does not support notifications.");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            // Registers the worker you put in the public folder
            await navigator.serviceWorker.register('/sw.js');
            console.log("Notifications enabled!");
        } else {
            setReminders(false); // Turn toggle off if they deny
        }
    };

    const requestLocationPermission = () => {
        if (!("geolocation") in navigator) {
            alert("Geolocation is not supported by your browser.");
            setLocationAccess(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Location access granted!");
                setLocationAccess(true);
            },
            (error) => {
                console.error("Location access denied:", error);
                alert("Please enable location permissions in your browser settings.");
                setLocationAccess(false);
            }
        );
    };

    return (
        <div className="p-8 space-y-10 text-black">
                <h1 className="text-3xl font-bold">Profile</h1>

                <LocationPicker
                    isOpen={modalConfig.isOpen}
                    label={modalConfig.target}
                    onClose={() => setModalConfig({ isOpen: false, target: "" })}
                    onConfirm={handleMapConfirm}
                />

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Account Information</h2>
                        <Link href="/login" className="text-white hover:text-gray-300 transition duration-300">
                            <button 
                            onClick={handleLogout}
                            className="text-sm bg-red-400 hover:bg-red-800 px-4 py-2 rounded-lg transition">
                            Log Out
                            </button>
                        </Link>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 grid md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-4">
                            <InputField label="Name" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
                            <InputField label="Email" value={userData.email} disabled={true} />
                            <InputField label="Password" placeholder="••••••••••••" type="password" value={userData.password} disabled={true}/>

                            <button className="mt-2 bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition"
                                    onClick={handleUpdateProfile}
                                    disabled={loading}>
                                {loading ? "Saving..." : "Save Info"}
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <div className="w-40 h-40 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-5xl">
                                {userData.email ? (<img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${userData.email}`}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"/>) : 
                                                    (<span className="text-zinc-400 text-5xl">?</span>)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold">Settings</h2>

                        <SettingToggle
                            label="Location Access"
                            state={locationAccess}
                            setState={(val) => {
                                if (val === true) {
                                    requestLocationPermission();
                                } else {
                                    setLocationAccess(false);
                                }
                            }}
                        />

                        <SettingToggle
                            label="Commute Reminders"
                            state={reminders}
                            setState={(val) => {
                                setReminders(val);
                                if (val === true) requestNotificationPermission();
                            }}
                        />

                        <SettingToggle
                            label="AI Suggestions"
                            state={aiSuggestions}
                            setState={setAiSuggestions}
                        />

                        <button onClick={handleSaveSettings}
                                className="w-full mt-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 py-3 rounded-xl font-bold transition text-sm">
                                    Save Preferences
                        </button>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold">Saved Locations</h2>

                        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
                            <LocationInput 
                                label="Home"
                                value={savedLocations.home.address}
                                onMapClick={() => setModalConfig({ isOpen: true, target: "home" })}
                                onChange={(val) => setSavedLocations({ ...savedLocations, home: { ...savedLocations.home, address: val }})} />
                            
                            <LocationInput 
                                label="Work"
                                value={savedLocations.work.address}
                                onMapClick={() => setModalConfig({isOpen: true, target:"work"})}
                                onChange={(val) => setSavedLocations({ ...savedLocations, work: {...savedLocations.work, address: val }})} />

                            <LocationInput 
                                label="School"
                                value={savedLocations.school.address}
                                onMapClick={() => setModalConfig({ isOpen: true, target: "school" })}
                                onChange={(val) => setSavedLocations({ ...savedLocations, school: {...savedLocations.school, address: val}})} />
                            
                            <button className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition"
                                    onClick={handleSaveLocations}>
                                Save Locations
                            </button>
                        </div>
                    </div>
                </div>
        </div> 
    );
}

// Components

function InputField ({ label, value, onChange, placeholder, type = "text", disabled=false}) {
    return (
        <div className="flex flex-col space-y-1">
            <label className="text-sm text-zinc-500">{label}</label>
            <input
                type={type}
                value={value || ""}
                onChange={onChange}
                disabled={disabled}
                readOnly={!onChange && !disabled}
                placeholder={placeholder}
                className="bg-zinc-100 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-zinc-400 transition"/>
        </div>
    );
}

function SettingToggle({ label, state, setState}) {
    return (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex justify-between items-center">
            <span className="text-sm font-medium">{label}</span>

            <button
                onClick={() => setState(!state)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    state ? "bg-green-500" : "bg-zinc-300"
                }`}
            > 
                <div className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    state ? "translate-x-7" : "translate-x-1"
                }`} />
            </button>
        </div>
    );
}

function LocationInput({label, value, onChange, onMapClick}) {
    return(
        <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold uppercase text-zinc-400">{label}</label>
            <div className="relative flex items-center">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type="search"
                    name={`location-${label.toLowerCase()}`}
                    placeholder={`Enter your ${label.toLowerCase()} address`}
                    className="w-full bg-zinc-100 px-3 py-2.5 pr-12 rounded-lg outline-none focus:ring-2 focus:ring-zinc-400 transition text-sm"/>
                
                <button 
                    type="button"
                    onClick={onMapClick}
                    className="absolute right-2 p-1.5 bg-white rounded-md shadow-sm border border-zinc-200 hover:bg-zinc-50 transition"
                    title="Set on map"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </button>
            </div>
        </div>
    );
}
