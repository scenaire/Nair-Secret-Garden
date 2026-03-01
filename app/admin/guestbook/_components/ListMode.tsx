"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { GuestbookEntry } from "../_types";
import { EntryCard } from "./EntryCard";
import { EntryModal } from "./EntryModal";

type SortOrder = "newest" | "oldest";

const FONT = "var(--font-noto-sans-thai), 'Noto Sans Thai', sans-serif";

export function ListMode({ entries }: { entries: GuestbookEntry[] }) {
    const [selected, setSelected] = useState<GuestbookEntry | null>(null);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

    const filtered = entries
        .filter((e) => {
            const text = e.content.replace(/<[^>]+>/g, "").toLowerCase();
            const q = search.toLowerCase();
            return e.authorAlias.toLowerCase().includes(q) || text.includes(q);
        })
        .sort((a, b) => {
            const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return sortOrder === "newest" ? -diff : diff;
        });

    return (
        <div className="space-y-5" style={{ fontFamily: FONT }}>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center mb-6">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"
                        style={{ color: "#4A3B32" }}
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหาชื่อหรือเนื้อหา..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border bg-white/60 outline-none focus:ring-2 focus:ring-[#C8956C]"
                        style={{ borderColor: "#C8956C40", color: "#4A3B32", fontFamily: FONT }}
                    />
                </div>

                {/* Sort */}
                <div className="flex rounded-full p-0.5 gap-0.5 flex-shrink-0" style={{ backgroundColor: "white", border: "1px solid #C8956C40" }}>
                    {(["newest", "oldest"] as SortOrder[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSortOrder(s)}
                            className="px-4 py-1.5 text-xs rounded-full transition-all"
                            style={{
                                backgroundColor: sortOrder === s ? "#7A6147" : "transparent",
                                color: sortOrder === s ? "white" : "#4A3B32",
                                fontFamily: FONT,
                            }}
                        >
                            {s === "newest" ? "ใหม่สุด" : "เก่าสุด"}
                        </button>
                    ))}
                </div>

                <p className="text-xs opacity-40 flex-shrink-0" style={{ color: "#4A3B32" }}>
                    {filtered.length} รายการ
                </p>
            </div>

            {/* Grid — 3 columns */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 opacity-40" style={{ color: "#4A3B32", fontFamily: FONT }}>
                    ไม่พบรายการที่ค้นหา 🌿
                </div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.04 } } }}
                >
                    {filtered.map((entry) => (
                        <motion.div
                            key={entry.id}
                            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                        >
                            <EntryCard entry={entry} onClick={() => setSelected(entry)} />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <AnimatePresence>
                {selected && <EntryModal entry={selected} onClose={() => setSelected(null)} />}
            </AnimatePresence>
        </div>
    );
}