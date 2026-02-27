"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const navElements = [
  { name: "Dashboard",       href: "/dashboard",        icon: "dashboard_icon.svg" },
  { name: "Log Commute",     href: "/log_commute",      icon: "log_commute_icon.svg" },
  { name: "Commute History", href: "/commute_history",  icon: "commute_history_icon.svg" },
  { name: "Traffic Insights",href: "/traffic_insights", icon: "traffic_insights_icon.svg" },
  { name: "Profile",         href: "/profile",          icon: "profile_icon.svg" },
];

const Sidebar = () => {
  // Desktop: whether the full-width drawer is open (overlaying content)
  const [isExpanded, setIsExpanded] = useState(false);
  // Mobile: whether the drawer is open
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Shared nav link list
  const NavLinks = ({ onClick }) => (
    <nav className="mt-6 flex flex-col gap-1 px-2">
      {navElements.map((el) => (
        <Link
          href={el.href}
          key={el.name}
          onClick={onClick}
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-300 hover:bg-[#003D5B] hover:text-blue-400 transition-colors duration-200 group"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6">
            <Image
              src={`/icons/${el.icon}`}
              width={22}
              height={22}
              alt={`${el.name} icon`}
            />
          </span>
          <span className="text-sm font-medium whitespace-nowrap">{el.name}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* ─────────────────────────────────────────────
          DESKTOP SIDEBAR  (md and up)
      ───────────────────────────────────────────── */}
      <div className="hidden md:flex">

        {/* Collapsed icon rail — always visible, never moves */}
        <div className="relative z-40 flex flex-col h-screen w-16 bg-[#003D5B] border-r border-gray-700 flex-shrink-0">

          {/* Logo area / toggle button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="flex items-center justify-center h-16 w-full hover:bg-[#003D5B] transition-colors border-b border-gray-700"
            >
            <img
                src="/commutepro_icon.svg"
                width={40}
                height={40}
                alt="toggle sidebar"
                className="object-contain"
            />
        </button>

          {/* Icon-only nav */}
          <nav className="mt-6 flex flex-col gap-1 px-2">
            {navElements.map((el) => (
              <Link
                href={el.href}
                key={el.name}
                title={el.name}
                className="flex items-center justify-center rounded-lg p-3 text-gray-300 hover:bg-[#003D5B] hover:text-blue-400 transition-colors duration-200"
              >
                <Image
                  src={`/icons/${el.icon}`}
                  width={22}
                  height={22}
                  alt={`${el.name} icon`}
                />
              </Link>
            ))}
          </nav>
        </div>

        {/* Expanded drawer — slides out OVER the content */}
        <div
          className={`
            fixed top-0 left-16 z-30 h-screen w-56
            bg-[#003D5B] border-r border-gray-700
            flex flex-col
            shadow-2xl
            transition-transform duration-300 ease-in-out
            ${isExpanded ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Logo / app name */}
          <div className="flex items-center h-16 px-4 border-b border-gray-700">
            <Link href="/dashboard" className="text-xl font-bold text-blue-400 truncate">
              <Image
                  src="/commutepro_full.svg"
                  width={256}
                  height={64}
                  alt="commutepro logo"
                />
            </Link>
          </div>

          <NavLinks onClick={() => setIsExpanded(false)} />
        </div>

        {/* Scrim — clicking it closes the drawer */}
        {isExpanded && (
          <div
            className="fixed inset-0 z-20 bg-black/30"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>

      <div className="md:hidden">

        {/* Top bar with hamburger */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-14 bg-[#003D5B] border-b border-gray-700 px-4 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-1 text-gray-300 hover:text-blue-400 transition-colors"
          >
             <img
                src="/commutepro_icon.svg"
                width={40}
                height={40}
                alt="toggle sidebar"
                className="object-contain"
            />
          </button>
          <Image
                  src="/commutepro_full.svg"
                  width={128}
                  height={32}
                  alt="commutepro logo"
                />
        </header>

        {/* Spacer so page content doesn't hide under the header */}
        <div className="h-14" />

        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Slide-in drawer */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-64
            bg-[#003D5B] border-r border-gray-700
            flex flex-col shadow-2xl
            transition-transform duration-300 ease-in-out
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-700">
            <Link href="/dashboard" className="text-xl font-bold text-blue-400" onClick={() => setMobileOpen(false)}>
              <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="flex items-center justify-center h-16 w-full hover:bg-[#003D5B] transition-colors border-b border-gray-700"
            >
            <img
                src="/commutepro_icon.svg"
                width={40}
                height={40}
                alt="toggle sidebar"
                className="object-contain"
            />
            </button>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="p-1 text-gray-300 hover:text-blue-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <NavLinks onClick={() => setMobileOpen(false)} />
        </aside>
      </div>
    </>
  );
};

export default Sidebar;