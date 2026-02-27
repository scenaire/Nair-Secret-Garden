// components/wishing-well/WishPanel.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, CheckCircle2, Loader2, Paperclip, Star, Coins, Clock } from "lucide-react";
import {
    fetchContributions, submitContribution, formatBaht,
    type WishItem, type WishContribution,
} from "@/lib/wishingWellSync";
import { useAuth } from "@/hooks/useAuth";

interface WishPanelProps {
    item: WishItem;
    onClose: () => void;
    onContributed?: () => void;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

// presets filtered to not exceed remaining/target
function getPresets(max: number): number[] {
    return [50, 100, 200, 500].filter(p => p < max);
}

export function WishPanel({ item, onClose, onContributed }: WishPanelProps) {
    const { isLoggedIn, rawUser, user } = useAuth();
    const [contributions, setContributions] = useState<WishContribution[]>([]);
    const [amount, setAmount] = useState(100);
    const [customAmount, setCustomAmount] = useState("");
    const [slipFile, setSlipFile] = useState<File | null>(null);
    const [status, setStatus] = useState<FormStatus>("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const slipRef = useRef<HTMLInputElement>(null);

    const pct = Math.min((item.approved_total / item.target_amount) * 100, 100);
    const pendingPct = Math.min(
        ((item.approved_total + item.pending_total) / item.target_amount) * 100, 100
    ) - pct;
    const remaining = Math.max(item.target_amount - item.approved_total, 0);

    // close on Escape
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [onClose]);

    // fetch contributions
    useEffect(() => {
        fetchContributions(item.id).then(setContributions).catch(console.error);
    }, [item.id]);

    const effectiveAmount = customAmount ? parseFloat(customAmount) : amount;

    const handleSubmit = useCallback(async () => {
        if (!isLoggedIn || !rawUser) return;
        if (!slipFile) { setErrorMsg("Please attach your transfer slip."); return; }
        if (!effectiveAmount || effectiveAmount <= 0) { setErrorMsg("Please enter a valid amount."); return; }

        setStatus("submitting");
        setErrorMsg("");
        try {
            await submitContribution({
                wishItemId: item.id,
                amount: effectiveAmount,
                slipFile,
                userId: rawUser.id,
                twitchName: user?.name ?? "anonymous",
                avatarUrl: user?.avatar,
            });
            setStatus("success");
            onContributed?.();
        } catch (err) {
            console.error(err);
            setErrorMsg("Submission failed. Please try again.");
            setStatus("error");
        }
    }, [isLoggedIn, rawUser, user, slipFile, effectiveAmount, item.id, onContributed]);

    return (
        <AnimatePresence>
            <motion.div
                key="panel-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 flex items-center justify-center"
                style={{ zIndex: 400, background: "rgba(0,0,0,0.68)", backdropFilter: "blur(3px)", padding: 16 }}
                onClick={onClose}
            >
                <motion.div
                    key="panel-card"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="relative flex flex-col"
                    style={{
                        background: "white", borderRadius: 14, overflow: "hidden",
                        maxWidth: 840, width: "100%", maxHeight: "92vh",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(143,175,138,0.2)", zIndex: 10 }}
                    >
                        <X size={12} style={{ color: "#6B4C35" }} />
                    </button>

                    {/* top section: image + info */}
                    <div className="flex flex-1 overflow-hidden" style={{ flexDirection: "row" }}>

                        {/* image */}
                        <div className="flex-shrink-0 md:w-[42%] w-full" style={{ maxHeight: 220 }}>
                            {item.image_url ? (
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover block"
                                    style={{ minHeight: "100%" }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ background: "#E8EFE7", minHeight: 200 }}>
                                    <span style={{ fontSize: 48, opacity: 0.2 }}>🎁</span>
                                </div>
                            )}
                        </div>

                        {/* info col */}
                        <div className="flex flex-col gap-3 flex-1 overflow-y-auto" style={{ padding: "22px 22px 0" }}>
                            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.55 }}>
                                {item.category} · {item.mode === "crowdfund" ? "Crowdfunding" : "Gift directly"}
                            </p>
                            <h2 style={{ fontFamily: "var(--font-noto-sans-thai), sans-serif", fontWeight: 600, fontSize: 20, color: "#6B4C35", lineHeight: 1.3 }}>
                                {item.title}
                            </h2>
                            {item.description && (
                                <p style={{ fontSize: 13, color: "#C9A98D", lineHeight: 1.65 }}>{item.description}</p>
                            )}
                            {item.product_link && (
                                <a
                                    href={item.product_link} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 hover:underline"
                                    style={{ fontSize: 11, color: "#4A6B45", textDecoration: "none" }}
                                >
                                    <ExternalLink size={11} /> View product
                                </a>
                            )}

                            {/* progress */}
                            {item.mode === "crowdfund" && (
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-end justify-between">
                                        <span style={{ fontWeight: 700, fontSize: 24, color: "#4A6B45" }}>{formatBaht(item.approved_total)}</span>
                                        <span style={{ fontSize: 13, color: "#C9A98D", paddingBottom: 2 }}>of {formatBaht(item.target_amount)}</span>
                                    </div>
                                    <div style={{ height: 10, background: "rgba(143,175,138,0.13)", borderRadius: 100, overflow: "hidden", position: "relative" }}>
                                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #4A6B45, #8FAF8A)", borderRadius: 100 }} />
                                        {pendingPct > 0 && (
                                            <div style={{ position: "absolute", top: 0, height: "100%", left: `${pct}%`, width: `${Math.max(pendingPct, 1)}%`, borderRadius: "0 100px 100px 0", background: "repeating-linear-gradient(45deg, rgba(143,175,138,0.45) 0px, rgba(143,175,138,0.45) 3px, rgba(200,222,197,0.25) 3px, rgba(200,222,197,0.25) 7px)" }} />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span style={{ fontSize: 12, color: "#C9A98D" }}>
                                            {Math.round(pct)}% funded · {formatBaht(remaining)} remaining
                                        </span>
                                        {item.pending_total > 0 && (
                                            <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#4A6B45", opacity: 0.75 }}>
                                                <Clock size={10} /> {formatBaht(item.pending_total)} pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {item.mode === "buynow" && (
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: 26, color: "#6B4C35" }}>{formatBaht(item.target_amount)}</span>
                                </div>
                            )}

                            {/* contributors list */}
                            {contributions.length > 0 && (
                                <div className="flex flex-col gap-2 pb-4">
                                    <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.5 }}>
                                        All supporters
                                    </p>
                                    <div className="flex flex-col gap-2" style={{ maxHeight: 140, overflowY: "auto" }}>
                                        {contributions.map((c) => (
                                            <div key={c.id} className="flex items-center gap-2.5">
                                                {c.avatar_url ? (
                                                    <img src={c.avatar_url} alt={c.twitch_name} className="rounded-full object-cover flex-shrink-0" style={{ width: 28, height: 28 }} />
                                                ) : (
                                                    <div className="rounded-full flex-shrink-0 flex items-center justify-center" style={{ width: 28, height: 28, background: "#E8EFE7", fontSize: 11, color: "#4A6B45" }}>
                                                        {c.twitch_name[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div style={{ fontSize: 13, color: "#6B4C35", fontWeight: 500 }}>{c.twitch_name}</div>
                                                    <div style={{ fontSize: 12, color: "#4A6B45" }}>{formatBaht(c.amount)}</div>
                                                </div>
                                                <span style={{ fontSize: 10, color: "#C9A98D", opacity: 0.7 }}>
                                                    {c.approved_at ? new Date(c.approved_at).toLocaleDateString("th-TH", { day: "numeric", month: "short" }) : ""}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── ACTION BAR ── */}
                    <div className="flex-shrink-0" style={{ borderTop: "1px solid rgba(143,175,138,0.12)", background: "white" }}>
                        {!isLoggedIn ? (
                            <p style={{ fontSize: 13, color: "#C9A98D", textAlign: "center", fontFamily: "var(--font-cormorant), serif", fontStyle: "italic", padding: "16px 20px" }}>
                                Login with Twitch to contribute 🌿
                            </p>
                        ) : status === "success" ? (
                            <div className="flex items-center justify-center gap-2 py-4" style={{ color: "#4A6B45" }}>
                                <CheckCircle2 size={16} />
                                <span style={{ fontSize: 14 }}>สลิปส่งแล้ว — รอการตรวจสอบค่ะ ✦</span>
                            </div>
                        ) : (
                            <div>
                                {/* ── STEP 1: เลือกจำนวน (crowdfund only) ── */}
                                {item.mode === "crowdfund" && (
                                    <div style={{ padding: "14px 20px 0" }}>
                                        <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.55, marginBottom: 8 }}>
                                            ① เลือกจำนวนที่ต้องการสมทบ
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            {/* preset buttons — filtered to not exceed remaining */}
                                            {getPresets(remaining).map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => { setAmount(p); setCustomAmount(""); }}
                                                    style={{
                                                        padding: "6px 14px", borderRadius: 100, cursor: "pointer",
                                                        border: `1px solid ${amount === p && !customAmount ? "transparent" : "rgba(143,175,138,0.3)"}`,
                                                        background: amount === p && !customAmount ? "#4A6B45" : "transparent",
                                                        color: amount === p && !customAmount ? "white" : "#6B4C35",
                                                        fontSize: 13, transition: "all 0.18s",
                                                    }}
                                                >
                                                    ฿{p}
                                                </button>
                                            ))}
                                            {/* remaining button */}
                                            <button
                                                onClick={() => { setAmount(remaining); setCustomAmount(String(remaining)); }}
                                                style={{
                                                    padding: "6px 14px", borderRadius: 100, cursor: "pointer",
                                                    border: `1px solid ${customAmount === String(remaining) ? "transparent" : "rgba(143,175,138,0.3)"}`,
                                                    background: customAmount === String(remaining) ? "#4A6B45" : "rgba(143,175,138,0.08)",
                                                    color: customAmount === String(remaining) ? "white" : "#4A6B45",
                                                    fontSize: 13, transition: "all 0.18s", fontWeight: 500,
                                                }}
                                            >
                                                ฿{remaining} ทั้งหมด
                                            </button>
                                            {/* custom input */}
                                            <input
                                                type="number"
                                                value={customAmount}
                                                onChange={(e) => setCustomAmount(e.target.value)}
                                                placeholder="กำหนดเอง…"
                                                style={{
                                                    width: 110, padding: "5px 10px",
                                                    border: "1px solid rgba(143,175,138,0.25)", borderRadius: 100,
                                                    background: "rgba(255,255,255,0.8)", fontSize: 13, color: "#6B4C35",
                                                    outline: "none", textAlign: "center",
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 2: QR + slip ── */}
                                <div className="flex gap-3 items-start flex-wrap" style={{ padding: "12px 20px 16px" }}>

                                    {/* QR code */}
                                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                        <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.55, marginBottom: 4 }}>
                                            {item.mode === "crowdfund" ? "② โอนตาม QR" : "① โอนตาม QR"}
                                        </p>
                                        <div style={{ background: "white", padding: 6, border: "1px solid rgba(143,175,138,0.25)", borderRadius: 8 }}>
                                            <img
                                                src="/images/qr_code.png"
                                                alt="QR Code โอนเงิน"
                                                style={{ width: 88, height: 88, display: "block", imageRendering: "pixelated" }}
                                            />
                                        </div>
                                        {item.mode === "crowdfund" && effectiveAmount > 0 && (
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "#4A6B45", marginTop: 2 }}>
                                                {formatBaht(effectiveAmount)}
                                            </span>
                                        )}
                                        {item.mode === "buynow" && (
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "#4A6B45", marginTop: 2 }}>
                                                {formatBaht(item.target_amount)}
                                            </span>
                                        )}
                                    </div>

                                    {/* slip + submit */}
                                    <div className="flex flex-col gap-2 flex-1" style={{ minWidth: 180 }}>
                                        <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.55 }}>
                                            {item.mode === "crowdfund" ? "③ แนบสลิปยืนยัน" : "② แนบสลิปยืนยัน"}
                                        </p>
                                        <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            style={{
                                                padding: "9px 12px",
                                                border: `1.5px dashed ${slipFile ? "rgba(143,175,138,0.6)" : "rgba(143,175,138,0.35)"}`,
                                                borderRadius: 8,
                                                background: slipFile ? "rgba(143,175,138,0.08)" : "rgba(200,222,197,0.05)",
                                            }}
                                            onClick={() => slipRef.current?.click()}
                                        >
                                            <Paperclip size={13} style={{ color: "#8FAF8A", flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, color: "#C9A98D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                                                {slipFile ? slipFile.name : "แนบสลิปที่นี่"}
                                            </span>
                                            <span style={{ fontSize: 10, color: "#C9A98D", opacity: 0.5, flexShrink: 0 }}>PNG · JPG</span>
                                            <input
                                                ref={slipRef} type="file" accept="image/*" className="hidden"
                                                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setSlipFile(f); setErrorMsg(""); } }}
                                            />
                                        </div>

                                        {errorMsg && (
                                            <p className="flex items-center gap-1" style={{ fontSize: 11, color: "#E87A9A" }}>
                                                <X size={10} /> {errorMsg}
                                            </p>
                                        )}

                                        {/* submit buttons */}
                                        {item.mode === "crowdfund" ? (
                                            <div className="flex flex-col gap-1.5">
                                                {/* drop a coin — partial amount */}
                                                <motion.button
                                                    onClick={handleSubmit}
                                                    disabled={status === "submitting" || !slipFile || effectiveAmount <= 0}
                                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                    className="flex items-center justify-center gap-1.5 w-full"
                                                    style={{
                                                        padding: "9px 16px", borderRadius: 8, cursor: "pointer",
                                                        border: "1.5px solid rgba(143,175,138,0.4)",
                                                        background: "transparent", color: "#4A6B45", fontSize: 13,
                                                        opacity: (!slipFile || effectiveAmount <= 0) ? 0.45 : 1,
                                                    }}
                                                >
                                                    {status === "submitting"
                                                        ? <><Loader2 size={12} className="animate-spin" /> กำลังส่ง…</>
                                                        : <><Coins size={13} /> หย่อนเหรียญ {effectiveAmount > 0 ? formatBaht(effectiveAmount) : ""}</>
                                                    }
                                                </motion.button>
                                                {/* make it real — full remaining */}
                                                <motion.button
                                                    onClick={() => { setCustomAmount(String(remaining)); handleSubmit(); }}
                                                    disabled={status === "submitting" || !slipFile}
                                                    whileHover={{ scale: 1.02, boxShadow: "0 4px 14px rgba(74,107,69,0.28)" }}
                                                    whileTap={{ scale: 0.97 }}
                                                    className="flex items-center justify-center gap-1.5 w-full"
                                                    style={{
                                                        padding: "9px 16px", borderRadius: 8, border: "none",
                                                        background: "linear-gradient(135deg, #4A6B45, #8FAF8A)",
                                                        color: "white", fontSize: 13, cursor: "pointer", fontWeight: 500,
                                                        opacity: !slipFile ? 0.45 : 1,
                                                    }}
                                                >
                                                    <Star size={13} /> ให้ครบเลย! — {formatBaht(remaining)}
                                                </motion.button>
                                            </div>
                                        ) : (
                                            /* buy now — single button */
                                            <motion.button
                                                onClick={handleSubmit}
                                                disabled={status === "submitting" || !slipFile}
                                                whileHover={{ scale: 1.02, boxShadow: "0 4px 14px rgba(74,107,69,0.28)" }}
                                                whileTap={{ scale: 0.97 }}
                                                className="flex items-center justify-center gap-1.5 w-full"
                                                style={{
                                                    padding: "10px 16px", borderRadius: 8, border: "none",
                                                    background: "linear-gradient(135deg, #4A6B45, #8FAF8A)",
                                                    color: "white", fontSize: 13, cursor: "pointer", fontWeight: 500,
                                                    opacity: !slipFile ? 0.45 : 1,
                                                }}
                                            >
                                                {status === "submitting"
                                                    ? <><Loader2 size={13} className="animate-spin" /> กำลังส่ง…</>
                                                    : <><Star size={13} /> ให้ของชิ้นนี้เลย! — {formatBaht(item.target_amount)}</>
                                                }
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}