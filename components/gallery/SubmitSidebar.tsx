// components/gallery/SubmitSidebar.tsx
"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Link2, ImageIcon, X, Sprout, CheckCircle2, Loader2, Leaf, Info } from "lucide-react";
import { submitFanartFile, submitFanartUrl, compressImage, type FanartSubmission } from "@/lib/gallerySync";

interface SubmitSidebarProps {
    userId: string;
    submissionCount: number;
    artistCount: number;
    onSubmitted: (submission: FanartSubmission) => void;
    // mobile: controlled from parent
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

type SubmitStatus = "idle" | "uploading" | "success" | "error";
type InputTab = "file" | "url";

export function SubmitSidebar({ userId, submissionCount, artistCount, onSubmitted, mobileOpen, onMobileClose }: SubmitSidebarProps) {
    const [tab, setTab] = useState<InputTab>("file");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [artistName, setArtistName] = useState("");
    const [socialLink, setSocialLink] = useState("");
    const [status, setStatus] = useState<SubmitStatus>("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [originalSize, setOriginalSize] = useState<number | null>(null);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((f: File) => {
        if (!f.type.startsWith("image/")) { setErrorMsg("Please upload an image file."); return; }
        if (f.size > 50 * 1024 * 1024) { setErrorMsg("File must be under 50MB."); return; }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setOriginalSize(f.size);
        setCompressedSize(null);
        setErrorMsg("");
        compressImage(f).then(blob => setCompressedSize(blob.size)).catch(() => { });
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const handleSubmit = async () => {
        if (!artistName.trim()) return;
        if (tab === "file" && !file) return;
        if (tab === "url" && !imageUrl.trim()) return;
        setStatus("uploading");
        setErrorMsg("");
        try {
            let submission: FanartSubmission;
            if (tab === "file") {
                submission = await submitFanartFile({ file: file!, artistName, socialLink, userId });
            } else {
                submission = await submitFanartUrl({ imageUrl, artistName, socialLink, userId });
            }
            onSubmitted(submission);
            setStatus("success");
            onMobileClose?.();
            setTimeout(() => {
                setFile(null); setPreview(null); setOriginalSize(null); setCompressedSize(null);
                setImageUrl(""); setArtistName(""); setSocialLink("");
                setStatus("idle");
            }, 2000);
        } catch (err) {
            console.error(err);
            setErrorMsg("Upload failed. Please try again.");
            setStatus("error");
        }
    };

    const canSubmit = status === "idle" && !!artistName.trim() &&
        (tab === "file" ? !!file : !!imageUrl.trim());

    const inputStyle: React.CSSProperties = {
        background: "rgba(255,255,255,0.6)",
        border: "1px solid rgba(143,175,138,0.25)",
        borderRadius: 6, padding: "10px 13px",
        fontFamily: "var(--font-cormorant), serif",
        fontSize: 15, color: "#6B4C35", width: "100%", outline: "none",
    };

    const content = (
        <>
            {/* iron ridge */}
            <div className="absolute top-0 left-0 right-0 h-0.5 pointer-events-none"
                style={{ background: "linear-gradient(90deg, #4A6B45, #8FAF8A, #4A6B45)", opacity: 0.25 }} />

            {/* header */}
            <div className="px-5 pt-5 pb-4 flex items-start justify-between" style={{ borderBottom: "1px solid rgba(143,175,138,0.15)" }}>
                <div>
                    <p className="mb-1" style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.55 }}>
                        Art Pavilion
                    </p>
                    <h2 className="flex items-center gap-2" style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, fontStyle: "italic", fontWeight: 300, color: "#6B4C35" }}>
                        <Leaf size={16} style={{ color: "#8FAF8A" }} />
                        Plant your artwork
                    </h2>
                </div>
                {/* mobile close */}
                {onMobileClose && (
                    <button onClick={onMobileClose} className="w-8 h-8 rounded-full flex items-center justify-center mt-1"
                        style={{ background: "rgba(143,175,138,0.12)", border: "1px solid rgba(143,175,138,0.2)" }}>
                        <X size={14} style={{ color: "#6B4C35" }} />
                    </button>
                )}
            </div>

            {/* body */}
            <div className="flex flex-col gap-4 p-5 flex-1">

                {/* tab toggle */}
                <div className="flex rounded-md overflow-hidden" style={{ border: "1px solid rgba(143,175,138,0.25)" }}>
                    {(["file", "url"] as InputTab[]).map((t) => (
                        <button key={t} onClick={() => { setTab(t); setErrorMsg(""); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 transition-all duration-200"
                            style={{
                                fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                                background: tab === t ? "rgba(143,175,138,0.18)" : "transparent",
                                color: tab === t ? "#4A6B45" : "rgba(107,76,53,0.4)",
                                cursor: "pointer", border: "none",
                                borderRight: t === "file" ? "1px solid rgba(143,175,138,0.25)" : undefined,
                                fontFamily: "var(--font-noto-sans-thai), sans-serif",
                            }}
                        >
                            {t === "file" ? <><Upload size={12} /> Upload</> : <><Link2 size={12} /> URL</>}
                        </button>
                    ))}
                </div>

                {/* file tab */}
                {tab === "file" && (
                    <div
                        className="cursor-pointer transition-all duration-200 rounded-md overflow-hidden"
                        style={{
                            border: `1.5px dashed ${isDragging ? "#8FAF8A" : "rgba(143,175,138,0.4)"}`,
                            background: isDragging ? "rgba(200,222,197,0.16)" : "rgba(200,222,197,0.07)",
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                    >
                        {preview ? (
                            <div className="relative">
                                <img src={preview} alt="Preview" className="w-full object-cover block" style={{ maxHeight: 200 }} />
                                {/* size info bar */}
                                {originalSize && (
                                    <div className="flex items-center justify-between px-3 py-1.5"
                                        style={{ background: "rgba(200,222,197,0.2)", fontSize: 10, color: "#4A6B45", letterSpacing: "0.04em" }}>
                                        <span style={{ opacity: 0.55 }}>{(originalSize / 1024).toFixed(0)} KB original</span>
                                        {compressedSize ? (
                                            <span className="flex items-center gap-1" style={{ fontWeight: 500 }}>
                                                <CheckCircle2 size={10} /> ~{(compressedSize / 1024).toFixed(0)} KB WebP
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1" style={{ opacity: 0.4 }}>
                                                <Loader2 size={10} className="animate-spin" /> compressing…
                                            </span>
                                        )}
                                    </div>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setOriginalSize(null); setCompressedSize(null); }}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 border flex items-center justify-center"
                                    style={{ borderColor: "rgba(143,175,138,0.3)" }}
                                >
                                    <X size={11} style={{ color: "#8B5E52" }} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-7 px-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ background: "rgba(143,175,138,0.15)" }}>
                                    <ImageIcon size={18} style={{ color: "#8FAF8A" }} />
                                </div>
                                <p style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 14, fontStyle: "italic", color: "#6B4C35", textAlign: "center", lineHeight: 1.5 }}>
                                    Drop artwork here<br />or click to browse
                                </p>
                                <span style={{ fontSize: 10, color: "#C9A98D", letterSpacing: "0.05em" }}>PNG · JPG · WEBP · max 50MB</span>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    </div>
                )}

                {/* URL tab */}
                {tab === "url" && (
                    <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-1.5">
                            <label style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.6 }}>
                                Direct image URL
                            </label>
                            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://i.imgur.com/…" style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#8FAF8A"}
                                onBlur={(e) => e.target.style.borderColor = "rgba(143,175,138,0.25)"} />
                        </div>
                        {imageUrl.trim() && (
                            <div className="rounded overflow-hidden" style={{ border: "1px solid rgba(143,175,138,0.2)" }}>
                                <img src={imageUrl} alt="URL preview" className="w-full object-cover block" style={{ maxHeight: 140 }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            </div>
                        )}
                        <div className="flex items-start gap-2 rounded-md p-2.5" style={{ background: "rgba(200,222,197,0.12)", border: "1px solid rgba(143,175,138,0.15)" }}>
                            <Info size={12} style={{ color: "#8FAF8A", flexShrink: 0, marginTop: 1 }} />
                            <p style={{ fontSize: 10, color: "#8B7B6B", lineHeight: 1.6 }}>
                                Use direct links ending in .jpg/.png<br />
                                imgur, catbox, discord CDN work best
                            </p>
                        </div>
                    </div>
                )}

                {/* artist name */}
                <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.6 }}>
                        Artist name
                    </label>
                    <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)}
                        placeholder="your name or alias…" style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = "#8FAF8A"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(143,175,138,0.25)"} />
                </div>

                {/* social link */}
                <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.6 }}>
                        Social link
                    </label>
                    <input type="text" value={socialLink} onChange={(e) => setSocialLink(e.target.value)}
                        placeholder="twitter, instagram, pixiv…" style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = "#8FAF8A"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(143,175,138,0.25)"} />
                </div>

                {errorMsg && (
                    <p className="flex items-center gap-1.5 text-sm" style={{ color: "#E87A9A" }}>
                        <X size={12} /> {errorMsg}
                    </p>
                )}

                {/* submit */}
                <motion.button
                    onClick={handleSubmit} disabled={!canSubmit}
                    whileHover={canSubmit ? { opacity: 0.88, y: -1, boxShadow: "0 6px 18px rgba(74,107,69,0.22)" } : {}}
                    whileTap={canSubmit ? { scale: 0.98 } : {}}
                    className="w-full flex items-center justify-center gap-2 mt-1"
                    style={{
                        padding: "11px", border: "none", borderRadius: 6,
                        background: canSubmit ? "linear-gradient(135deg, #4A6B45, #8FAF8A)" : "rgba(143,175,138,0.2)",
                        color: canSubmit ? "white" : "rgba(143,175,138,0.5)",
                        cursor: canSubmit ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-cormorant), serif", fontSize: 15, fontStyle: "italic",
                    }}
                >
                    {status === "uploading" ? <><Loader2 size={15} className="animate-spin" /> Planting…</> :
                        status === "success" ? <><CheckCircle2 size={15} /> Planted!</> :
                            <><Sprout size={15} /> Place in the Pavilion</>}
                </motion.button>
            </div>

            {/* greenhouse arch deco */}
            <div className="px-5 pb-3" style={{ opacity: 0.13 }}>
                <svg viewBox="0 0 224 48" fill="none" width="100%">
                    <path d="M4 48 L4 22 Q4 4 24 4 L112 4 L200 4 Q220 4 220 22 L220 48" stroke="#4A6B45" strokeWidth="2" fill="none" />
                    <line x1="112" y1="4" x2="112" y2="48" stroke="#4A6B45" strokeWidth="1.5" />
                    <line x1="4" y1="28" x2="220" y2="28" stroke="#4A6B45" strokeWidth="1.2" />
                    <line x1="58" y1="13" x2="58" y2="48" stroke="#4A6B45" strokeWidth="0.8" />
                    <line x1="166" y1="13" x2="166" y2="48" stroke="#4A6B45" strokeWidth="0.8" />
                </svg>
            </div>

            {/* stats */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(143,175,138,0.12)" }}>
                <div>
                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24, fontWeight: 300, color: "#4A6B45", opacity: 0.4, lineHeight: 1 }}>{submissionCount}</div>
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#C9A98D", marginTop: 2 }}>pieces in bloom</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 24, fontWeight: 300, color: "#4A6B45", opacity: 0.4, lineHeight: 1 }}>{artistCount}</div>
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#C9A98D", marginTop: 2 }}>artists</div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* desktop sidebar — hidden on mobile */}
            <aside
                className="hidden md:flex fixed top-[48px] left-0 bottom-0 flex-col overflow-y-auto overflow-x-hidden"
                style={{ width: 280, zIndex: 100, background: "rgba(253,251,244,0.95)", borderRight: "1px solid rgba(143,175,138,0.18)" }}
            >
                {content}
            </aside>

            {/* mobile bottom sheet */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 md:hidden"
                            style={{ zIndex: 200, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
                            onClick={onMobileClose}
                        />
                        {/* sheet */}
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed left-0 right-0 bottom-0 flex flex-col overflow-y-auto md:hidden"
                            style={{
                                zIndex: 201, maxHeight: "90vh",
                                background: "rgba(253,251,244,0.98)",
                                borderRadius: "20px 20px 0 0",
                                borderTop: "1px solid rgba(143,175,138,0.2)",
                                boxShadow: "0 -8px 32px rgba(74,107,69,0.12)",
                            }}
                        >
                            {/* drag handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(143,175,138,0.35)" }} />
                            </div>
                            {content}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}