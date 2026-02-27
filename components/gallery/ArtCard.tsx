// components/gallery/ArtCard.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, AlertTriangle, ExternalLink, Trash2 } from "lucide-react";
import type { FanartSubmission } from "@/lib/gallerySync";

interface ArtCardProps {
    submission: FanartSubmission;
    index: number;
    currentUserId?: string;
    onDelete?: (id: string, imagePath: string | null) => void;
    onClick?: () => void;
}

export function ArtCard({ submission, index, currentUserId, onDelete, onClick }: ArtCardProps) {
    const isNew = Date.now() - new Date(submission.created_at).getTime() < 48 * 60 * 60 * 1000;
    const isOwner = currentUserId === submission.user_id;
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.03, ease: "easeOut" }}
            className="relative group cursor-pointer"
            style={{
                borderRadius: 5, overflow: "hidden", background: "#F6F3EF",
                boxShadow: "0 1px 4px rgba(74,107,69,0.07), 0 0 0 1px rgba(143,175,138,0.14)",
            }}
            whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(74,107,69,0.13), 0 0 0 1px rgba(143,175,138,0.28)", transition: { duration: 0.28 } }}
            onClick={!imgError ? onClick : undefined}
        >
            {imgError ? (
                <div className="w-full flex flex-col items-center justify-center gap-2" style={{ aspectRatio: "1", background: "#F0EDE6" }}>
                    <AlertTriangle size={20} style={{ color: "#C9A98D", opacity: 0.4 }} />
                </div>
            ) : (
                <img
                    src={submission.image_url}
                    alt={`Fan art by ${submission.artist_name}`}
                    className="w-full block transition-transform duration-300 group-hover:scale-[1.025]"
                    loading="lazy"
                    onError={() => setImgError(true)}
                />
            )}

            {/* hover overlay */}
            {!imgError && (
                <div
                    className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-[280ms]"
                    style={{ background: "linear-gradient(0deg, rgba(42,35,28,0.72) 0%, transparent 50%)", padding: 10, gap: 2 }}
                >
                    <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 13, fontStyle: "italic", color: "white", lineHeight: 1.2 }}>
                        by {submission.artist_name}
                    </span>
                    {submission.social_link && (
                        <a
                            href={submission.social_link.startsWith("http") ? submission.social_link : `https://${submission.social_link}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1"
                            style={{ fontSize: 8, letterSpacing: "0.12em", color: "#C8DEC5", textDecoration: "none", opacity: 0.8, textTransform: "uppercase" }}
                        >
                            <ExternalLink size={8} />
                            {submission.social_link}
                        </a>
                    )}
                </div>
            )}

            {/* error badge */}
            {imgError && (
                <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center gap-1.5 px-2 py-1 rounded"
                    style={{ background: "rgba(200,80,60,0.88)", backdropFilter: "blur(4px)" }}>
                    <AlertTriangle size={10} color="white" />
                    <span style={{ fontSize: 8, color: "white", letterSpacing: "0.06em", lineHeight: 1.3 }}>
                        Image unavailable — link may be expired or hotlink-protected
                    </span>
                </div>
            )}

            {/* new badge */}
            {isNew && !imgError && (
                <div className="absolute top-1.5 right-1.5" style={{
                    background: "rgba(253,251,244,0.9)", border: "1px solid rgba(143,175,138,0.35)",
                    color: "#4A6B45", fontSize: 7, letterSpacing: "0.16em",
                    textTransform: "uppercase", padding: "2px 6px", borderRadius: 20, backdropFilter: "blur(4px)",
                }}>New</div>
            )}

            {/* delete button */}
            {isOwner && onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(submission.id, submission.image_path); }}
                    className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-white/90 border items-center justify-center hidden group-hover:flex transition-colors hover:bg-red-50"
                    style={{ borderColor: "rgba(180,140,120,0.3)" }}
                    title="Remove"
                >
                    <Trash2 size={11} style={{ color: "#8B5E52" }} />
                </button>
            )}
        </motion.div>
    );
}

// ── Lightbox ─────────────────────────────────────────────────
interface LightboxProps {
    submission: FanartSubmission;
    onClose: () => void;
}

export function Lightbox({ submission, onClose }: LightboxProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                key="lightbox-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 flex items-center justify-center px-4"
                style={{ zIndex: 999, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(3px)" }}
                onClick={onClose}
            >
                <motion.div
                    key="lightbox-card"
                    initial={{ opacity: 0, scale: 0.94, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative flex flex-col"
                    style={{
                        maxWidth: "min(92vw, 780px)", maxHeight: "90vh",
                        background: "white",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
                        borderRadius: 4, overflow: "hidden",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={submission.image_url}
                        alt={`Fan art by ${submission.artist_name}`}
                        style={{ maxHeight: "80vh", maxWidth: "100%", objectFit: "contain", display: "block" }}
                    />
                    <div className="flex items-center justify-between px-4 py-3"
                        style={{ borderTop: "1px solid rgba(143,175,138,0.15)" }}>
                        <div className="flex flex-col gap-0.5">
                            <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 16, fontStyle: "italic", color: "#6B4C35" }}>
                                by {submission.artist_name}
                            </span>
                            {submission.social_link && (
                                <a
                                    href={submission.social_link.startsWith("http") ? submission.social_link : `https://${submission.social_link}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1"
                                    style={{ fontSize: 11, color: "#8FAF8A", textDecoration: "none", letterSpacing: "0.06em" }}
                                >
                                    <ExternalLink size={11} />
                                    {submission.social_link}
                                </a>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                            style={{ background: "rgba(143,175,138,0.12)", border: "1px solid rgba(143,175,138,0.2)" }}
                        >
                            <X size={14} style={{ color: "#6B4C35" }} />
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}