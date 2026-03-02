// components/overlay/WishOverlay.tsx
// Standalone overlay for Wishing Well events — add as a separate OBS Browser Source.
// Position/resize freely in OBS independent from the terrarium overlay.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { OVERLAY_CHANNEL } from "./constants";
import type { WishContributionPayload, WishSurprisePayload } from "./types";

// ── Types ─────────────────────────────────────────────────────────────────────

type WishEvent =
    | (WishContributionPayload & { id: string })
    | (WishSurprisePayload & { id: string });

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBaht(n: number): string {
    if (n >= 1000) return "฿" + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
    return "฿" + n.toLocaleString();
}

function playChime(type: "contribution" | "surprise") {
    try {
        const ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        const notes = type === "contribution"
            ? [698.46, 880.00, 1046.50]   // F5 A5 C6 — warm amber
            : [739.99, 932.33, 1174.66];  // F#5 A#5 D6 — dreamy purple
        notes.forEach((f, i) => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = "sine"; o.frequency.value = f;
            const t = ctx.currentTime + i * 0.13;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.11, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
            o.start(t); o.stop(t + 0.8);
        });
    } catch (_) { }
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CoinIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="7" cy="7" r="6"
                fill="rgba(212,168,80,0.15)" stroke="rgba(212,168,80,0.55)" strokeWidth="1" />
            <text x="7" y="10.5" textAnchor="middle" fontSize="7"
                fill="rgba(212,168,80,0.85)" fontFamily="serif">฿</text>
        </svg>
    );
}

function GiftIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, marginTop: 1 }}>
            <rect x="2" y="6" width="10" height="7" rx="1"
                fill="rgba(180,140,220,0.15)" stroke="rgba(180,140,220,0.55)" strokeWidth="1" />
            <line x1="7" y1="6" x2="7" y2="13" stroke="rgba(180,140,220,0.5)" strokeWidth="0.8" />
            <path d="M4.5,6 Q4.5,3 7,4 Q9.5,3 9.5,6"
                fill="none" stroke="rgba(180,140,220,0.6)" strokeWidth="0.9" />
            <line x1="2" y1="8.5" x2="12" y2="8.5"
                stroke="rgba(180,140,220,0.3)" strokeWidth="0.6" />
        </svg>
    );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ url, username }: { url?: string; username: string }) {
    const [imgErr, setImgErr] = useState(false);
    const initial = (username[0] ?? "?").toUpperCase();
    const base: React.CSSProperties = {
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        border: "1.5px solid rgba(255,255,255,0.12)",
    };
    if (url && !imgErr) {
        return (
            <img src={url} alt={username} crossOrigin="anonymous"
                onError={() => setImgErr(true)}
                style={{ ...base, objectFit: "cover" }} />
        );
    }
    return (
        <div style={{
            ...base, background: "rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <span style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.4)",
            }}>
                {initial}
            </span>
        </div>
    );
}

// ── Progress Bar (contribution only) ─────────────────────────────────────────

