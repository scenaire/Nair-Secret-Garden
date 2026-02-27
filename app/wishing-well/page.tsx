// app/wishing-well/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/GardenNavbar";
import { useAuth } from "@/hooks/useAuth";
import { WishCard, GrantedCard } from "@/components/wishing-well/WishCard";
import { WishPanel } from "@/components/wishing-well/WishPanel";
import { SurpriseForm } from "@/components/wishing-well/SurpriseForm";
import { Leaderboard } from "@/components/wishing-well/Leaderboard";
import {
    fetchWishItems, fetchLeaderboard, fetchMyPending,
    type WishItem, type LeaderboardEntry,
} from "@/lib/wishingWellSync";

type FilterMode = "all" | "active";

export default function WishingWellPage() {
    const { isLoggedIn, user: uiUser, rawUser, loginWithTwitch, logout } = useAuth();

    const [items, setItems] = useState<WishItem[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [myPending, setMyPending] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterMode>("all");
    const [panelItem, setPanelItem] = useState<WishItem | null>(null);

    // ── initial load ───────────────────────────────────────────
    useEffect(() => {
        Promise.all([fetchWishItems(), fetchLeaderboard()])
            .then(([wi, lb]) => { setItems(wi); setLeaderboard(lb); })
            .catch(e => {
                console.error("fetch error:", JSON.stringify(e, null, 2));
                console.error("message:", e?.message);
                console.error("code:", e?.code);
                console.error("details:", e?.details);
            })
            .finally(() => setIsLoading(false));
    }, []);

    // ── load user's pending slips once logged in ───────────────
    useEffect(() => {
        if (!rawUser?.id) { setMyPending([]); return; }
        fetchMyPending(rawUser.id).then(setMyPending).catch(console.error);
    }, [rawUser?.id]);

    // ── refresh after contribution ─────────────────────────────
    const handleContributed = useCallback(() => {
        if (!rawUser?.id) return;
        // re-fetch items (totals updated) and pending list
        Promise.all([fetchWishItems(), fetchMyPending(rawUser.id)])
            .then(([wi, pending]) => { setItems(wi); setMyPending(pending); })
            .catch(console.error);
        // update panel item too
        if (panelItem) {
            fetchWishItems().then((wi) => {
                const updated = wi.find((i) => i.id === panelItem.id);
                if (updated) setPanelItem(updated);
            });
        }
    }, [rawUser?.id, panelItem]);

    // ── split items ────────────────────────────────────────────
    const activeItems = items.filter((i) => !i.is_granted);
    const grantedItems = items.filter((i) => i.is_granted);

    const filteredActive = filter === "active"
        ? activeItems.filter((i) => i.approved_total < i.target_amount)
        : activeItems;

    return (
        <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDFBF4" }}>
            <Navbar isLoggedIn={isLoggedIn} user={uiUser} onLogin={loginWithTwitch} onLogout={logout} />

            <div className="relative z-10" style={{ paddingTop: 48 }}>
                <div style={{ margin: "0 16px 16px", borderRadius: "0 0 12px 12px", background: "rgba(253,251,244,0.88)", boxShadow: "0 2px 24px rgba(74,107,69,0.09)", paddingBottom: 80 }}>

                    {/* ── HERO ── */}
                    <div
                        className="flex items-start justify-between gap-6 flex-wrap"
                        style={{ padding: "36px 28px 28px", borderBottom: "1px solid rgba(143,175,138,0.12)" }}
                    >
                        <div className="flex flex-col gap-2">
                            {/* well SVG */}
                            <svg width="88" height="80" viewBox="0 0 100 90" fill="none" style={{ marginBottom: 12 }}>
                                <WellSVGContents />
                            </svg>
                            <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.5 }}>
                                Birthday Wishlist · 2026
                            </p>
                            <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 34, fontWeight: 300, fontStyle: "italic", color: "#6B4C35", lineHeight: 1.2 }}>
                                The Wishing Well
                            </h1>
                            <p style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 15, fontStyle: "italic", color: "#C9A98D", lineHeight: 1.65, maxWidth: 380 }}>
                                Toss a coin — every ripple turns a wish into something real ✨
                            </p>

                            {/* login CTA if not logged in */}
                            {!isLoggedIn && (
                                <motion.button
                                    onClick={loginWithTwitch}
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-2 mt-2 self-start"
                                    style={{
                                        padding: "8px 18px", borderRadius: 100,
                                        background: "#9146FF", color: "white",
                                        border: "none", cursor: "pointer",
                                        fontSize: 12, fontWeight: 600,
                                    }}
                                >
                                    <TwitchIcon />
                                    Login with Twitch to contribute
                                </motion.button>
                            )}
                        </div>

                        {/* Leaderboard */}
                        <Leaderboard entries={leaderboard} />
                    </div>

                    {/* ── FILTER BAR ── */}
                    <div className="flex items-center gap-2.5" style={{ padding: "14px 24px", borderBottom: "1px solid rgba(143,175,138,0.1)" }}>
                        {(["all", "active"] as FilterMode[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                                    padding: "5px 16px", borderRadius: 100, cursor: "pointer",
                                    border: `1px solid ${filter === f ? "transparent" : "rgba(143,175,138,0.28)"}`,
                                    background: filter === f ? "#4A6B45" : "transparent",
                                    color: filter === f ? "white" : "rgba(107,76,53,0.45)",
                                    transition: "all 0.2s",
                                }}
                            >
                                {f === "all" ? "All wishes" : "Still dreaming"}
                            </button>
                        ))}
                    </div>

                    {/* ── GIFT GRID ── */}
                    {isLoading ? (
                        <p className="text-center italic animate-pulse" style={{ color: "#8B5E52", fontFamily: "var(--font-cormorant), serif", fontSize: 15, padding: "60px 24px" }}>
                            Listening to the well… 🌿
                        </p>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18, padding: "22px 24px 0" }}>
                            {filteredActive.map((item, i) => (
                                <WishCard
                                    key={item.id}
                                    item={item}
                                    index={i}
                                    hasPendingSlip={myPending.includes(item.id)}
                                    onClick={() => setPanelItem(item)}
                                />
                            ))}
                        </div>
                    )}

                    {/* ── SEND A SURPRISE ── */}
                    <div style={{ padding: "28px 24px 0" }}>
                        <SurpriseForm />
                    </div>

                    {/* ── GRANTED SECTION ── */}
                    {grantedItems.length > 0 && (
                        <div style={{ padding: "28px 24px 0" }}>
                            <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                                <div style={{ flex: 1, height: 1, background: "rgba(143,175,138,0.18)" }} />
                                <span style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.45, whiteSpace: "nowrap" }}>
                                    Wishes that came true · {grantedItems.length} granted
                                </span>
                                <div style={{ flex: 1, height: 1, background: "rgba(143,175,138,0.18)" }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
                                {grantedItems.map((item) => (
                                    <GrantedCard
                                        key={item.id}
                                        item={item}
                                        onClick={() => setPanelItem(item)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── RECENT SUPPORTERS ── */}
                    {leaderboard.length > 0 && (
                        <div style={{ margin: "22px 24px 0", background: "rgba(143,175,138,0.06)", border: "1px solid rgba(143,175,138,0.14)", borderRadius: 10, padding: "14px 18px" }}>
                            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.45, marginBottom: 10 }}>
                                Recent supporters
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {leaderboard.slice(0, 8).map((e) => (
                                    <div key={e.user_id} className="flex items-center gap-1.5" style={{ background: "white", border: "1px solid rgba(143,175,138,0.18)", borderRadius: 100, padding: "4px 10px 4px 5px" }}>
                                        {e.avatar_url ? (
                                            <img src={e.avatar_url} alt={e.twitch_name} style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#E8EFE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#4A6B45" }}>
                                                {e.twitch_name[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <span style={{ fontSize: 12, color: "#6B4C35" }}>{e.twitch_name}</span>
                                        <span style={{ fontSize: 11, color: "#4A6B45", fontWeight: 600 }}>{formatBaht(e.total_amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* ── DETAIL PANEL ── */}
            {panelItem && (
                <WishPanel
                    item={panelItem}
                    onClose={() => setPanelItem(null)}
                    onContributed={handleContributed}
                />
            )}
        </main>
    );
}

// ── helpers ────────────────────────────────────────────────────

function formatBaht(amount: number) {
    if (amount >= 1000) return `฿${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
    return `฿${amount.toLocaleString()}`;
}

function TwitchIcon() {
    return (
        <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill="white">
            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
        </svg>
    );
}

function WellSVGContents() {
    return (
        <>
            <circle style={{ animation: "coinFloat 2.8s ease-in-out infinite" }} cx="16" cy="16" r="6" fill="#C9A98D" opacity=".7" />
            <circle style={{ animation: "coinFloat 2.8s ease-in-out infinite" }} cx="16" cy="16" r="3.5" fill="#E8C8A0" opacity=".5" />
            <circle style={{ animation: "coinFloat 2.8s ease-in-out infinite .9s" }} cx="82" cy="20" r="5" fill="#C9A98D" opacity=".7" />
            <circle style={{ animation: "coinFloat 2.8s ease-in-out infinite .9s" }} cx="82" cy="20" r="3" fill="#E8C8A0" opacity=".5" />
            <circle style={{ animation: "coinFloat 2.8s ease-in-out infinite 1.7s" }} cx="62" cy="8" r="4" fill="#C9A98D" opacity=".6" />
            <rect x="22" y="24" width="7" height="28" rx="3" fill="#8B7355" />
            <rect x="71" y="24" width="7" height="28" rx="3" fill="#8B7355" />
            <rect x="18" y="22" width="64" height="9" rx="4" fill="#6B5535" />
            <line x1="50" y1="31" x2="50" y2="46" stroke="#8B7355" strokeWidth="2" strokeDasharray="3 2" />
            <rect x="14" y="48" width="72" height="11" rx="5" fill="#C8BAA8" />
            <ellipse cx="50" cy="62" rx="36" ry="10" fill="#B8A898" />
            <rect x="14" y="57" width="72" height="20" rx="4" fill="#B8A898" />
            <ellipse cx="50" cy="60" rx="28" ry="7" fill="#7BA8B8" opacity=".3" />
            <style>{`@keyframes coinFloat{0%,100%{transform:translateY(0) rotate(-4deg);opacity:.8}50%{transform:translateY(-8px) rotate(4deg);opacity:1}}`}</style>
        </>
    );
}