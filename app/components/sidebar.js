"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navElements = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard_icon.svg" },
    { name: "Log Commute", href: "/log_commute", icon: "log_commute_icon.svg" },
    { name: "Commute History", href: "/commute_history", icon: "commute_history_icon.svg" },
    { name: "Traffic Insights", href: "/traffic_insights", icon: "traffic_insights_icon.svg" },
    { name: "Profile", href: "/profile", icon: "profile_icon.svg" },
];

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`h-screen bg-gray-900 text-gray-100 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
            <div className="flex items-center justify-between h-20 bg-gray-800 border-b border-gray-700 px-4">
                {
                    !isCollapsed && (
                        <h1 className="text-3xl font-bold text-blue-400">
                            <Link href="/dashboard">Logo Here</Link>
                        </h1>
                    )
                }

                <button onClick={() => setIsCollapsed(!isCollapsed)} className='text-gray-100 focus:outline-none'>
                    {isCollapsed ? 'Expand' : 'Collapse'}
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <nav className="mt-10">
                    {navElements.map((navElement) => (
                        <Link href={navElement.href} key={navElement.name} className="block group">
                            <div className={`flex items-center py-3 px-4 transition-colors duration-300 hover:bg-gray-700 hover:text-blue-400 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                            
                            {/* Icon Wrapper */}
                            <div className={`flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'scale-125' : 'scale-90'}`}>
                                <Image 
                                src={`/icons/${navElement.icon}`} 
                                width={24} 
                                height={24} 
                                alt={`${navElement.name} icon`}
                                />
                            </div>

                            {/* Text Label */}
                            {!isCollapsed && (
                                <span className="ml-4 transition-opacity duration-300 whitespace-nowrap">
                                {navElement.name}
                                </span>
                            )}
                            </div>
                        </Link>
                        ))}
                </nav>
            
            </div> 
        </div>
    );
}
export default Sidebar;
