// app/canvas/page.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/GardenNavbar";
import { useAuth } from "@/hooks/useAuth";
import { PixelCanvas, type PixelCanvasRef, type Tool } from "@/components/canvas/PixelCanvas";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { StampCard } from "@/components/ui/StampCard";
import { PetalTransition } from "@/components/guestbook/PetalTransition";
import {
    subscribeToCanvas, broadcastStroke, trackPresence,
    saveSnapshot, loadSnapshot, downloadCanvas,
    type StrokeMessage,
} from "@/lib/canvasSync";
import { type Pixel, type PixelColor, CANVAS_WIDTH, CANVAS_HEIGHT, drawPixel, floodFill } from "@/lib/pixelEngine";

// ─── Save status indicator ───────────────────────────────────────────────────
type SaveStatus = "idle" | "saving" | "saved";

export default function CanvasPage() {
    const { isLoggedIn, user, loginWithTwitch, logout } = useAuth(); //

    const [tool, setTool] = useState<Tool>("pencil");
    const [color, setColor] = useState<PixelColor>("#FF8FAB");
    const [brushSize, setBrushSize] = useState<1 | 2 | 4>(1);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const [isLoading, setIsLoading] = useState(true);

    const canvasRef = useRef<PixelCanvasRef>(null);
    const channelRef = useRef<ReturnType<typeof subscribeToCanvas> | null>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Load snapshot on mount ──────────────────────────────────────────────
    useEffect(() => {
        loadSnapshot().then(url => {
            if (!url) { setIsLoading(false); return; }
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const off = canvasRef.current?.getCanvas();
                if (!off) return;
                const ctx = off.getContext("2d")!;
                ctx.drawImage(img, 0, 0);
                setIsLoading(false);
            };
            img.onerror = () => setIsLoading(false);
            img.src = url;
        });
    }, []);

    // ── Subscribe to Realtime when logged in ────────────────────────────────
    useEffect(() => {
        if (!isLoggedIn || !user) return;

        const channel = subscribeToCanvas(
            // on remote stroke
            (msg: StrokeMessage) => {
                if (msg.userId === user.name) return; // skip own echoes
                const off = canvasRef.current?.getCanvas();
                if (!off) return;
                const ctx = off.getContext("2d")!;
                msg.pixels.forEach(p => {
                    if (p.color.startsWith("FILL:")) {
                        floodFill(ctx, p.x, p.y, p.color.replace("FILL:", ""), p.size);
                    } else {
                        drawPixel(ctx, p);
                    }
                });
                canvasRef.current?.applyRemotePixels(msg.pixels);
            },
            // on presence change
            (users) => setOnlineUsers(users)
        );

        channelRef.current = channel;
        trackPresence(channel, user.name);

        return () => { channel.unsubscribe(); };
    }, [isLoggedIn, user]);

    // ── Handle local stroke → broadcast + debounce save ────────────────────
    const handleStroke = useCallback(async (pixels: Pixel[]) => {
        if (!channelRef.current || !user) return;

        await broadcastStroke(channelRef.current, {
            userId: user.name,
            userName: user.name,
            pixels,
        });

        // debounce save snapshot
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
            const off = canvasRef.current?.getCanvas();
            if (!off) return;
            setSaveStatus("saving");
            await saveSnapshot(off);
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        }, 5000);
    }, [user]);

    const handleDownload = () => {
        const off = canvasRef.current?.getCanvas();
        if (off) downloadCanvas(off);
    };

    return (
        <main className="h-screen flex flex-col overflow-hidden"
            style={{ backgroundColor: "#FDFBF4", fontFamily: "'Noto Sans', sans-serif" }}>

            {/* Ambient petals (subtle) */}
            {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i}
                    style={{ position: "fixed", left: `${(i * 23 + 5) % 100}%`, top: 0, width: 8, height: 8, pointerEvents: "none", zIndex: 1 }}
                    animate={{ y: ["0vh", "110vh"], rotate: [0, 360] }}
                    transition={{ duration: 12 + i * 2, delay: i * 2.5, repeat: Infinity, ease: "linear" }}>
                    <svg viewBox="0 0 20 20" width={8} height={8} opacity={0.25}>
                        <path d="M10,0 C15,5 15,15 10,20 C5,15 5,5 10,0Z" fill="#FFB7C5" />
                    </svg>
                </motion.div>
            ))}

            {/* Navbar */}
            <Navbar isLoggedIn={isLoggedIn} user={user} onLogin={loginWithTwitch} onLogout={logout} />

            {/* ── Main area (below navbar) ── */}
            <div className="flex flex-1 overflow-hidden pt-14">

                {/* ── Not logged in gate ── */}
                {!isLoggedIn ? (
                    <div className="flex-1 flex items-center justify-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <StampCard bgColor="#E6D7BD" teethRadius={9} teethDensity={0.85} borderColor="rgba(180,140,120,0.3)">
                                <div className="px-10 py-8 flex flex-col items-center gap-4 text-center">
                                    <p className="text-4xl">🖌️</p>
                                    <h2 className="text-lg font-bold"
                                        style={{ fontFamily: "'Noto Serif', serif", color: "#6B4C43" }}>
                                        The Picnic Canvas
                                    </h2>
                                    <p className="text-sm opacity-60 max-w-xs"
                                        style={{ color: "#8B5E52" }}>
                                        Login with Twitch to join the collaborative pixel art canvas!
                                    </p>
                                    <motion.button onClick={loginWithTwitch}
                                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold mt-2"
                                        style={{ backgroundColor: "#9146FF", color: "#fff" }}>
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                                        </svg>
                                        Login with Twitch
                                    </motion.button>
                                </div>
                            </StampCard>
                        </motion.div>
                    </div>
                ) : (
                    <div className="flex flex-1 overflow-hidden gap-0">

                        {/* ── Toolbar sidebar ── */}
                        <div className="w-[88px] flex-shrink-0 overflow-y-auto overflow-x-hidden py-3 px-1.5"
                            style={{ backgroundColor: "rgba(253,251,244,0.9)", borderRight: "1px solid rgba(180,140,120,0.12)" }}>
                            <CanvasToolbar
                                tool={tool}
                                color={color}
                                brushSize={brushSize}
                                onToolChange={setTool}
                                onColorChange={setColor}
                                onBrushChange={setBrushSize}
                                onDownload={handleDownload}
                                onlineUsers={onlineUsers}
                                canDownload={true}
                            />
                        </div>

                        {/* ── Canvas area ── */}
                        <div className="flex-1 relative overflow-hidden">

                            {/* Title bar */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-1.5 rounded-full"
                                style={{ backgroundColor: "rgba(253,251,244,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(180,140,120,0.15)" }}>
                                <span className="text-xs font-bold" style={{ fontFamily: "'Noto Serif', serif", color: "#8B5E52" }}>
                                    🖌️ Picnic Canvas
                                </span>
                                <span className="text-[10px] opacity-50" style={{ color: "#8B5E52" }}>
                                    {CANVAS_WIDTH}×{CANVAS_HEIGHT}
                                </span>
                                {/* save status */}
                                {saveStatus === "saving" && (
                                    <span className="text-[10px] opacity-60" style={{ color: "#8B5E52" }}>saving...</span>
                                )}
                                {saveStatus === "saved" && (
                                    <span className="text-[10px]" style={{ color: "#66BB6A" }}>✓ saved</span>
                                )}
                            </div>

                            {/* Hint */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[10px] px-3 py-1 rounded-full pointer-events-none"
                                style={{ backgroundColor: "rgba(44,24,16,0.5)", color: "rgba(244,201,212,0.8)", backdropFilter: "blur(8px)", fontFamily: "'Noto Sans', sans-serif" }}>
                                Scroll to zoom · Alt+drag to pan
                            </div>

                            {/* Loading overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(253,251,244,0.8)", backdropFilter: "blur(4px)" }}>
                                    <p className="text-sm animate-pulse" style={{ fontFamily: "'Noto Serif', serif", color: "#8B5E52" }}>
                                        Loading canvas... 🌸
                                    </p>
                                </div>
                            )}

                            <PixelCanvas
                                ref={canvasRef}
                                tool={tool}
                                color={color}
                                brushSize={brushSize}
                                onColorPick={setColor}
                                onStroke={handleStroke}
                                userId={user?.name ?? ""}
                            />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}