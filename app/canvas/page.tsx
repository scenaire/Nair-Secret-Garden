// app/canvas/page.tsx
"use client";

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
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
    const [isLoading, setIsLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
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

    // ───────────────────────────────────────────────────────────────
    // Load snapshot on mount (robust version)
    // ───────────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function initSnapshot() {
            try {
                // เผื่อมีกรณีที่ isLoading ไม่ได้ถูก set เป็น true มาก่อน
                setIsLoading(true);

                const url = await loadSnapshot();

                if (cancelled) return;

                // ยังไม่เคยมี snapshot -> ถือว่าโหลดเสร็จแต่มันคือกระดาษเปล่า
                if (!url) {
                    return; // ไปจบที่ finally -> isLoading = false
                }

                const applyToCanvas = () => {
                    if (cancelled) return;
                    const inst = canvasRef.current;
                    if (!inst) return;
                    // ใช้ method ใน PixelCanvas ให้จัดการวาด snapshot เอง
                    inst.loadSnapshotFromUrl(url);
                };

                // ถ้ายังไม่มี instance ให้รอให้ PixelCanvas mount ก่อนค่อย apply
                if (!canvasRef.current) {
                    requestAnimationFrame(applyToCanvas);
                } else {
                    applyToCanvas();
                }
            } catch (err) {
                // กันทุกกรณี error ไม่ให้ค้าง loading
                console.error("[snapshot] init failed", err);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void initSnapshot();

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
            // on remote stroke
            (msg: StrokeMessage) => {
                // ข้ามของตัวเอง (เผื่อ config self:false พลาด)
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

                // sync internal pixel state ถ้า PixelCanvas ใช้งาน
                canvasRef.current?.applyRemotePixels(msg.pixels);
            },
            // on presence change
            (users) => {
                setOnlineUsers(users);
            }
        );

        channelRef.current = channel;
        void trackPresence(channel, userName);

        return () => {
            channel.unsubscribe();
            channelRef.current = null;
        };
    }, [isLoggedIn, userId, userName]);

    // ───────────────────────────────────────────────────────────────
    // Handle local stroke → broadcast + debounce save
    // ───────────────────────────────────────────────────────────────
    const handleStroke = useCallback(
        async (pixels: Pixel[]) => {
            // ✨ track recent colors ก่อนเช็ค channel
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

            // มีการแก้ไขใหม่ → แสดงว่า "กำลังจะมีการเซฟในอีกสักพัก"
            setSaveStatus((prev) => (prev === "saving" ? prev : "pending"));

            await broadcastStroke(channelRef.current, {
                userId,
                userName,
                pixels,
            });

            // debounce การเซฟ snapshot 5 วินาที
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

            saveTimerRef.current = setTimeout(async () => {
                const off = canvasRef.current?.getCanvas();
                if (!off) return;

                setSaveStatus("saving");
                try {
                    await saveSnapshot(off);
                    setSaveStatus("saved");
                    // แสดง saved ซักพัก แล้วกลับไป idle
                    setTimeout(() => {
                        setSaveStatus("idle");
                    }, 2000);
                } catch (err) {
                    console.error("[snapshot] save failed", err);
                    // ไม่เพิ่มสถานะ error แยก เพราะเธอบอกแค่ stage ล่าสุดก็พอ
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
            {/* Ambient petals (เบา ๆ) */}
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

            {/* Navbar ด้านบน */}
            <Navbar
                isLoggedIn={isLoggedIn}
                user={uiUser}
                onLogin={loginWithTwitch}
                onLogout={logout}
            />

            {/* Main area ด้านล่าง navbar */}
            <div className="flex flex-1 overflow-hidden pt-14">
                {/* Gate: ต้อง login ก่อน */}
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
                        {/* Toolbar ด้านซ้าย */}
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
                                canDownload={true}
                                recentColors={recentColors}
                            />
                        </div>

                        {/* พื้นที่ Canvas */}
                        <div className="flex-1 relative overflow-hidden">
                            {/* Title bar เหนือ canvas */}
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

                                {/* save status เล็ก ๆ แต่มองเห็นได้ */}
                                {saveStatus === "pending" && (
                                    <span
                                        className="text-[10px]"
                                        style={{ color: "#8B5E52" }}
                                    >
                                        changes pending…
                                    </span>
                                )}
                                {saveStatus === "saving" && (
                                    <span
                                        className="text-[10px]"
                                        style={{ color: "#8B5E52" }}
                                    >
                                        saving…
                                    </span>
                                )}
                                {saveStatus === "saved" && (
                                    <span
                                        className="text-[10px]"
                                        style={{ color: "#66BB6A" }}
                                    >
                                        ✓ saved
                                    </span>
                                )}
                            </div>

                            {/* Hint ด้านล่าง */}
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

                            {/* Loading overlay ระหว่างโหลด snapshot */}
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

                            {/* ตัว PixelCanvas จริง */}
                            <PixelCanvas
                                ref={canvasRef as RefObject<PixelCanvasRef>}
                                tool={tool}
                                color={color}
                                brushSize={brushSize}
                                onColorPick={setColor}
                                onStroke={handleStroke}
                                userId={userId}
                            />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}