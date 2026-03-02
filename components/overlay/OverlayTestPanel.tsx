// components/overlay/OverlayTestPanel.tsx
// Dev-only panel for triggering overlay broadcast events manually.
"use client";

import { useState } from "react";
import { broadcastGardenEvent } from "@/lib/gardenBroadcast";
import { THEMES, type ThemeKey } from "./constants";

// ── Mini UI helpers ───────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            fontFamily: "monospace", fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: 4,
        }}>
            {children}
        </div>
    );
}

function Input({ value, onChange, placeholder }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
                width: "100%", padding: "6px 9px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 4, color: "rgba(255,255,255,0.85)",
                fontFamily: "'DM Sans',sans-serif", fontSize: 12,
                outline: "none",
            }}
        />
    );
}

function Section({ title, accent, children }: {
    title: string; accent: string; children: React.ReactNode;
}) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid rgba(255,255,255,0.07)`,
            borderLeft: `3px solid ${accent}`,
            borderRadius: 6, padding: "14px 16px",
        }}>
            <div style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 13, fontWeight: 400, letterSpacing: "0.5px",
                color: accent, marginBottom: 12,
            }}>
                {title}
            </div>
            {children}
        </div>
    );
}

function FireButton({ label, accent, onClick, status }: {
    label: string; accent: string;
    onClick: () => Promise<void>;
    status: "idle" | "sending" | "sent" | "error";
}) {
    const bg = status === "sent" ? "rgba(100,200,120,0.15)"
        : status === "error" ? "rgba(200,80,80,0.15)"
            : "rgba(255,255,255,0.04)";
    const text = status === "sending" ? "sending…"
        : status === "sent" ? "sent ✓"
            : status === "error" ? "error ✗"
                : label;
    return (
        <button
            onClick={onClick}
            disabled={status === "sending"}
            style={{
                marginTop: 12, width: "100%",
                padding: "8px 0", borderRadius: 4,
                border: `1px solid ${accent}55`,
                background: bg,
                color: accent, cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 12, fontWeight: 500,
                transition: "background 0.2s",
            }}
        >
            {text}
        </button>
    );
}

// ── Status hook ───────────────────────────────────────────────────────────────

function useFire() {
    const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const fire = async (fn: () => Promise<void>) => {
        setStatus("sending");
        try {
            await fn();
            setStatus("sent");
            setTimeout(() => setStatus("idle"), 1800);
        } catch (e) {
            console.error(e);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 2500);
        }
    };
    return { status, fire };
}

// ══════════════════════════════════════════════════════════════════════════════

export function OverlayTestPanel() {
    // ── Seed ──────────────────────────────────────────────────────────────────
    const [seedUser, setSeedUser] = useState("ทดสอบระบบ");
    const [seedTheme, setSeedTheme] = useState<ThemeKey>("lavender");
    const seedFire = useFire();

    // ── Bloom ─────────────────────────────────────────────────────────────────
    const [bloomUser, setBloomUser] = useState("artist_chan");
    const [bloomImage, setBloomImage] = useState("https://picsum.photos/seed/fanart/400/400");
    const bloomFire = useFire();

    // ── Wish Contribution ─────────────────────────────────────────────────────
    const [contribUser, setContribUser] = useState("น้องแมว_99");
    const [contribWish, setContribWish] = useState("Mechanical Keyboard Keycaps Set");
    const [contribAmount, setContribAmount] = useState("800");
    const [contribApproved, setContribApproved] = useState("3200");
    const [contribTarget, setContribTarget] = useState("12000");
    const [contribAvatar, setContribAvatar] = useState("https://i.pravatar.cc/64?img=47");
    const contribFire = useFire();

    // ── Wish Surprise ─────────────────────────────────────────────────────────
    const [surpriseUser, setSurpriseUser] = useState("hibiscus548");
    const [surpriseItem, setSurpriseItem] = useState("Hand-painted Fan Art Print");
    const [surpriseAmount, setSurpriseAmount] = useState("1500");
    const [surpriseMessage, setSurpriseMessage] = useState("ของขวัญเล็กๆ จากใจ หวังว่าจะชอบนะคะ 🌸");
    const [surpriseAvatar, setSurpriseAvatar] = useState("https://i.pravatar.cc/64?img=12");
    const surpriseFire = useFire();

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Thai:wght@300;400;500&display=swap');
                * { box-sizing: border-box; }
                input::placeholder { color: rgba(255,255,255,0.18); }
                input:focus { border-color: rgba(255,255,255,0.22) !important; }
                select { appearance: none; }
            `}</style>

            <div style={{
                minHeight: "100vh",
                background: "#0e0b12",
                padding: "32px 24px",
                fontFamily: "'DM Sans',sans-serif",
            }}>
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 22, fontWeight: 300,
                        color: "rgba(255,240,215,0.9)",
                        letterSpacing: "0.5px",
                    }}>
                        Overlay Test Panel
                    </div>
                    <div style={{
                        fontSize: 11, color: "rgba(255,255,255,0.3)",
                        marginTop: 4, fontFamily: "monospace",
                    }}>
                        dev only · broadcasts to Supabase channel "{/* OVERLAY_CHANNEL */}garden-overlay"
                    </div>
                </div>

                {/* Instruction */}
                <div style={{
                    background: "rgba(255,200,80,0.06)",
                    border: "1px solid rgba(255,200,80,0.15)",
                    borderRadius: 5, padding: "10px 14px",
                    marginBottom: 24,
                    fontSize: 11, color: "rgba(255,220,120,0.7)",
                    fontFamily: "monospace", lineHeight: 1.6,
                }}>
                    1. เปิด <strong style={{ color: "rgba(255,220,120,0.9)" }}>/overlay</strong> หรือ{" "}
                    <strong style={{ color: "rgba(255,220,120,0.9)" }}>/overlay/wish</strong> ใน tab อื่น
                    <br />
                    2. กดปุ่ม Fire ใน panel นี้
                    <br />
                    3. ดู notification ปรากฏใน tab นั้น
                </div>

                <div style={{ display: "grid", gap: 16, maxWidth: 560 }}>

                    {/* ── Seed ── */}
                    <Section title="🌱 Seed (Guestbook wish)" accent="rgba(212,168,80,0.8)">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div>
                                <Label>username</Label>
                                <Input value={seedUser} onChange={setSeedUser} placeholder="ชื่อผู้ใช้" />
                            </div>
                            <div>
                                <Label>theme</Label>
                                <select
                                    value={seedTheme}
                                    onChange={e => setSeedTheme(e.target.value as ThemeKey)}
                                    style={{
                                        width: "100%", padding: "6px 9px",
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.10)",
                                        borderRadius: 4, color: "rgba(255,255,255,0.85)",
                                        fontFamily: "'DM Sans',sans-serif", fontSize: 12,
                                    }}
                                >
                                    {(Object.keys(THEMES) as ThemeKey[]).map(k => (
                                        <option key={k} value={k}>{k}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <FireButton
                            label="Fire Seed →"
                            accent="rgba(212,168,80,0.8)"
                            status={seedFire.status}
                            onClick={() => seedFire.fire(() =>
                                broadcastGardenEvent({ type: "seed", username: seedUser, themeKey: seedTheme })
                            )}
                        />
                    </Section>

                    {/* ── Bloom ── */}
                    <Section title="🌸 Bloom (Fan art)" accent="rgba(200,165,235,0.8)">
                        <div style={{ display: "grid", gap: 8 }}>
                            <div>
                                <Label>username</Label>
                                <Input value={bloomUser} onChange={setBloomUser} placeholder="ชื่อ artist" />
                            </div>
                            <div>
                                <Label>image URL (optional)</Label>
                                <Input value={bloomImage} onChange={setBloomImage} placeholder="https://..." />
                            </div>
                        </div>
                        <FireButton
                            label="Fire Bloom →"
                            accent="rgba(200,165,235,0.8)"
                            status={bloomFire.status}
                            onClick={() => bloomFire.fire(() =>
                                broadcastGardenEvent({
                                    type: "bloom",
                                    username: bloomUser,
                                    imageUrl: bloomImage || undefined,
                                })
                            )}
                        />
                    </Section>

                    {/* ── Contribution ── */}
                    <Section title="💰 Wish Contribution" accent="rgba(212,168,80,0.8)">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div style={{ gridColumn: "1/-1" }}>
                                <Label>username</Label>
                                <Input value={contribUser} onChange={setContribUser} />
                            </div>
                            <div style={{ gridColumn: "1/-1" }}>
                                <Label>wish title</Label>
                                <Input value={contribWish} onChange={setContribWish} />
                            </div>
                            <div>
                                <Label>amount (฿)</Label>
                                <Input value={contribAmount} onChange={setContribAmount} placeholder="800" />
                            </div>
                            <div>
                                <Label>avatar URL</Label>
                                <Input value={contribAvatar} onChange={setContribAvatar} placeholder="https://..." />
                            </div>
                            <div>
                                <Label>approved total (฿)</Label>
                                <Input value={contribApproved} onChange={setContribApproved} placeholder="3200" />
                            </div>
                            <div>
                                <Label>target (฿)</Label>
                                <Input value={contribTarget} onChange={setContribTarget} placeholder="12000" />
                            </div>
                        </div>
                        <FireButton
                            label="Fire Contribution →"
                            accent="rgba(212,168,80,0.8)"
                            status={contribFire.status}
                            onClick={() => contribFire.fire(() =>
                                broadcastGardenEvent({
                                    type: "wish_contribution",
                                    username: contribUser,
                                    wishTitle: contribWish,
                                    amount: Number(contribAmount) || 0,
                                    avatarUrl: contribAvatar || undefined,
                                    approvedTotal: Number(contribApproved) || undefined,
                                    targetAmount: Number(contribTarget) || undefined,
                                } as any)
                            )}
                        />
                    </Section>

                    {/* ── Surprise ── */}
                    <Section title="🎁 Wish Surprise" accent="rgba(180,140,220,0.8)">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div>
                                <Label>username</Label>
                                <Input value={surpriseUser} onChange={setSurpriseUser} />
                            </div>
                            <div>
                                <Label>amount (฿, optional)</Label>
                                <Input value={surpriseAmount} onChange={setSurpriseAmount} placeholder="1500" />
                            </div>
                            <div style={{ gridColumn: "1/-1" }}>
                                <Label>item name</Label>
                                <Input value={surpriseItem} onChange={setSurpriseItem} />
                            </div>
                            <div style={{ gridColumn: "1/-1" }}>
                                <Label>message (optional)</Label>
                                <Input value={surpriseMessage} onChange={setSurpriseMessage} />
                            </div>
                            <div style={{ gridColumn: "1/-1" }}>
                                <Label>avatar URL (optional)</Label>
                                <Input value={surpriseAvatar} onChange={setSurpriseAvatar} placeholder="https://..." />
                            </div>
                        </div>
                        <FireButton
                            label="Fire Surprise →"
                            accent="rgba(180,140,220,0.8)"
                            status={surpriseFire.status}
                            onClick={() => surpriseFire.fire(() =>
                                broadcastGardenEvent({
                                    type: "wish_surprise",
                                    username: surpriseUser,
                                    itemName: surpriseItem,
                                    amount: Number(surpriseAmount) || undefined,
                                    message: surpriseMessage || undefined,
                                    avatarUrl: surpriseAvatar || undefined,
                                } as any)
                            )}
                        />
                    </Section>

                </div>
            </div>
        </>
    );
}