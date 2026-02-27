// components/wishing-well/WishCard.tsx
"use client";

import { motion } from "framer-motion";
import type { WishItem } from "@/lib/wishingWellSync";
import { formatBaht } from "@/lib/wishingWellSync";

interface WishCardProps {
    item: WishItem;
    index: number;
    hasPendingSlip: boolean;
    onClick: () => void;
}

export function WishCard({ item, index, hasPendingSlip, onClick }: WishCardProps) {
    const pct = Math.min((item.approved_total / item.target_amount) * 100, 100);
    const pendingPct = Math.min(
        ((item.approved_total + item.pending_total) / item.target_amount) * 100,
        100
    ) - pct;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
            onClick={onClick}
            className="flex flex-col cursor-pointer"
            style={{
                background: "white",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(74,107,69,0.07), 0 0 0 1px rgba(143,175,138,0.12)",
            }}
            whileHover={{
                y: -4,
                boxShadow: "0 12px 32px rgba(74,107,69,0.14), 0 0 0 1px rgba(143,175,138,0.24)",
                transition: { duration: 0.24 },
            }}
        >
            {/* image */}
            <div className="relative">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full object-cover block"
                        style={{ aspectRatio: "4/3" }}
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="w-full flex items-center justify-center"
                        style={{ aspectRatio: "4/3", background: "#E8EFE7" }}
                    >
                        <span style={{ fontSize: 32, opacity: 0.3 }}>🎁</span>
                    </div>
                )}
                {hasPendingSlip && (
                    <div
                        className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full"
                        style={{
                            background: "rgba(253,251,244,0.95)",
                            border: "1px solid rgba(143,175,138,0.35)",
                            fontSize: 9, letterSpacing: "0.14em",
                            textTransform: "uppercase", color: "#4A6B45",
                        }}
                    >
                        <span
                            className="rounded-full animate-pulse"
                            style={{ width: 5, height: 5, background: "#8FAF8A", display: "inline-block" }}
                        />
                        Your slip · pending
                    </div>
                )}
            </div>

            {/* body */}
            <div className="flex flex-col gap-1.5 flex-1" style={{ padding: "14px 16px 16px" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.55 }}>
                    {item.category} · {item.mode === "crowdfund" ? "Crowdfunding" : "Gift directly"}
                </p>
                <h3 style={{ fontFamily: "var(--font-noto-sans-thai), sans-serif", fontWeight: 600, fontSize: 15, color: "#6B4C35", lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                    {item.title}
                </h3>
                <p style={{ fontSize: 12, color: "#C9A98D", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", flex: 1 }}>
                    {item.description}
                </p>

                {/* progress / price */}
                <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    {item.mode === "crowdfund" ? (
                        <>
                            <div className="flex items-baseline justify-between">
                                <span style={{ fontWeight: 600, fontSize: 17, color: "#4A6B45" }}>
                                    {formatBaht(item.approved_total)}
                                    {hasPendingSlip && item.pending_total > 0 && (
                                        <span style={{ fontSize: 12, fontWeight: 400, color: "#C9A98D", marginLeft: 4 }}>
                                            + {formatBaht(item.pending_total)} pending
                                        </span>
                                    )}
                                </span>
                                <span style={{ fontSize: 11, color: "#C9A98D" }}>of {formatBaht(item.target_amount)}</span>
                            </div>

                            {/* stacked progress bar */}
                            <div style={{ height: 8, background: "rgba(143,175,138,0.13)", borderRadius: 100, overflow: "hidden", position: "relative", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.07)" }}>
                                {/* approved fill */}
                                <div style={{
                                    position: "absolute", left: 0, top: 0, height: "100%",
                                    width: `${pct}%`, borderRadius: 100,
                                    background: "linear-gradient(90deg, #4A6B45, #8FAF8A)",
                                }} />
                                {/* pending fill */}
                                {pendingPct > 0 && (
                                    <div style={{
                                        position: "absolute", top: 0, height: "100%",
                                        left: `${pct}%`, width: `${pendingPct}%`,
                                        borderRadius: "0 100px 100px 0",
                                        background: "repeating-linear-gradient(45deg, rgba(143,175,138,0.45) 0px, rgba(143,175,138,0.45) 3px, rgba(200,222,197,0.2) 3px, rgba(200,222,197,0.2) 7px)",
                                    }} />
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span style={{ fontSize: 11, color: "#C9A98D" }}>
                                    {Math.round(pct)}% · {item.supporter_count} supporter{item.supporter_count !== 1 ? "s" : ""}
                                </span>
                                {hasPendingSlip && item.pending_total > 0 && (
                                    <span style={{ fontSize: 10, color: "#4A6B45", opacity: 0.7, display: "flex", alignItems: "center", gap: 3 }}>
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l2 2" /></svg>
                                        +{formatBaht(item.pending_total)} awaiting
                                    </span>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <span style={{ fontWeight: 600, fontSize: 22, color: "#6B4C35" }}>
                                {formatBaht(item.target_amount)}
                            </span>
                            <span style={{ fontSize: 11, color: "#4A6B45", opacity: 0.65 }}>
                                {item.supporter_count > 0
                                    ? `✦ ${item.supporter_count} gifted this`
                                    : "✦ Be the first to gift this!"}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// ── Granted card variant ──────────────────────────────────────
interface GrantedCardProps {
    item: WishItem;
    onClick: () => void;
}

export function GrantedCard({ item, onClick }: GrantedCardProps) {
    return (
        <motion.div
            onClick={onClick}
            className="flex flex-col cursor-pointer"
            style={{
                background: "#E8EFE7",
                borderRadius: 12, overflow: "hidden",
                border: "1px solid rgba(143,175,138,0.3)",
                boxShadow: "0 1px 6px rgba(74,107,69,0.08)",
            }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(74,107,69,0.13)", transition: { duration: 0.22 } }}
        >
            {item.image_url && (
                <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full object-cover block"
                    style={{ aspectRatio: "4/3" }}
                    loading="lazy"
                />
            )}
            <div style={{ padding: "11px 13px 13px", display: "flex", flexDirection: "column", gap: 4 }}>
                <h3 style={{ fontFamily: "var(--font-noto-sans-thai), sans-serif", fontWeight: 600, fontSize: 13, color: "#6B4C35", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                    {item.title}
                </h3>
                <span style={{ fontSize: 11, color: "#4A6B45", opacity: 0.7 }}>
                    {formatBaht(item.approved_total)} · {item.supporter_count} supporters
                </span>
                <div className="flex items-center gap-1 mt-1" style={{
                    alignSelf: "flex-start",
                    background: "rgba(74,107,69,0.12)", border: "1px solid rgba(74,107,69,0.2)",
                    color: "#4A6B45", fontSize: 9, letterSpacing: "0.14em",
                    textTransform: "uppercase", padding: "2px 8px", borderRadius: 100,
                }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Granted
                </div>
            </div>
        </motion.div>
    );
}