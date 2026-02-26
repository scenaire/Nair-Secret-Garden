// components/gallery/ArtCard.tsx
"use client";

import { motion } from "framer-motion";
import type { FanartSubmission } from "@/lib/gallerySync";

interface ArtCardProps {
    submission: FanartSubmission;
    index: number;
    currentUserId?: string;
    onDelete?: (id: string, imagePath: string) => void;
}

export function ArtCard({ submission, index, currentUserId, onDelete }: ArtCardProps) {
    const isNew = Date.now() - new Date(submission.created_at).getTime() < 48 * 60 * 60 * 1000;
    const isOwner = currentUserId === submission.user_id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.03, ease: "easeOut" }}
            className="relative group cursor-pointer"
            style={{
                borderRadius: 5,
                overflow: "hidden",
                background: "#F6F3EF",
                boxShadow: "0 1px 4px rgba(74,107,69,0.07), 0 0 0 1px rgba(143,175,138,0.14)",
            }}
            whileHover={{
                y: -2,
                boxShadow: "0 8px 24px rgba(74,107,69,0.13), 0 0 0 1px rgba(143,175,138,0.28)",
                transition: { duration: 0.28 },
            }}
        >
            {/* image */}
            <img
                src={submission.image_url}
                alt={`Fan art by ${submission.artist_name}`}
                className="w-full block transition-transform duration-350"
                style={{ display: "block" }}
                loading="lazy"
            />

            {/* hover overlay — artist info */}
            <div
                className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-[280ms]"
                style={{
                    background: "linear-gradient(0deg, rgba(42,35,28,0.72) 0%, transparent 50%)",
                    padding: "10px",
                    gap: 2,
                }}
            >
                <span style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontSize: 13, fontStyle: "italic",
                    color: "white", lineHeight: 1.2,
                }}>
                    by {submission.artist_name}
                </span>
                {submission.social_link && (
                    <a
                        href={submission.social_link.startsWith("http") ? submission.social_link : `https://${submission.social_link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            fontSize: 8, letterSpacing: "0.12em",
                            color: "#C8DEC5", textDecoration: "none",
                            opacity: 0.8, textTransform: "uppercase",
                        }}
                    >
                        {submission.social_link}
                    </a>
                )}
            </div>

            {/* new badge */}
            {isNew && (
                <div
                    className="absolute top-1.5 right-1.5"
                    style={{
                        background: "rgba(253,251,244,0.9)",
                        border: "1px solid rgba(143,175,138,0.35)",
                        color: "#4A6B45",
                        fontSize: 7, letterSpacing: "0.16em",
                        textTransform: "uppercase", padding: "2px 6px",
                        borderRadius: 20, backdropFilter: "blur(4px)",
                    }}
                >
                    New
                </div>
            )}

            {/* delete button (owner only) */}
            {isOwner && onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(submission.id, submission.image_path); }}
                    className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-white/90 border items-center justify-center hidden group-hover:flex"
                    style={{ borderColor: "rgba(180,140,120,0.3)", color: "#8B5E52", fontSize: 10 }}
                    title="Remove"
                >✕</button>
            )}
        </motion.div>
    );
}