function ProgressBar({ contributed, target }: { contributed: number; target: number }) {
    const pct = Math.min(Math.round((contributed / target) * 100), 100);
    // Start from 0 then animate to actual pct — needs a tick delay for transition to fire
    const [displayPct, setDisplayPct] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setDisplayPct(pct), 60);
        return () => clearTimeout(t);
    }, [pct]);
    return (
        <div style={{ marginTop: 2 }}>
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "baseline", marginBottom: 4,
            }}>
                <span style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 9, fontWeight: 300,
                    letterSpacing: "1.5px", textTransform: "uppercase" as const,
                    color: "rgba(255,255,255,0.22)",
                }}>
                    progress
                </span>
                <span style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 9, color: "rgba(255,255,255,0.28)",
                }}>
                    {formatBaht(contributed)} / {formatBaht(target)}
                </span>
            </div>
            <div style={{
                width: "100%", height: 3,
                background: "rgba(255,255,255,0.07)",
                borderRadius: 999, overflow: "hidden",
            }}>
                <div style={{
                    height: "100%",
                    width: `${displayPct}%`,
                    background: "linear-gradient(90deg,rgba(212,168,80,0.7),rgba(230,195,110,0.9))",
                    borderRadius: 999,
                    transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                }} />
            </div>
        </div>
    );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function WishCard({ event, leaving }: { event: WishEvent; leaving: boolean }) {
    const isContrib = event.type === "wish_contribution";
    const contrib = isContrib ? (event as WishContributionPayload) : null;
    const surprise = !isContrib ? (event as WishSurprisePayload) : null;

    const accentBar = isContrib
        ? "linear-gradient(90deg,rgba(212,168,80,0.9),rgba(230,195,110,0.6),transparent)"
        : "linear-gradient(90deg,rgba(180,140,220,0.9),rgba(200,165,235,0.6),transparent)";
    const amountColor = isContrib
        ? "rgba(212,168,80,0.92)"
        : "rgba(180,140,220,0.92)";

    // Progress bar: show approved_total + this contribution vs target
    const showProgress = Boolean(
        contrib &&
        contrib.approvedTotal != null &&
        contrib.targetAmount != null
    );
    const displayedTotal = showProgress
        ? (contrib!.approvedTotal! + contrib!.amount) // include this contribution
        : 0;

    return (
        <div style={{
            position: "absolute",
            left: 24, top: 24,
            width: 280,
            background: "rgba(12,8,6,0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
            pointerEvents: "none",
            animation: leaving
                ? "wishOut 0.4s cubic-bezier(0.4,0,0.8,0.6) forwards"
                : "wishIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
        }}>

            {/* Accent bar */}
            <div style={{ height: 2.5, background: accentBar }} />

            <div style={{ padding: "12px 14px 13px" }}>

                {/* Row 1: avatar + username + amount */}
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                    <Avatar url={event.avatarUrl} username={event.username} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontFamily: "'Noto Sans Thai','DM Sans',sans-serif",
                            fontSize: 12, fontWeight: 500,
                            color: "rgba(255,240,215,0.95)",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            lineHeight: 1.3,
                        }}>
                            {event.username}
                        </div>
                        <div style={{
                            fontFamily: "'Cormorant Garamond',serif",
                            fontSize: 10, fontStyle: "italic", fontWeight: 300,
                            color: "rgba(255,255,255,0.35)", lineHeight: 1, marginTop: 1,
                        }}>
                            {isContrib ? "contributed to a wish" : "sent a surprise gift"}
                        </div>
                    </div>

                    {event.amount != null && (
                        <div style={{
                            fontFamily: "'DM Sans',sans-serif",
                            fontSize: 16, fontWeight: 300,
                            letterSpacing: "-0.5px", flexShrink: 0,
                            color: amountColor,
                        }}>
                            {formatBaht(event.amount)}
                        </div>
                    )}
                </div>

                {/* Row 2: icon + wish/item title */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: isContrib ? 9 : (surprise?.message ? 7 : 0) }}>
                    {isContrib ? <CoinIcon /> : <GiftIcon />}
                    <div style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 13, fontWeight: 400, lineHeight: 1.4,
                        color: "rgba(255,240,215,0.88)", flex: 1,
                    }}>
                        {contrib?.wishTitle ?? surprise?.itemName}
                    </div>
                </div>

                {/* Message (surprise only) */}
                {surprise?.message && (
                    <div style={{
                        fontFamily: "'Noto Sans Thai','DM Sans',sans-serif",
                        fontSize: 10, fontWeight: 300, fontStyle: "italic",
                        color: "rgba(255,240,215,0.45)", lineHeight: 1.55,
                        marginBottom: 0,
                        borderLeft: "1.5px solid rgba(180,140,220,0.3)",
                        paddingLeft: 7,
                    }}>
                        "{surprise.message}"
                    </div>
                )}

                {/* Progress bar (contribution only, when totals available) */}
                {showProgress && (
                    <ProgressBar
                        contributed={displayedTotal}
                        target={contrib!.targetAmount!}
                    />
                )}
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════════

export function WishOverlay() {
    const [current, setCurrent] = useState<WishEvent | null>(null);
    const [leaving, setLeaving] = useState(false);
    const queueRef = useRef<WishEvent[]>([]);
    const busyRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const processNext = useCallback(() => {
        if (busyRef.current || queueRef.current.length === 0) return;
        busyRef.current = true;
        const evt = queueRef.current.shift()!;
        setCurrent(evt);
        setLeaving(false);
        playChime(evt.type === "wish_contribution" ? "contribution" : "surprise");

        timerRef.current = setTimeout(() => {
            setLeaving(true);
            setTimeout(() => {
                setCurrent(null);
                setLeaving(false);
                busyRef.current = false;
                setTimeout(processNext, 200);
            }, 420);
        }, 5000);
    }, []);

    const enqueue = useCallback((evt: WishEvent) => {
        queueRef.current.push(evt);
        processNext();
    }, [processNext]);

    // ── Supabase realtime ───────────────────────────────────────────────────
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel(OVERLAY_CHANNEL)
            .on("broadcast", { event: "garden-event" }, ({ payload }) => {
                if (
                    payload?.type !== "wish_contribution" &&
                    payload?.type !== "wish_surprise"
                ) return;
                enqueue({ ...payload, id: `${Date.now()}-${Math.random()}` } as WishEvent);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [enqueue]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Thai:wght@300;400;500&display=swap');

                @keyframes wishIn {
                    from { opacity:0; transform:translateX(-18px); }
                    to   { opacity:1; transform:translateX(0); }
                }
                @keyframes wishOut {
                    from { opacity:1; transform:translateX(0); }
                    to   { opacity:0; transform:translateX(-14px); }
                }
            `}</style>

            {/*
             * Root fills the entire OBS Browser Source canvas (transparent).
             * Card centers itself via absolute + translate(-50%,-50%).
             * Resize the OBS source to taste — card always stays centered.
             */}
            <div style={{
                position: "fixed", inset: 0,
                background: "transparent",
                overflow: "hidden",
            }}>
                {current && <WishCard event={current} leaving={leaving} />}
            </div>
        </>
    );
}