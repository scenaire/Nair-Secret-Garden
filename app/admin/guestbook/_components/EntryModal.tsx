"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { GuestbookEntry } from "../_types";
import { getTheme, getPaperBg, getPaperLinkColor, getTextureStyle } from "../_constants";

interface EntryModalProps {
    entry: GuestbookEntry;
    onClose: () => void;
}

const FONT = "var(--font-noto-sans-thai), 'Noto Sans Thai', sans-serif";

export function EntryModal({ entry, onClose }: EntryModalProps) {
    const t = getTheme(entry.theme);
    const paperBg = getPaperBg(entry.paperColor);
    const linkColor = getPaperLinkColor(entry.paperColor);
    const textureStyle = getTextureStyle(entry.paperTexture);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.93, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.93, y: 24 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative overflow-hidden shadow-2xl rounded-xl"
                style={{
                    width: entry.canvasWidth || 500,
                    maxWidth: "calc(100vw - 48px)",
                    maxHeight: "85vh",
                    border: `1px solid ${t.accent}80`,
                    backgroundColor: paperBg,
                    ...textureStyle,
                    ["--theme-text-link" as string]: linkColor,
                    ["--theme-text-body" as string]: "#4A3B32",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* header ชื่อ */}
                <div
                    className="flex items-center justify-between px-5 py-3 border-b"
                    style={{ backgroundColor: t.bg, borderColor: `${t.accent}50` }}
                >
                    <p className="text-sm font-semibold" style={{ color: t.accentText, fontFamily: FONT }}>
                        {entry.authorAlias}
                    </p>
                    <p className="text-xs opacity-40" style={{ color: "#4A3B32", fontFamily: FONT }}>
                        {new Date(entry.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                </div>

                {/* เนื้อหา — scroll ถ้าเกิน maxHeight */}
                <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 48px)" }}>
                    <div
                        className="tiptap p-8 pb-12 prose prose-sm max-w-none leading-[2.5rem] prose-blockquote:text-center prose-blockquote:border-l-0 prose-blockquote:bg-transparent prose-blockquote:before:content-none prose-blockquote:after:content-none prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:leading-relaxed prose-blockquote:border-y-2 prose-blockquote:border-solid prose-blockquote:py-8 prose-blockquote:my-10 prose-blockquote:px-6"
                        style={{ color: "#4A3B32", fontFamily: FONT }}
                        dangerouslySetInnerHTML={{ __html: entry.content || "<p></p>" }}
                    />
                </div>

                {/* ปุ่มปิด */}
                <button
                    onClick={onClose}
                    className="absolute top-2.5 right-3 w-7 h-7 rounded-full flex items-center justify-center z-50"
                    style={{ backgroundColor: paperBg, color: "#4A3B32", border: `1px solid ${t.accent}60` }}
                >
                    <X size={13} />
                </button>
            </motion.div>
        </motion.div>
    );
}