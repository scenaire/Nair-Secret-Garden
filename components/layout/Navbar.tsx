"use client";

// components/layout/Navbar.tsx
// Export แยกไว้ด้วยในกรณีที่อยากใช้ Navbar ในหน้าอื่นๆ

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StampCard } from "@/components/ui/StampCard";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
    { label: "Guestbook 📖", href: "/guestbook" },
    { label: "Art Pavilion 🎨", href: "/gallery" },
    { label: "Picnic Canvas 🖌️", href: "/canvas" },
    { label: "Wishing Well ⛲", href: "/wishlist" },
    { label: "Announcements 📢", href: "/overlay" },
];

interface NavbarProps {
    isLoggedIn: boolean;
    user?: { name: string; avatar: string } | null;
    onLogin: () => void;
}

export function Navbar({ isLoggedIn, user, onLogin }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 px-4 py-2"
        >
            <div className="max-w-6xl mx-auto">
                <StampCard
                    bgColor="rgba(255,253,249,0.92)"
                    teethRadius={6}
                    teethDensity={0.8}
                    borderColor="rgba(155,107,126,0.15)"
                >
                    <div className="flex items-center justify-between px-5 py-2.5 gap-4">

                        {/* Logo */}
                        <button
                            onClick={() => router.push("/")}
                            className="font-serif text-sm font-medium whitespace-nowrap flex-shrink-0 hover:opacity-80 transition-opacity"
                            style={{ color: "var(--theme-accent-text, #9B6B7E)" }}
                        >
                            🌸 Nair&apos;s Garden
                        </button>

                        {/* Nav items */}
                        <AnimatePresence>
                            {isLoggedIn && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="hidden md:flex items-center gap-1 flex-1 justify-center"
                                >
                                    {NAV_ITEMS.map((item, i) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <motion.button
                                                key={item.href}
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.06, duration: 0.3 }}
                                                onClick={() => router.push(item.href)}
                                                className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105 font-serif whitespace-nowrap relative"
                                                style={{
                                                    color: "var(--theme-accent-text, #9B6B7E)",
                                                    backgroundColor: isActive
                                                        ? "color-mix(in srgb, var(--theme-btn-bg, #F4C9D4) 60%, transparent)"
                                                        : "color-mix(in srgb, var(--theme-btn-bg, #F4C9D4) 25%, transparent)",
                                                    fontWeight: isActive ? 600 : 400,
                                                }}
                                            >
                                                {item.label}
                                                {isActive && (
                                                    <motion.span
                                                        layoutId="nav-active-dot"
                                                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                                        style={{ backgroundColor: "var(--theme-accent-text, #9B6B7E)" }}
                                                    />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* User / Login */}
                        <div className="flex-shrink-0">
                            {isLoggedIn && user ? (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="flex items-center gap-2"
                                >
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-7 h-7 rounded-full border-2"
                                        style={{ borderColor: "var(--theme-btn-bg, #F4C9D4)" }}
                                    />
                                    <span className="text-xs font-serif hidden sm:block"
                                        style={{ color: "var(--theme-accent-text, #9B6B7E)" }}>
                                        {user.name}
                                    </span>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={onLogin}
                                    className="text-xs px-3 py-1.5 rounded-full font-serif transition-all hover:scale-105 whitespace-nowrap"
                                    style={{
                                        backgroundColor: "var(--theme-btn-bg, #F4C9D4)",
                                        color: "var(--theme-accent-text, #9B6B7E)",
                                    }}
                                >
                                    Login
                                </button>
                            )}
                        </div>

                    </div>
                </StampCard>
            </div>
        </motion.nav>
    );
}