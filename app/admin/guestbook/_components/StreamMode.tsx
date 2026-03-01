"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, ChevronLeft, ChevronRight, Play, Pause, Eye, EyeOff } from "lucide-react";
import { GuestbookEntry } from "../_types";
import { getTheme } from "../_constants";
import { EntryFull } from "./EntryFull";

const pageVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 50 : -50, rotate: d > 0 ? 2 : -2 }),
    center: { opacity: 1, x: 0, rotate: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -50 : 50, rotate: d > 0 ? -2 : 2 }),
};

interface StreamModeProps {
    entries: GuestbookEntry[];
    onThemeChange: (theme: string) => void;
}

export function StreamMode({ entries, onThemeChange }: StreamModeProps) {
    const [order, setOrder] = useState<number[]>(() => entries.map((_, i) => i));
    const [pos, setPos] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [showAuthor, setShowAuthor] = useState(true);
    const [autoplay, setAutoplay] = useState(false);
    const [autoDelay, setAutoDelay] = useState(8);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const current = entries[order[pos]];
    const total = entries.length;
    const t = getTheme(current?.theme || "cream");

    useEffect(() => {
        if (current?.theme) onThemeChange(current.theme);
    }, [current?.theme, onThemeChange]);

    const go = useCallback((dir: 1 | -1) => {
        setDirection(dir);
        setPos((p) => {
            const next = p + dir;
            if (next < 0) return total - 1;
            if (next >= total) return 0;
            return next;
        });
    }, [total]);

    const shuffle = useCallback(() => {
        if (entries.length <= 1) return;
        setOrder([...order].sort(() => Math.random() - 0.5));
        setPos(0);
        setDirection(1);
    }, [order, entries.length]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [go]);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (autoplay) timerRef.current = setTimeout(() => go(1), autoDelay * 1000);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [autoplay, autoDelay, pos, go]);

    if (!current) return null;

    return (
        <div className="flex flex-col items-center gap-4 h-screen pt-4 px-4">

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap justify-center flex-shrink-0">
                <button
                    onClick={() => setShowAuthor(!showAuthor)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
                    style={{ backgroundColor: showAuthor ? `${t.accentText}15` : "white", color: "#4A3B32", border: `1px solid ${t.accentText}40`, fontFamily: "Georgia, serif" }}
                >
                    {showAuthor ? <Eye size={13} /> : <EyeOff size={13} />}
                    {showAuthor ? "แสดงชื่อ" : "ซ่อนชื่อ"}
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAutoplay(!autoplay)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
                        style={{ backgroundColor: autoplay ? t.accentText : "white", color: autoplay ? "white" : "#4A3B32", border: `1px solid ${t.accentText}40`, fontFamily: "Georgia, serif" }}
                    >
                        {autoplay ? <Pause size={13} /> : <Play size={13} />}
                        Auto {autoDelay}s
                    </button>
                    {autoplay && (
                        <input type="range" min={3} max={30} value={autoDelay}
                            onChange={(e) => setAutoDelay(Number(e.target.value))}
                            className="w-20" style={{ accentColor: t.accentText }}
                        />
                    )}
                </div>

                <button
                    onClick={shuffle}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
                    style={{ backgroundColor: "white", color: "#4A3B32", border: `1px solid ${t.accentText}40`, fontFamily: "Georgia, serif" }}
                >
                    <Shuffle size={13} />
                    สุ่มใหม่
                </button>
            </div>

            {/* กระดาษ */}
            <div className="flex-1 flex items-center justify-center">
                <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                        key={order[pos]}
                        custom={direction}
                        variants={pageVariants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ type: "spring", stiffness: 280, damping: 28 }}
                        style={{ border: `1px solid ${t.accent}60` }}
                    >
                        <EntryFull entry={current} showAuthor={showAuthor} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3 py-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => go(-1)}
                        className="w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
                        style={{ backgroundColor: "white", color: "#4A3B32", border: `1px solid ${t.accentText}40` }}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="text-center" style={{ fontFamily: "Georgia, serif", color: "#4A3B32" }}>
                        <div>
                            <span className="text-2xl font-light">{pos + 1}</span>
                            <span className="text-sm opacity-40 mx-1">/</span>
                            <span className="text-sm opacity-40">{total}</span>
                        </div>
                        <div className="flex gap-1 mt-1.5 justify-center">
                            {Array.from({ length: Math.min(total, 12) }).map((_, i) => (
                                <button key={i}
                                    onClick={() => { setDirection(i > pos ? 1 : -1); setPos(i); }}
                                    className="transition-all rounded-full"
                                    style={{ width: i === pos ? "16px" : "6px", height: "6px", backgroundColor: i === pos ? t.accentText : `${t.accentText}40` }}
                                />
                            ))}
                            {total > 12 && <span className="text-xs opacity-30" style={{ color: "#4A3B32" }}>…</span>}
                        </div>
                    </div>

                    <button onClick={() => go(1)}
                        className="w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
                        style={{ backgroundColor: "white", color: "#4A3B32", border: `1px solid ${t.accentText}40` }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
                <p className="text-xs opacity-25" style={{ fontFamily: "Georgia, serif", color: "#4A3B32" }}>
                    กด ← → เพื่อเปลี่ยนหน้า
                </p>
            </div>
        </div>
    );
}