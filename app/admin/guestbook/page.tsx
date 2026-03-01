"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, BookOpen } from "lucide-react";
import { useAdminEntries } from "./_components/useAdminEntries";
import { ListMode } from "./_components/ListMode";
import { StreamMode } from "./_components/StreamMode";
import { getTheme, bgPattern, ADMIN_STYLE_TAG } from "./_constants";

export default function AdminGuestbookPage() {
    const { entries, isLoading, error } = useAdminEntries();
    const [mode, setMode] = useState<"list" | "stream">("list");
    const [streamTheme, setStreamTheme] = useState("cream");

    const pageTheme = mode === "stream" ? getTheme(streamTheme) : getTheme("cream");

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF4]" style={bgPattern("230,215,189")}>
                <p className="font-serif text-[#4A3B32]/60 animate-pulse">กำลังเปิดสมุดบันทึก... 🌸</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF4]" style={bgPattern("230,215,189")}>
                <div className="flex flex-col items-center gap-4 text-center px-6">
                    <p className="text-2xl">🌧️</p>
                    <p className="font-serif text-[#4A3B32]">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 rounded-full border text-sm font-serif text-[#4A3B32] hover:bg-[#4A3B32]/5 transition-colors"
                        style={{ borderColor: "#C8956C40" }}
                    >
                        ลองใหม่อีกครั้ง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.main
            className="min-h-screen px-6 md:px-12"
            animate={{ backgroundColor: pageTheme.bg }}
            transition={{ duration: 0.7 }}
            style={bgPattern(pageTheme.patternRgb)}
        >
            <style dangerouslySetInnerHTML={{ __html: ADMIN_STYLE_TAG }} />

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-40 -mx-6 md:-mx-12 px-6 md:px-12 py-4 flex items-center justify-between"
                style={{ backgroundColor: "rgba(253,252,240,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(200,149,108,0.15)" }}
            >
                <div>
                    <h1 className="font-serif text-xl text-[#4A3B32]">🌿 The Secret Garden</h1>
                    <p className="text-xs text-[#4A3B32]/40" style={{ fontFamily: "Georgia, serif" }}>
                        Admin · {entries.length} รายการ
                    </p>
                </div>

                <div className="flex rounded-full p-1 gap-1" style={{ backgroundColor: "white", border: "1px solid rgba(200,149,108,0.25)" }}>
                    {(["list", "stream"] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
                            style={{ backgroundColor: mode === m ? "#C8956C" : "transparent", color: mode === m ? "white" : "#4A3B32", fontFamily: "Georgia, serif" }}
                        >
                            {m === "list" ? <LayoutGrid size={14} /> : <BookOpen size={14} />}
                            {m === "list" ? "รายการ" : "สตรีม"}
                        </button>
                    ))}
                </div>
            </motion.header>

            {/* Body */}
            <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="py-8"
            >
                {entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 opacity-40">
                        <p className="text-4xl">🌿</p>
                        <p className="font-serif text-[#4A3B32]">ยังไม่มีรายการในสมุด</p>
                    </div>
                ) : mode === "list" ? (
                    <ListMode entries={entries} />
                ) : (
                    <StreamMode entries={entries} onThemeChange={setStreamTheme} />
                )}
            </motion.div>
        </motion.main>
    );
}