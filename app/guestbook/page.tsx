// app/guestbook/page.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoftButton } from "@/components/ui/SoftButton";
import { ArchedFrame } from "@/components/ui/ArchedFrame";
import { ModernEditor } from "@/components/guestbook/editor/ModernEditor";
import { Sparkles, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

// 🎨 กำหนดข้อมูล Theme ทั้งหมดของหน้าเว็บ (รวบจบในจุดเดียว)
const themes = {
    cream: {
        id: "cream",
        name: "Vanilla Cream",
        pageBg: "bg-[#FDFCF0]", // สีพื้นหลังหน้าเว็บ
        btnColor: "bg-[#E8DCC4] text-[#4A3B32]", // สีปุ่มกด
        imgPlaceholder: "bg-gradient-to-b from-[#FFFDF9] to-[#E8DCC4]" // สีรอใส่รูปจริง
    },
    blush: {
        id: "blush",
        name: "Rose Blush",
        pageBg: "bg-[#FFF5F5]",
        btnColor: "bg-[#F2C6C2] text-[#4A3B32]",
        imgPlaceholder: "bg-gradient-to-b from-[#FFF0F0] to-[#F2C6C2]"
    },
    sky: {
        id: "sky",
        name: "Sky Wash",
        pageBg: "bg-[#F0F9FF]",
        btnColor: "bg-[#BCD7E6] text-[#4A3B32]",
        imgPlaceholder: "bg-gradient-to-b from-[#F0F7FA] to-[#BCD7E6]"
    }
} as const;

type ThemeKey = keyof typeof themes;

export default function GuestbookPage() {
    const [activeTheme, setActiveTheme] = useState<ThemeKey>('cream');
    const [activePrompt, setActivePrompt] = useState('how_we_met');
    const [content, setContent] = useState('');

    const currentTheme = themes[activeTheme];

    const prompts = [
        { id: "how_we_met", text: "เรารู้จักกันได้อย่างไร?" },
        { id: "impression", text: "ประทับใจอะไรในตัวฉัน?" },
        { id: "birthday_wish", text: "อวยพรวันเกิด!" },
    ];

    return (
        // ✨ 1. พื้นหลังเว็บเปลี่ยนสีตาม Theme แบบนุ่มนวล
        <main className={cn("min-h-screen py-16 px-6 md:px-12 flex items-center justify-center relative overflow-hidden transition-colors duration-1000", currentTheme.pageBg)}>

            {/* ประกายดาวตกแต่ง */}
            <div className="absolute top-20 left-10 text-black/5 animate-pulse"><Sparkles size={40} strokeWidth={1} /></div>
            <div className="absolute bottom-20 right-20 text-black/5 animate-bounce"><Sparkles size={30} strokeWidth={1} /></div>

            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 items-start z-10">

                {/* 🖼️ คอลัมน์ซ้าย: Arched Frame (Sync รูปตาม Theme) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6 flex flex-col items-center sticky top-16">
                    <ArchedFrame className="aspect-[3/4] w-full max-w-md bg-white p-3 border-2 border-white/60 shadow-xl rotate-[-2deg]">
                        {/* กรอบด้านใน */}
                        <div className="w-full h-full border border-dashed border-[#8c8682]/40 rounded-t-[999px] rounded-b-xl overflow-hidden relative">

                            {/* 🔄 ระบบเปลี่ยนรูปภาพ/สี ตาม Theme แบบ Crossfade */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTheme}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className={cn("absolute inset-0 flex flex-col items-center justify-center", currentTheme.imgPlaceholder)}
                                >
                                    {/* 💡 Note: เดี๋ยวคุณ Nair เอาแท็ก <img src="..." /> มาใส่แทนตรงนี้ได้เลยค่ะ! */}
                                    <p className="font-serif text-3xl text-[#4A3B32]/70 italic z-10">"Dear Nair..."</p>
                                </motion.div>
                            </AnimatePresence>

                        </div>
                    </ArchedFrame>

                    <div className="text-center space-y-2">
                        <h2 className="font-serif text-2xl text-[#4A3B32]">The Secret Garden</h2>
                        <p className="text-sm text-[#8c8682] font-sans">A memory perfectly kept.</p>
                    </div>
                </motion.div>

                {/* 📝 คอลัมน์ขวา: สมุดจดและเครื่องมือ */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col gap-8">

                    <div className="flex flex-wrap gap-6 items-center justify-between bg-white/40 p-4 rounded-2xl border border-white/60 backdrop-blur-md shadow-sm">

                        {/* กล่องเลือกคำถาม */}
                        <div className="space-y-2">
                            <label className="text-xs font-serif uppercase tracking-widest text-[#4A3B32]/70 flex items-center gap-2">
                                <PenTool size={14} /> Topic
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {prompts.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => setActivePrompt(p.id)}
                                        className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 ${activePrompt === p.id
                                            ? cn(currentTheme.btnColor, "shadow-md scale-105")
                                            : "bg-white/50 text-[#4A3B32]/70 hover:bg-white"
                                            }`}
                                    >
                                        {p.text}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* แถบสี (Theme Selector) */}
                        <div className="space-y-2">
                            <label className="text-xs font-serif uppercase tracking-widest text-[#4A3B32]/70">Mood & Tone</label>
                            <div className="flex gap-3">
                                {Object.values(themes).map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveTheme(t.id as ThemeKey)}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform ${activeTheme === t.id ? "border-white shadow-md scale-110" : "border-transparent opacity-60 hover:scale-105"
                                            }`}
                                        style={{ backgroundColor: t.id === 'cream' ? '#E8DCC4' : t.id === 'blush' ? '#F2C6C2' : '#BCD7E6' }}
                                        title={t.name}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* 📓 สมุดบันทึก GoodNotes Style */}
                    <div className="w-full">
                        <ModernEditor
                            content={content}
                            onChange={setContent}
                            paperColor={activeTheme}
                        />
                    </div>

                </motion.div>
            </div>
        </main>
    );
}