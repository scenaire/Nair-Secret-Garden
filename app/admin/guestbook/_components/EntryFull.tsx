"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GuestbookEntry } from "../_types";
import { getTheme, getPaperBg, getPaperLinkColor, getTextureStyle } from "../_constants";

interface EntryFullProps {
    entry: GuestbookEntry;
    showAuthor: boolean;
}

export function EntryFull({ entry, showAuthor }: EntryFullProps) {
    const t = getTheme(entry.theme);
    const paperBg = getPaperBg(entry.paperColor);
    const linkColor = getPaperLinkColor(entry.paperColor);
    const textureStyle = getTextureStyle(entry.paperTexture);

    const savedW = entry.canvasWidth || 308;
    const savedH = entry.canvasHeight || 500;

    const maxH = typeof window !== "undefined" ? window.innerHeight * 0.7 : 600;
    const paperHeight = Math.min(savedH, maxH);

    return (
        <div
            className="flex flex-col shadow-xl overflow-hidden"
            style={{
                width: savedW,
                height: paperHeight,
                backgroundColor: paperBg,
                ...textureStyle,
                position: "relative",
                ["--theme-text-link" as string]: linkColor,
            }}
        >
            {/* ชื่อผู้ส่ง */}
            <div
                className="flex-shrink-0 flex items-center justify-center py-3"
                style={{ backgroundColor: t.bg, borderBottom: `1px solid ${t.accent}60` }}
            >
                <AnimatePresence mode="wait">
                    {showAuthor ? (
                        <motion.p
                            key="author"
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25 }}
                            className="text-sm tracking-widest uppercase font-semibold"
                            style={{ color: t.accentText }}
                        >
                            {entry.authorAlias}
                        </motion.p>
                    ) : (
                        <motion.p
                            key="anon"
                            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25 }}
                            className="text-sm tracking-widest"
                            style={{ color: `${t.accentText}40` }}
                        >
                            · · ·
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* กระดาษ + scroll */}
            <div
                className="stream-paper relative flex-1 overflow-y-auto"
                style={{
                    ["--theme-text-body" as string]: "#4A3B32",
                    ["--theme-text-link" as string]: linkColor,
                }}
            >
                {/* Sticker layer */}
                <div className="absolute inset-0 pointer-events-none z-20" style={{ width: savedW, height: savedH }}>
                    {entry.stickers.map((s) => {
                        const widthPx = savedW * (s.widthPercent / 100);
                        const xPx = savedW * (s.xPercent / 100) - widthPx / 2;
                        const yPx = savedH * (s.yPercent / 100) - widthPx / 2;
                        return (
                            <div
                                key={s.id}
                                className="absolute select-none flex items-center justify-center"
                                style={{ left: xPx, top: yPx, width: widthPx, height: widthPx, transform: `rotate(${s.rotation}deg)` }}
                            >
                                <span style={{ fontSize: `${widthPx * 0.8}px`, lineHeight: 1 }}>{s.content}</span>
                            </div>
                        );
                    })}
                </div>

                {/* เนื้อหา HTML */}
                <div
                    className="tiptap relative z-10 p-8 pb-48 prose prose-sm max-w-none leading-[2.5rem] prose-blockquote:text-center prose-blockquote:border-l-0 prose-blockquote:bg-transparent prose-blockquote:before:content-none prose-blockquote:after:content-none prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:leading-relaxed prose-blockquote:border-y-2 prose-blockquote:border-solid prose-blockquote:py-8 prose-blockquote:my-10 prose-blockquote:px-6"
                    style={{ color: "#4A3B32", minHeight: savedH }}
                    dangerouslySetInnerHTML={{ __html: entry.content || "<p></p>" }}
                />
            </div>
        </div>
    );
}