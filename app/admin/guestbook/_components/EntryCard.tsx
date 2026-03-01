"use client";

import { motion } from "framer-motion";
import { GuestbookEntry } from "../_types";
import { getTheme, getPaperBg } from "../_constants";

interface EntryCardProps {
    entry: GuestbookEntry;
    onClick: () => void;
}

const FONT = "var(--font-noto-sans-thai), 'Noto Sans Thai', sans-serif";

export function EntryCard({ entry, onClick }: EntryCardProps) {
    const t = getTheme(entry.theme);
    const paperBg = getPaperBg(entry.paperColor);
    const preview = entry.content?.replace(/<[^>]+>/g, "").slice(0, 100) || "…";

    const date = new Date(entry.createdAt).toLocaleDateString("th-TH", {
        day: "numeric", month: "short", year: "2-digit",
    });

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-left w-full group"
            style={{ fontFamily: FONT }}
        >
            <div
                className="w-full overflow-hidden shadow-sm border rounded-lg transition-shadow group-hover:shadow-md"
                style={{ backgroundColor: paperBg, borderColor: `${t.accent}80` }}
            >
                {/* header ชื่อ + วันที่ */}
                <div
                    className="px-3 py-2 flex items-center justify-between border-b"
                    style={{ backgroundColor: t.bg, borderColor: `${t.accent}50` }}
                >
                    <p className="text-xs font-semibold truncate" style={{ color: t.accentText }}>
                        {entry.authorAlias}
                    </p>
                    <p className="text-[10px] opacity-40 flex-shrink-0 ml-2" style={{ color: "#4A3B32" }}>
                        {date}
                    </p>
                </div>
                {/* preview เนื้อหา */}
                <div className="px-3 py-3">
                    <p className="text-xs leading-relaxed line-clamp-4 opacity-70" style={{ color: "#4A3B32" }}>
                        {preview}
                    </p>
                </div>
            </div>
        </motion.button>
    );
}