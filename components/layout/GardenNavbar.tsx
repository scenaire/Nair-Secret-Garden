"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
    { label: "Guestbook", href: "/guestbook", emoji: "" },
    { label: "Art Pavilion", href: "/gallery", emoji: "" },
    { label: "Picnic Canvas", href: "/canvas", emoji: "" },
    { label: "Wishing Well", href: "/wishing-well", emoji: "" },
];

interface NavbarProps {
    isLoggedIn: boolean;
    user?: { name: string; avatar: string } | null;
    onLogin: () => void;
    onLogout?: () => void;   // ← เพิ่ม
}

export function Navbar({ isLoggedIn, user, onLogin, onLogout }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const handleNav = (href: string) => {
        setOpenMobile(false);
        router.push(href);
    };

    const isActive = (href: string) => {
        if (!pathname) return false;
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    React.useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-[#C4A882]/20"
            style={{
                background: "rgba(253, 251, 244, 0.78)",
                backdropFilter: "blur(6px)",
            }}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="h-12 flex items-center justify-between gap-4">

                    {/* Logo / Brand */}
                    <button
                        onClick={() => handleNav("/")}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        type="button"
                    >
                        <span className="text-base">🌸</span>
                        <span
                            className="text-sm sm:text-base"
                            style={{
                                fontFamily: "'Noto Serif', serif",
                                color: "#8B5E52",
                                letterSpacing: "0.04em",
                            }}
                        >
                            Nair&apos;s Garden
                        </span>
                    </button>

                    {/* Center nav (desktop) */}
                    <div className="hidden md:flex items-center justify-center gap-6 flex-1">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);

                            return (
                                <button
                                    key={item.href}
                                    onClick={() => handleNav(item.href)}
                                    className="relative group text-[11px] uppercase tracking-[0.2em] flex items-center gap-1"
                                    type="button"
                                    style={{
                                        fontFamily: "'Noto Sans', sans-serif",
                                        color: active ? "#8B5E52" : "rgba(139,94,82,0.7)",
                                    }}
                                >
                                    <span className="hidden lg:inline-block text-xs opacity-80">
                                        {item.emoji}
                                    </span>
                                    <span>{item.label}</span>

                                    {/* active underline */}
                                    <span
                                        className="
    pointer-events-none
    absolute
    left-1/2
    -translate-x-1/2
    -bottom-1.5
    h-[3px]
    w-6
    rounded-full
    transition-all
    duration-200
  "
                                        style={{
                                            backgroundColor: active ? "rgba(196,168,130,0.9)" : "transparent",
                                            boxShadow: active ? "0 0 4px rgba(196,168,130,0.6)" : "none",
                                        }}
                                    />

                                    {/* hover underline (non-active) */}
                                    {!active && (
                                        <span
                                            className="
      pointer-events-none
      absolute
      left-1/2
      -translate-x-1/2
      -bottom-1.5
      h-[3px]
      w-6
      rounded-full
      opacity-0
      group-hover:opacity-100
      transition-opacity
      duration-150
    "
                                            style={{
                                                backgroundColor: "rgba(196,168,130,0.55)",
                                            }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right: user / login + mobile menu toggle */}
                    <div className="flex items-center gap-3">

                        {/* Desktop user section — แทนที่ของเดิมทั้งก้อน */}
                        <div className="hidden sm:flex items-center">
                            {isLoggedIn && user ? (
                                <div className="relative" ref={dropdownRef}>
                                    {/* Avatar button */}
                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(o => !o)}
                                        className="flex items-center gap-2 px-2 py-1 rounded-full transition-all duration-200 hover:bg-[rgba(230,215,189,0.35)]"
                                    >
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-7 h-7 rounded-full border border-[#E6D7BD]"
                                        />
                                        <span
                                            className="text-xs font-bold"
                                            style={{ fontFamily: "'Noto Sans', sans-serif", color: "#6B4C43" }}
                                        >
                                            {user.name}
                                        </span>
                                        {/* chevron */}
                                        <motion.svg
                                            width="10" height="10" viewBox="0 0 10 10" fill="none"
                                            animate={{ rotate: dropdownOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ opacity: 0.4 }}
                                        >
                                            <path d="M2 3.5L5 6.5L8 3.5" stroke="#8B5E52" strokeWidth="1.5" strokeLinecap="round" />
                                        </motion.svg>
                                    </button>

                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                                className="absolute right-0 mt-2 w-40 rounded-2xl overflow-hidden"
                                                style={{
                                                    backgroundColor: "#FFFDF9",
                                                    border: "1px solid rgba(196,168,130,0.2)",
                                                    boxShadow: "0 8px 24px rgba(139,94,82,0.1), 0 2px 8px rgba(139,94,82,0.06)",
                                                }}
                                            >
                                                {/* User info row */}
                                                <div className="px-4 py-3 border-b border-[#C4A882]/10 flex items-center gap-2">
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-6 h-6 rounded-full border border-[#E6D7BD]"
                                                    />
                                                    <span className="text-[11px] font-bold truncate"
                                                        style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                                                        {user.name}
                                                    </span>
                                                </div>

                                                {/* Logout button */}
                                                <button
                                                    type="button"
                                                    onClick={() => { setDropdownOpen(false); onLogout?.(); }}
                                                    className="w-full px-4 py-2.5 flex items-center gap-2 transition-colors hover:bg-[rgba(230,215,189,0.3)] group"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                                                        className="opacity-50 group-hover:opacity-80 transition-opacity">
                                                        <path d="M4.5 2H2.5C2 2 1.5 2.5 1.5 3V9C1.5 9.5 2 10 2.5 10H4.5M8 4L10.5 6L8 8M4.5 6H10.5"
                                                            stroke="#8B5E52" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <span className="text-[11px] uppercase tracking-[0.14em] opacity-60 group-hover:opacity-100 transition-opacity"
                                                        style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                                                        Logout
                                                    </span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <button
                                    onClick={onLogin}
                                    className="px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] rounded-full transition-all duration-200"
                                    style={{
                                        fontFamily: "'Noto Sans', sans-serif",
                                        backgroundColor: "#E6D7BD",
                                        color: "#7A6147",
                                        boxShadow: "0 2px 8px rgba(139,94,82,0.15)",
                                    }}
                                >
                                    Enter the Garden ✦
                                </button>
                            )}
                        </div>

                        {/* Mobile menu toggle */}
                        <button
                            type="button"
                            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-[rgba(230,215,189,0.4)] transition-colors"
                            onClick={() => setOpenMobile((o) => !o)}
                            aria-label="Toggle navigation"
                        >
                            <div className="space-y-[3px]">
                                <span
                                    className="block w-4 h-[1px] bg-[#8B5E52] transition-transform"
                                    style={{
                                        transform: openMobile
                                            ? "translateY(2px) rotate(45deg)"
                                            : "translateY(0) rotate(0)",
                                    }}
                                />
                                <span
                                    className="block w-4 h-[1px] bg-[#8B5E52] transition-transform"
                                    style={{
                                        transform: openMobile
                                            ? "translateY(-2px) rotate(-45deg)"
                                            : "translateY(0) rotate(0)",
                                    }}
                                />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {openMobile && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden pb-3"
                        >
                            <div className="pt-1 pb-2 flex flex-col gap-1 border-t border-[#C4A882]/15">
                                {NAV_ITEMS.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <button
                                            key={item.href}
                                            type="button"
                                            onClick={() => handleNav(item.href)}
                                            className="w-full flex items-center justify-between py-1.5"
                                            style={{
                                                fontFamily: "'Noto Sans', sans-serif",
                                                fontSize: "11px",
                                                letterSpacing: "0.16em",
                                                textTransform: "uppercase",
                                                color: active
                                                    ? "#8B5E52"
                                                    : "rgba(139,94,82,0.78)",
                                            }}
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-sm">{item.emoji}</span>
                                                <span>{item.label}</span>
                                            </span>
                                            {active && (
                                                <span className="w-8 h-[1px] bg-[#C4A882]" />
                                            )}
                                        </button>
                                    );
                                })}

                                {/* Mobile login / user */}
                                <div className="mt-2 pt-2 border-t border-[#C4A882]/15 flex items-center justify-between">
                                    {isLoggedIn && user ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-6 h-6 rounded-full border border-[#E6D7BD]"
                                                />
                                                <span
                                                    className="text-[11px]"
                                                    style={{
                                                        fontFamily: "'Noto Sans', sans-serif",
                                                        color: "#8B5E52",
                                                    }}
                                                >
                                                    {user.name}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={onLogin}
                                            className="text-[11px] uppercase tracking-[0.16em] ml-auto hover:opacity-85 transition-opacity"
                                            style={{
                                                fontFamily: "'Noto Sans', sans-serif",
                                                color: "#8B5E52",
                                            }}
                                        >
                                            Enter the Garden ✦
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
}