// app/canvas/page.tsx
"use client";

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
    type RefObject,
} from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/GardenNavbar";
import { useAuth } from "@/hooks/useAuth";
import {
    PixelCanvas,
    type PixelCanvasRef,
    type Tool,
} from "@/components/canvas/PixelCanvas";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar/CanvasToolbar";
import { StampCard } from "@/components/ui/StampCard";
import {
    subscribeToCanvas,
    broadcastStroke,
    trackPresence,
    saveSnapshot,
    loadSnapshot,
    downloadCanvas,
    type StrokeMessage,
    type PresenceUser,
} from "@/lib/canvasSync";
import {
    type Pixel,
    type PixelColor,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    drawPixel,
    floodFill,
} from "@/lib/pixelEngine";

type SaveStatus = "idle" | "pending" | "saving" | "saved";

const SAVE_DEBOUNCE_MS = 5000;

export default function CanvasPage() {
    const { isLoggedIn, user: uiUser, rawUser, loginWithTwitch, logout } =
        useAuth();

    const [tool, setTool] = useState<Tool>("pencil");
    const [color, setColor] = useState<PixelColor>("#4b3a2e");
    const [brushSize, setBrushSize] = useState<number>(1);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

    // undefined = กำลังหา URL อยู่, null = ไม่มี snapshot, string = มี URL พร้อมใช้
    // isLoading จะเป็น true ตราบใดที่ snapshotUrl ยังเป็น undefined
    // หรือ PixelCanvas ยังโหลดรูปไม่เสร็จ
    const [snapshotUrl, setSnapshotUrl] = useState<string | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
    const [drawingMap, setDrawingMap] = useState<Record<string, number>>({});
    const [recentColors, setRecentColors] = useState<PixelColor[]>([]);

    const canvasRef = useRef<PixelCanvasRef | null>(null);
    const channelRef = useRef<ReturnType<typeof subscribeToCanvas> | null>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const userId = rawUser?.id ?? "";
    const userName =
        uiUser?.name ??
        rawUser?.user_metadata?.name ??
        rawUser?.user_metadata?.preferred_username ??
        "Guest";
    const userAvatar = uiUser?.avatar ?? "";

    // ───────────────────────────────────────────────────────────────
    // Fetch snapshot URL on mount — แค่ดึง URL, ไม่ต้องยุ่งกับ canvasRef
    // การโหลดรูปจริงเกิดใน PixelCanvas ผ่าน initialSnapshotUrl prop
    // ───────────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function fetchSnapshotUrl() {
            try {
                const url = await loadSnapshot();
                if (!cancelled) {
                    setSnapshotUrl(url); // null หรือ string
                }
            } catch (err) {
                console.error("[snapshot] fetchSnapshotUrl failed", err);
                if (!cancelled) {
                    setSnapshotUrl(null); // พัง → treat เหมือนไม่มี snapshot
                }
            }
        }

        void fetchSnapshotUrl();

        return () => {
            cancelled = true;
        };
    }, []);

    // ───────────────────────────────────────────────────────────────
    // Subscribe to realtime canvas when logged in
    // ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoggedIn || !userId) return;

        const channel = subscribeToCanvas(
            (msg: StrokeMessage) => {
                if (msg.userId === userId) return;

                const off = canvasRef.current?.getCanvas();
                if (!off) return;

                const ctx = off.getContext("2d");
                if (!ctx) return;

                msg.pixels.forEach((p) => {
                    if (typeof p.color === "string" && p.color.startsWith("FILL:")) {
                        const fillColor = p.color.replace("FILL:", "");
                        floodFill(ctx, p.x, p.y, fillColor, p.size);
                    } else {
                        drawPixel(ctx, p);
                    }
                });

                canvasRef.current?.applyRemotePixels(msg.pixels);

                setDrawingMap((prev) => ({
                    ...prev,
                    [msg.userName]: Date.now(),
                }));
            },
            (users: PresenceUser[]) => {
                setOnlineUsers(users);
            }
        );

        channelRef.current = channel;
        void trackPresence(channel, userId, userName, userAvatar);

        return () => {
            channel.unsubscribe();
            channelRef.current = null;
        };
    }, [isLoggedIn, userId, userName]);

    // is drawing -- 2 sec timeout
    useEffect(() => {
        const id = window.setInterval(() => {
            const now = Date.now();
            setDrawingMap((prev) => {
                const next: Record<string, number> = {};
                for (const [name, ts] of Object.entries(prev)) {
                    if (now - ts < 2000) {
                        next[name] = ts;
                    }
                }
                return next;
            });
        }, 1000);

        return () => window.clearInterval(id);
    }, []);

    const drawingUsers = useMemo(
        () =>
            onlineUsers
                .filter((u) => drawingMap[u.name] != null)
                .map((u) => u.name),
        [onlineUsers, drawingMap]
    );

    // ───────────────────────────────────────────────────────────────
    // Handle local stroke → broadcast + debounce save
    // ───────────────────────────────────────────────────────────────
    const handleStroke = useCallback(
        async (pixels: Pixel[]) => {
            const strokeColor = pixels[0]?.color;
            if (strokeColor && !strokeColor.startsWith('FILL:') && strokeColor !== '#FFFFFF') {
                setRecentColors(prev => {
                    const filtered = prev.filter(x => x !== strokeColor);
                    return [strokeColor as PixelColor, ...filtered].slice(0, 8);
                });
            }

            if (!channelRef.current || !userId) {
                setSaveStatus("pending");
                return;
            }

            setSaveStatus((prev) => (prev === "saving" ? prev : "pending"));

            await broadcastStroke(channelRef.current, {
                userId,
                userName,
                pixels,
            });

            setDrawingMap((prev) => ({
                ...prev,
                [userName]: Date.now(),
            }));

            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

            saveTimerRef.current = setTimeout(async () => {
                const off = canvasRef.current?.getCanvas();
                if (!off) return;

                setSaveStatus("saving");
                try {
                    await saveSnapshot(off);
                    setSaveStatus("saved");
                    setTimeout(() => {
                        setSaveStatus("idle");
                    }, 2000);
                } catch (err) {
                    console.error("[snapshot] save failed", err);
                    setSaveStatus("idle");
                }
            }, SAVE_DEBOUNCE_MS);
        },
        [userId, userName]
    );

    const handleDownload = () => {
        const off = canvasRef.current?.getCanvas();
        if (off) downloadCanvas(off);
    };

    // ───────────────────────────────────────────────────────────────
    // UI
    // ───────────────────────────────────────────────────────────────

    return (
        <main
            className="h-screen flex flex-col overflow-hidden"
            style={{ backgroundColor: "#FDFBF4", fontFamily: "'Noto Sans', sans-serif" }}
        >
            {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                    key={i}
                    style={{
                        position: "fixed",
                        left: `${(i * 23 + 5) % 100}%`,
                        top: 0,
                        width: 8,
                        height: 8,
                        pointerEvents: "none",
                        zIndex: 1,
                    }}
                    animate={{ y: ["0vh", "110vh"], rotate: [0, 360] }}
                    transition={{
                        duration: 12 + i * 2,
                        delay: i * 2.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                >
                    <svg viewBox="0 0 20 20" width={8} height={8} opacity={0.25}>
                        <path
                            d="M10,0 C15,5 15,15 10,20 C5,15 5,5 10,0Z"
                            fill="#FFB7C5"
                        />
                    </svg>
                </motion.div>
            ))}

            <Navbar
                isLoggedIn={isLoggedIn}
                user={uiUser}
                onLogin={loginWithTwitch}
                onLogout={logout}
            />

            <div className="flex flex-1 overflow-hidden pt-14">
                {!isLoggedIn ? (
                    <div className="flex-1 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <StampCard
                                bgColor="#E6D7BD"
                                teethRadius={9}
                                teethDensity={0.85}
                                borderColor="rgba(180,140,120,0.3)"
                            >
                                <div className="px-10 py-8 flex flex-col items-center gap-4 text-center">
                                    <p className="text-4xl">🖌️</p>
                                    <h2
                                        className="text-lg font-bold"
                                        style={{
                                            fontFamily: "'Noto Serif', serif",
                                            color: "#6B4C43",
                                        }}
                                    >
                                        The Picnic Canvas
                                    </h2>
                                    <p
                                        className="text-sm opacity-60 max-w-xs"
                                        style={{ color: "#8B5E52" }}
                                    >
                                        Login with Twitch to join the collaborative pixel art
                                        canvas!
                                    </p>
                                    <motion.button
                                        onClick={loginWithTwitch}
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold mt-2"
                                        style={{ backgroundColor: "#9146FF", color: "#fff" }}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="w-4 h-4"
                                            fill="white"
                                        >
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
                        <div
                            className="w-[260px] min-w-[260px] flex-shrink-0 py-3 px-3"
                            style={{
                                backgroundColor: "rgba(253,251,244,0.9)",
                                borderRight: "1px solid rgba(180,140,120,0.12)",
                                zIndex: 10,
                                position: "relative",
                                overflowY: "visible",
                            }}
                        >
                            <CanvasToolbar
                                tool={tool}
                                color={color}
                                brushSize={brushSize}
                                onToolChange={setTool}
                                onColorChange={setColor}
                                onBrushChange={setBrushSize}
                                onDownload={handleDownload}
                                onlineUsers={onlineUsers}
                                drawingUsers={drawingUsers}
                                canDownload={true}
                                recentColors={recentColors}
                            />
                        </div>

                        <div className="flex-1 relative overflow-hidden">
                            <div
                                className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-1.5 rounded-full"
                                style={{
                                    backgroundColor: "rgba(253,251,244,0.85)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(180,140,120,0.15)",
                                }}
                            >
                                <span
                                    className="text-xs font-bold"
                                    style={{
                                        fontFamily: "'Noto Serif', serif",
                                        color: "#8B5E52",
                                    }}
                                >
                                    🖌️ Picnic Canvas
                                </span>
                                <span
                                    className="text-[10px] opacity-50"
                                    style={{ color: "#8B5E52" }}
                                >
                                    {CANVAS_WIDTH}×{CANVAS_HEIGHT}
                                </span>

                                {saveStatus === "pending" && (
                                    <span className="text-[10px]" style={{ color: "#8B5E52" }}>
                                        changes pending…
                                    </span>
                                )}
                                {saveStatus === "saving" && (
                                    <span className="text-[10px]" style={{ color: "#8B5E52" }}>
                                        saving…
                                    </span>
                                )}
                                {saveStatus === "saved" && (
                                    <span className="text-[10px]" style={{ color: "#66BB6A" }}>
                                        ✓ saved
                                    </span>
                                )}
                            </div>

                            <div
                                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[10px] px-3 py-1 rounded-full pointer-events-none"
                                style={{
                                    backgroundColor: "rgba(44,24,16,0.5)",
                                    color: "rgba(244,201,212,0.8)",
                                    backdropFilter: "blur(8px)",
                                    fontFamily: "'Noto Sans', sans-serif",
                                }}
                            >
                                Scroll to zoom · Alt+drag to pan
                            </div>

                            {isLoading && (
                                <div
                                    className="absolute inset-0 z-20 flex items-center justify-center"
                                    style={{
                                        backgroundColor: "rgba(253,251,244,0.8)",
                                        backdropFilter: "blur(4px)",
                                    }}
                                >
                                    <p
                                        className="text-sm animate-pulse"
                                        style={{
                                            fontFamily: "'Noto Serif', serif",
                                            color: "#8B5E52",
                                        }}
                                    >
                                        Loading canvas... 🌸
                                    </p>
                                </div>
                            )}

                            {/*
                             * ✅ KEY CHANGE:
                             * - snapshotUrl เป็น undefined ตอนยังไม่รู้ว่ามี snapshot ไหม
                             *   → ยังไม่ render PixelCanvas เลย (กันไม่ให้ mount ด้วย URL ว่าง)
                             * - พอ snapshotUrl เป็น null หรือ string → render พร้อมส่ง URL ไปให้
                             * - PixelCanvas จะโหลดรูปเองใน useEffect แล้วเรียก onSnapshotLoaded
                             *   ซึ่งจะ setIsLoading(false)
                             */}
                            {snapshotUrl !== undefined && (
                                <PixelCanvas
                                    ref={canvasRef as RefObject<PixelCanvasRef>}
                                    tool={tool}
                                    color={color}
                                    brushSize={brushSize}
                                    onColorPick={setColor}
                                    onStroke={handleStroke}
                                    userId={userId}
                                    initialSnapshotUrl={snapshotUrl}
                                    onSnapshotLoaded={() => setIsLoading(false)}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}