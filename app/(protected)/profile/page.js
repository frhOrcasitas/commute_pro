"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function profile() {
    const [locationAccess, setLocationAccess] = useState(true);
    const [reminders, setReminders] = useState(true);
    const [aiSuggestions, setAiSuggestions] = useState(true);

    const [savedLocations, setSavedLocations] = useState({
        home: "",
        work: "",
        school: "",
    });

    return (
        <div className="p-8 space-y-10 text-black">
                <h1 className="text-3xl font-bold">Profile</h1>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Account Information</h2>
                        <Link href="/login" className="text-white hover:text-gray-300 transition duration-300">
                            <button className="text-sm bg-zinc-200 hover:bg-zinc-300 px-4 py-2 rounded-lg transition">
                            Log Out
                            </button>
                        </Link>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 grid md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-4">
                            <InputField label="Name" placeholder="John Doe" />
                            <InputField label="Email" placeholder="user@email.com" />
                            <InputField label="Password" placeholder="••••••••••••" type="password" />

                            <button className="mt-2 bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition">
                                Save Info
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <div className="w-40 h-40 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-5xl">
                                Insert Profile Here
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
                            setState={setLocationAccess}
                        />

                        <SettingToggle
                            label="COmmute Reminders"
                            state={reminders}
                            setState={setReminders}
                        />

                        <SettingToggle
                            label="AI Suggestions"
                            state={aiSuggestions}
                            setState={setAiSuggestions}
                        />
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold">Saved Locations</h2>

                        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4">
                            <LocationInput 
                                label="Home"
                                value={savedLocations.home}
                                onChange={(val) => setSavedLocations({ ...savedLocations, home: val})} />
                            
                            <LocationInput 
                                label="Work"
                                value={savedLocations.work}
                                onChange={(val) => setSavedLocations({ ...savedLocations, work: val})} />

                            <LocationInput 
                                label="School"
                                value={savedLocations.school}
                                onChange={(val) => setSavedLocations({ ...savedLocations, school: val})} />
                            
                            <button className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition">
                                Save Locations
                            </button>
                        </div>
                    </div>
                </div>
        </div> 
    );
}

// Components

function InputField ({ label, placeholder, type = "text"}) {
    return (
        <div className="flex flex-col space-y-1">
            <label className="text-sm text-zinc-500">{label}</label>
            <input
                type={type}
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
                className={`w-4 h-7 flex items-center rounded-full p-1 transition ${
                    state ? "bg-green-500" : "bg-zinc-300"
                }`}
            > 
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
                    state ? "translate-x-7" : ""
                }`} />
            </button>
        </div>
    );
}

function LocationInput({label, value, onChange}) {
    return(
        <div className="flex flex-col space-y-1">
            <label className="text-sm text-zinc-500">{label}</label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${label} location`}
                className="bg-zinc-100 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-zinc-400 transition"/>
        </div>
    );
}
