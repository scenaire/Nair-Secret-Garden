// components/gallery/SubmitSidebar.tsx
"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { submitFanart, type FanartSubmission } from "@/lib/gallerySync";

interface SubmitSidebarProps {
    userId: string;
    submissionCount: number;
    artistCount: number;
    onSubmitted: (submission: FanartSubmission) => void;
}

type SubmitStatus = "idle" | "uploading" | "success" | "error";

export function SubmitSidebar({ userId, submissionCount, artistCount, onSubmitted }: SubmitSidebarProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [artistName, setArtistName] = useState("");
    const [socialLink, setSocialLink] = useState("");
    const [status, setStatus] = useState<SubmitStatus>("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((f: File) => {
        if (!f.type.startsWith("image/")) { setErrorMsg("Please upload an image file."); return; }
        if (f.size > 3 * 1024 * 1024) { setErrorMsg("File must be under 3MB."); return; }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setErrorMsg("");
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const handleSubmit = async () => {
        if (!file || !artistName.trim()) return;
        setStatus("uploading");
        setErrorMsg("");
        try {
            const submission = await submitFanart({ file, artistName, socialLink, userId });
            onSubmitted(submission);
            setStatus("success");
            setTimeout(() => {
                setFile(null); setPreview(null);
                setArtistName(""); setSocialLink("");
                setStatus("idle");
            }, 2000);
        } catch (err) {
            console.error(err);
            setErrorMsg("Upload failed. Please try again.");
            setStatus("error");
        }
    };

    const canSubmit = !!file && !!artistName.trim() && status === "idle";

    const inputStyle: React.CSSProperties = {
        background: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(143,175,138,0.25)",
        borderRadius: 5,
        padding: "8px 11px",
        fontFamily: "var(--font-cormorant), serif",
        fontSize: 13,
        color: "#6B4C35",
        width: "100%",
        outline: "none",
    };

    return (
        <aside
            className="fixed top-[48px] left-0 bottom-0 flex flex-col overflow-y-auto overflow-x-hidden"
            style={{
                width: 260,
                zIndex: 100,
                background: "rgba(253,251,244,0.95)",
                borderRight: "1px solid rgba(143,175,138,0.18)",
            }}
        >
            {/* iron ridge */}
            <div className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none"
                style={{ background: "linear-gradient(90deg, #4A6B45, #8FAF8A, #4A6B45)", opacity: 0.25 }} />

            {/* header */}
            <div className="px-[18px] pt-5 pb-3.5" style={{ borderBottom: "1px solid rgba(143,175,138,0.15)" }}>
                <p className="mb-1" style={{ fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.55 }}>
                    Art Pavilion
                </p>
                <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 18, fontStyle: "italic", fontWeight: 300, color: "#6B4C35" }}>
                    Plant your artwork 🌿
                </h2>
            </div>

            {/* body */}
            <div className="flex flex-col gap-3.5 p-[18px] flex-1">

                {/* upload zone */}
                <div
                    className="cursor-pointer transition-all duration-200"
                    style={{
                        border: `1.5px dashed ${isDragging ? "#8FAF8A" : "rgba(143,175,138,0.4)"}`,
                        borderRadius: 6,
                        background: isDragging ? "rgba(200,222,197,0.16)" : "rgba(200,222,197,0.07)",
                        padding: preview ? 0 : "22px 12px",
                        overflow: "hidden",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    {preview ? (
                        <div className="relative">
                            <img src={preview} alt="Preview" className="w-full object-cover block" style={{ maxHeight: 180 }} />
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/90 border flex items-center justify-center"
                                style={{ borderColor: "rgba(143,175,138,0.3)", color: "#8B5E52", fontSize: 10 }}
                            >✕</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-[22px]">🖼️</div>
                            <p style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 13, fontStyle: "italic", color: "#6B4C35", textAlign: "center", lineHeight: 1.4 }}>
                                Drop artwork here<br />or click to browse
                            </p>
                            <span style={{ fontSize: 9, color: "#C9A98D", letterSpacing: "0.05em" }}>PNG · JPG · WEBP · max 3MB</span>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </div>

                {/* artist name */}
                <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.6 }}>
                        Artist name
                    </label>
                    <input
                        type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)}
                        placeholder="your name or alias…" style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = "#8FAF8A"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(143,175,138,0.25)"}
                    />
                </div>

                {/* social link */}
                <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.6 }}>
                        Social link
                    </label>
                    <input
                        type="text" value={socialLink} onChange={(e) => setSocialLink(e.target.value)}
                        placeholder="twitter, instagram, pixiv…" style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = "#8FAF8A"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(143,175,138,0.25)"}
                    />
                </div>

                {errorMsg && <p style={{ fontSize: 10, color: "#E87A9A" }}>{errorMsg}</p>}

                {/* submit */}
                <motion.button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    whileHover={canSubmit ? { opacity: 0.88, y: -1, boxShadow: "0 6px 18px rgba(74,107,69,0.22)" } : {}}
                    whileTap={canSubmit ? { scale: 0.98 } : {}}
                    className="w-full flex items-center justify-center gap-1.5 mt-0.5"
                    style={{
                        padding: "10px",
                        background: canSubmit ? "linear-gradient(135deg, #4A6B45, #8FAF8A)" : "rgba(143,175,138,0.2)",
                        border: "none", borderRadius: 6,
                        color: canSubmit ? "white" : "rgba(143,175,138,0.5)",
                        cursor: canSubmit ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-cormorant), serif",
                        fontSize: 14, fontStyle: "italic",
                    }}
                >
                    {status === "uploading" ? "Planting… 🌿" : status === "success" ? "Planted! 🌸" : "🌱 Place in the Pavilion"}
                </motion.button>
            </div>

            {/* greenhouse arch deco */}
            <div className="px-[18px] pb-3" style={{ opacity: 0.13 }}>
                <svg viewBox="0 0 224 48" fill="none" width="100%">
                    <path d="M4 48 L4 22 Q4 4 24 4 L112 4 L200 4 Q220 4 220 22 L220 48" stroke="#4A6B45" strokeWidth="2" fill="none" />
                    <line x1="112" y1="4" x2="112" y2="48" stroke="#4A6B45" strokeWidth="1.5" />
                    <line x1="4" y1="28" x2="220" y2="28" stroke="#4A6B45" strokeWidth="1.2" />
                    <line x1="58" y1="13" x2="58" y2="48" stroke="#4A6B45" strokeWidth="0.8" />
                    <line x1="166" y1="13" x2="166" y2="48" stroke="#4A6B45" strokeWidth="0.8" />
                </svg>
            </div>

            {/* stats */}
            <div className="px-[18px] py-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(143,175,138,0.12)" }}>
                <div>
                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 22, fontWeight: 300, color: "#4A6B45", opacity: 0.4, lineHeight: 1 }}>
                        {submissionCount}
                    </div>
                    <div style={{ fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A98D", marginTop: 2 }}>
                        pieces in bloom
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 22, fontWeight: 300, color: "#4A6B45", opacity: 0.4, lineHeight: 1 }}>
                        {artistCount}
                    </div>
                    <div style={{ fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C9A98D", marginTop: 2 }}>
                        artists
                    </div>
                </div>
            </div>
        </aside>
    );
}