// app/gallery/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { Navbar } from "@/components/layout/GardenNavbar";
import { useAuth } from "@/hooks/useAuth";
import { StampCard } from "@/components/ui/StampCard";
import { ArtCard, Lightbox } from "@/components/gallery/ArtCard";
import { SubmitSidebar } from "@/components/gallery/SubmitSidebar";
import { fetchSubmissions, deleteSubmission, type FanartSubmission } from "@/lib/gallerySync";

const SIDEBAR_W = 280;

export default function GalleryPage() {
    const { isLoggedIn, user: uiUser, rawUser, loginWithTwitch, logout } = useAuth();
    const [submissions, setSubmissions] = useState<FanartSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lightboxItem, setLightboxItem] = useState<FanartSubmission | null>(null);
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

    const userId = rawUser?.id ?? "";
    const totalArtists = new Set(submissions.map(s => s.user_id)).size;

    useEffect(() => {
        fetchSubmissions()
            .then(setSubmissions)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const handleSubmitted = useCallback((submission: FanartSubmission) => {
        setSubmissions(prev => [submission, ...prev]);
        setMobileSheetOpen(false);
    }, []);

    const handleDelete = useCallback(async (id: string, imagePath: string | null) => {
        setSubmissions(prev => prev.filter(s => s.id !== id));
        try { await deleteSubmission(id, imagePath); }
        catch (err) { console.error(err); fetchSubmissions().then(setSubmissions); }
    }, []);

    return (
        <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDFBF4" }}>
            <Navbar isLoggedIn={isLoggedIn} user={uiUser} onLogin={loginWithTwitch} onLogout={logout} />

            <div className="flex flex-1" style={{ paddingTop: 48 }}>

                {/* ── Sidebar ── */}
                {isLoggedIn ? (
                    <SubmitSidebar
                        userId={userId}
                        submissionCount={submissions.length}
                        artistCount={totalArtists}
                        onSubmitted={handleSubmitted}
                        mobileOpen={mobileSheetOpen}
                        onMobileClose={() => setMobileSheetOpen(false)}
                    />
                ) : (
                    /* logged-out: locked sidebar (desktop only) */
                    <aside className="hidden md:flex fixed top-[48px] left-0 bottom-0 flex-col items-center justify-center gap-4 px-5"
                        style={{ width: SIDEBAR_W, zIndex: 100, background: "rgba(253,251,244,0.95)", borderRight: "1px solid rgba(143,175,138,0.18)" }}
                    >
                        <Sprout size={28} style={{ color: "#8FAF8A", opacity: 0.6 }} />
                        <p className="text-center italic" style={{ fontSize: 15, color: "#6B4C35", fontFamily: "var(--font-cormorant), serif" }}>
                            Login to plant<br />your artwork
                        </p>
                        <motion.button onClick={loginWithTwitch}
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold"
                            style={{ backgroundColor: "#9146FF", color: "#fff" }}
                        >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="white">
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                            </svg>
                            Login with Twitch
                        </motion.button>
                    </aside>
                )}

                {/* ── Gallery area ── */}
                <div
                    className="flex-1 relative"
                    style={{
                        marginLeft: 0,
                        // desktop: push right of sidebar
                        // (Tailwind can't do dynamic values, use inline)
                    }}
                >
                    {/* desktop margin wrapper */}
                    <div className="hidden md:block" style={{ marginLeft: SIDEBAR_W, minHeight: "calc(100vh - 48px)" }}>
                        <GalleryContent
                            submissions={submissions}
                            isLoading={isLoading}
                            isLoggedIn={isLoggedIn}
                            userId={userId}
                            onDelete={handleDelete}
                            onCardClick={setLightboxItem}
                        />
                    </div>

                    {/* mobile: full width */}
                    <div className="md:hidden" style={{ minHeight: "calc(100vh - 48px)" }}>
                        <GalleryContent
                            submissions={submissions}
                            isLoading={isLoading}
                            isLoggedIn={isLoggedIn}
                            userId={userId}
                            onDelete={handleDelete}
                            onCardClick={setLightboxItem}
                        />
                    </div>
                </div>
            </div>

            {/* ── Mobile FAB — open submit sheet ── */}
            {isLoggedIn && (
                <motion.button
                    className="fixed bottom-6 right-6 md:hidden flex items-center gap-2 px-5 py-3 rounded-full shadow-lg z-50"
                    style={{
                        background: "linear-gradient(135deg, #4A6B45, #8FAF8A)",
                        color: "white",
                        fontFamily: "var(--font-cormorant), serif",
                        fontSize: 15, fontStyle: "italic",
                        boxShadow: "0 6px 24px rgba(74,107,69,0.35)",
                    }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => setMobileSheetOpen(true)}
                >
                    <Sprout size={16} />
                    Plant artwork
                </motion.button>
            )}

            {/* lightbox */}
            {lightboxItem && (
                <Lightbox submission={lightboxItem} onClose={() => setLightboxItem(null)} />
            )}
        </main>
    );
}

// ── extracted gallery content (shared desktop/mobile) ────────
interface GalleryContentProps {
    submissions: FanartSubmission[];
    isLoading: boolean;
    isLoggedIn: boolean;
    userId: string;
    onDelete: (id: string, imagePath: string | null) => void;
    onCardClick: (s: FanartSubmission) => void;
}

function GalleryContent({ submissions, isLoading, isLoggedIn, userId, onDelete, onCardClick }: GalleryContentProps) {
    return (
        /* plaid bg */
        <div style={{
            minHeight: "calc(100vh - 48px)",
            backgroundColor: "#E0D8C5",
            backgroundImage: `
                linear-gradient(0deg, rgba(131,158,81,0.18) 50%, transparent 50%),
                linear-gradient(90deg, rgba(131,158,81,0.18) 50%, transparent 50%),
                repeating-linear-gradient(45deg, rgba(131,158,81,0.22) 0px, rgba(131,158,81,0.22) 2px, transparent 2px, transparent 6px)
            `,
            backgroundSize: "48px 48px, 48px 48px, 48px 48px",
            backgroundBlendMode: "multiply",
        }}>
            {/* cream inset */}
            <div style={{
                margin: "0 16px 16px",
                borderRadius: "0 0 10px 10px",
                background: "rgba(253,251,244,0.86)",
                boxShadow: "0 2px 16px rgba(74,107,69,0.08)",
                padding: "20px 20px 80px",
            }}>
                {/* header */}
                <div className="flex items-baseline justify-between mb-5 pb-3" style={{ borderBottom: "1px solid rgba(143,175,138,0.1)" }}>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 22, fontWeight: 300, fontStyle: "italic", color: "#6B4C35" }}>
                        Growing in the conservatory
                    </h1>
                    <div className="flex gap-4" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#C9A98D" }}>
                        <span className="cursor-pointer" style={{ color: "#4A6B45" }}>Newest</span>
                        <span className="cursor-pointer opacity-55">All time</span>
                    </div>
                </div>

                {/* loading */}
                {isLoading && (
                    <p className="text-base italic animate-pulse mt-16 text-center"
                        style={{ color: "#8B5E52", fontFamily: "var(--font-cormorant), serif" }}>
                        Loading the garden…
                    </p>
                )}

                {/* empty state */}
                {!isLoading && submissions.length === 0 && (
                    <div className="flex flex-col items-center mt-16 gap-4">
                        <StampCard bgColor="#E8EFE7" teethRadius={8} teethDensity={0.85} borderColor="rgba(143,175,138,0.3)">
                            <div className="px-10 py-8 flex flex-col items-center gap-3 text-center">
                                <Sprout size={32} style={{ color: "#8FAF8A", opacity: 0.5 }} />
                                <p style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 17, fontStyle: "italic", color: "#6B4C35" }}>
                                    The garden is waiting for its first bloom
                                </p>
                                {isLoggedIn && <p style={{ fontSize: 13, color: "#C9A98D" }}>Be the first to plant your artwork!</p>}
                            </div>
                        </StampCard>
                    </div>
                )}

                {/* masonry grid */}
                {!isLoading && submissions.length > 0 && (
                    <div style={{ columns: "7 160px", columnGap: 8 }}>
                        {submissions.map((s, i) => (
                            <div key={s.id} style={{ breakInside: "avoid", marginBottom: 8 }}>
                                <ArtCard
                                    submission={s} index={i}
                                    currentUserId={userId}
                                    onDelete={onDelete}
                                    onClick={() => onCardClick(s)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}