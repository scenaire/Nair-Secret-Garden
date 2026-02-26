// app/gallery/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/GardenNavbar";
import { useAuth } from "@/hooks/useAuth";
import { StampCard } from "@/components/ui/StampCard";
import { ArtCard } from "@/components/gallery/ArtCard";
import { SubmitSidebar } from "@/components/gallery/SubmitSidebar";
import { fetchSubmissions, deleteSubmission, type FanartSubmission } from "@/lib/gallerySync";

const SIDEBAR_W = 260;

export default function GalleryPage() {
    const { isLoggedIn, user: uiUser, rawUser, loginWithTwitch, logout } = useAuth();
    const [submissions, setSubmissions] = useState<FanartSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
    }, []);

    const handleDelete = useCallback(async (id: string, imagePath: string) => {
        setSubmissions(prev => prev.filter(s => s.id !== id));
        try {
            await deleteSubmission(id, imagePath);
        } catch (err) {
            console.error(err);
            fetchSubmissions().then(setSubmissions);
        }
    }, []);

    return (
        <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#FDFBF4" }}>
            {/* subtle grid overlay */}
            <div className="fixed inset-0 pointer-events-none" style={{
                zIndex: 0,
                backgroundImage: "linear-gradient(rgba(74,107,69,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(74,107,69,0.032) 1px, transparent 1px)",
                backgroundSize: "52px 52px",
            }} />

            <Navbar isLoggedIn={isLoggedIn} user={uiUser} onLogin={loginWithTwitch} onLogout={logout} />

            <div className="flex flex-1" style={{ paddingTop: 48 }}>

                {/* sidebar */}
                {isLoggedIn ? (
                    <SubmitSidebar
                        userId={userId}
                        submissionCount={submissions.length}
                        artistCount={totalArtists}
                        onSubmitted={handleSubmitted}
                    />
                ) : (
                    <aside
                        className="fixed top-[48px] left-0 bottom-0 flex flex-col items-center justify-center gap-4 px-5"
                        style={{
                            width: SIDEBAR_W, zIndex: 100,
                            background: "rgba(253,251,244,0.95)",
                            borderRight: "1px solid rgba(143,175,138,0.18)",
                        }}
                    >
                        <p className="text-3xl">🌿</p>
                        <p className="text-center text-sm font-serif italic" style={{ color: "#6B4C35", fontFamily: "var(--font-cormorant), serif" }}>
                            Login to plant<br />your artwork
                        </p>
                        <motion.button
                            onClick={loginWithTwitch}
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

                {/* main gallery */}
                <main className="flex-1 relative z-10" style={{ marginLeft: SIDEBAR_W, padding: "28px 28px 80px" }}>
                    {/* header */}
                    <div className="flex items-baseline justify-between mb-5 pb-3.5" style={{ borderBottom: "1px solid rgba(143,175,138,0.1)" }}>
                        <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, fontWeight: 300, fontStyle: "italic", color: "#6B4C35" }}>
                            Growing in the conservatory
                        </h1>
                        <div className="flex gap-4" style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: "#C9A98D" }}>
                            <span className="cursor-pointer" style={{ color: "#4A6B45" }}>Newest</span>
                            <span className="cursor-pointer opacity-55">All time</span>
                        </div>
                    </div>

                    {/* loading */}
                    {isLoading && (
                        <p className="text-sm italic animate-pulse mt-16 text-center"
                            style={{ color: "#8B5E52", fontFamily: "var(--font-cormorant), serif" }}>
                            Loading the garden… 🌸
                        </p>
                    )}

                    {/* empty state */}
                    {!isLoading && submissions.length === 0 && (
                        <div className="flex flex-col items-center mt-24 gap-4">
                            <StampCard bgColor="#E8EFE7" teethRadius={8} teethDensity={0.85} borderColor="rgba(143,175,138,0.3)">
                                <div className="px-10 py-8 flex flex-col items-center gap-3 text-center">
                                    <p className="text-4xl">🌱</p>
                                    <p style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 16, fontStyle: "italic", color: "#6B4C35" }}>
                                        The garden is waiting for its first bloom
                                    </p>
                                    {isLoggedIn && (
                                        <p style={{ fontSize: 12, color: "#C9A98D" }}>Be the first to plant your artwork!</p>
                                    )}
                                </div>
                            </StampCard>
                        </div>
                    )}

                    {/* masonry grid */}
                    {!isLoading && submissions.length > 0 && (
                        <div style={{ columns: "7 180px", columnGap: 8 }}>
                            {submissions.map((s, i) => (
                                <div key={s.id} style={{ breakInside: "avoid", marginBottom: 8 }}>
                                    <ArtCard
                                        submission={s}
                                        index={i}
                                        currentUserId={userId}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </main>
    );
}