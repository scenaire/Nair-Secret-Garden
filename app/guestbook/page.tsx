"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArchedFrame } from "@/components/ui/ArchedFrame";
import { ModernEditor } from "@/components/guestbook/editor/ModernEditor";
import { Sparkles } from "lucide-react";


// ✨ นำเข้า 2 คอมโพเนนต์ใหม่สไตล์ Visual Novel
import { ShoujoTopicPrompt } from "@/components/guestbook/ShoujoTopicPrompt";
import { MoodToneSelector } from "@/components/guestbook/MoodToneSelector";
import { GuestbookFooter } from "@/components/guestbook/GuestbookFooter";

// ✨ ดึง THEMES และคำถามมาใช้งาน
import { THEMES, ThemeKey, GUESTBOOK_QUESTIONS } from "@/components/guestbook/editor/constants";

export default function GuestbookPage() {
    const [activeTheme, setActiveTheme] = useState<ThemeKey>('cream');
    const [content, setContent] = useState('');
    const [questionIndex, setQuestionIndex] = useState(0);

    const currentTheme = THEMES[activeTheme];

    // ✨ แปลง THEMES ให้เป็นอาร์เรย์สำหรับส่งให้ MoodToneSelector
    const themeOptions = Object.entries(THEMES).map(([id, t]) => ({
        id: id,
        name: t.name,
        color: t.cssVars['--theme-icon']
    }));

    const handleShuffle = () => {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * GUESTBOOK_QUESTIONS.length);
        } while (nextIndex === questionIndex);
        setQuestionIndex(nextIndex);
    };

    const handlePromptSelect = (promptText: string) => {
        const htmlToInsert = `<h2>${promptText}</h2><p></p>`;
        if (!content || content === '<p></p>') {
            setContent(htmlToInsert);
        } else {
            setContent(content + htmlToInsert);
        }
    };

    return (
        <main
            className="min-h-screen px-6 md:px-12 relative transition-colors duration-1000 bg-[var(--theme-bg)]"
            style={currentTheme.cssVars as React.CSSProperties}
        >
            <div className="absolute top-20 left-10 text-black/5 animate-pulse"><Sparkles size={40} strokeWidth={1} /></div>
            <div className="absolute bottom-20 right-20 text-black/5 animate-bounce"><Sparkles size={30} strokeWidth={1} /></div>

            {/* Grid แบ่งซ้าย-ขวา */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 z-10">

                {/* 🖼️ คอลัมน์ซ้าย: Arched Frame */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="lg:sticky lg:top-0 lg:h-screen flex flex-col items-center justify-center py-16 lg:py-0 z-0"
                >
                    <ArchedFrame className="aspect-[3/4] w-full max-w-md bg-white p-3 border-2 border-white/60 shadow-xl rotate-[-2deg]">
                        <div className="w-full h-full border border-dashed border-[#8c8682]/40 rounded-t-[999px] rounded-b-xl overflow-hidden relative bg-[var(--theme-bg)]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTheme}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                >
                                    <img
                                        src={currentTheme.coverImage}
                                        alt=""
                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity"
                                    />
                                    <p className="font-serif text-3xl text-[var(--theme-text-body)]/90 italic z-10 drop-shadow-sm">
                                        "Dear Nair..."
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </ArchedFrame>

                    <div className="text-center space-y-2 mt-6">
                        <h2 className="font-serif text-2xl text-[var(--theme-text-body)]">The Secret Garden</h2>
                        <p className="text-sm text-[#8c8682] font-sans">A memory perfectly kept.</p>
                    </div>
                </motion.div>

                {/* 📝 คอลัมน์ขวา: สมุดจดและเครื่องมือ */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col gap-6 sm:gap-8 z-10 py-16 lg:py-24 w-full">

                    {/* ✨ กล่อง Wrapper ลายสก๊อต */}
                    <div
                        className="w-full rounded-2xl overflow-hidden relative shadow-sm border transition-colors duration-500"
                        style={{
                            backgroundColor: 'var(--theme-bg)',
                            borderColor: 'var(--theme-toolbar-border)'
                        }}
                    >
                        {/* 🏁 เลเยอร์ลายสก๊อต (ปรับ opacity ให้อ่อนลงนิดนึงจะได้ไม่แย่งซีน) */}
                        <div
                            className="absolute inset-0 opacity-30 transition-all duration-500"
                            style={{
                                backgroundImage: `repeating-linear-gradient(45deg, var(--theme-btn-bg) 25%, transparent 25%, transparent 75%, var(--theme-btn-bg) 75%, var(--theme-btn-bg)), repeating-linear-gradient(45deg, var(--theme-btn-bg) 25%, transparent 25%, transparent 75%, var(--theme-btn-bg) 75%, var(--theme-btn-bg))`,
                                backgroundPosition: `0 0, 10px 10px`,
                                backgroundSize: `20px 20px`
                            }}
                        />

                        {/* 📄 เลเยอร์เนื้อหา บังคับสัดส่วน 80:20 เป๊ะๆ */}
                        <div className="relative z-10 flex flex-row justify-between items-stretch p-4 w-full gap-4">

                            {/* ฝั่งซ้าย บังคับ 75% และไม่ขยายตามเนื้อหา */}
                            <div className="flex-1 min-w-0 flex">
                                <ShoujoTopicPrompt
                                    question={GUESTBOOK_QUESTIONS[questionIndex]}
                                    onShuffle={handleShuffle}
                                    onWrite={() => handlePromptSelect(GUESTBOOK_QUESTIONS[questionIndex].text)}
                                />
                            </div>

                            {/* ฝั่งขวา บังคับ 22% ดันชิดขวา และล็อคความกว้าง */}
                            <div className="flex-shrink-0 flex justify-end">
                                <MoodToneSelector
                                    themes={themeOptions}
                                    activeTheme={activeTheme}
                                    onThemeChange={(id) => setActiveTheme(id as ThemeKey)}
                                />
                            </div>

                        </div>
                    </div>

                    {/* สมุดจด Tiptap Editor */}
                    <div className="w-full">
                        <ModernEditor
                            content={content}
                            onChange={setContent}
                            paperColor={currentTheme.defaultPaper}
                        />
                    </div>

                    <GuestbookFooter
                        content={content}
                        redirectTo="/thank-you"
                    />

                </motion.div>
            </div>
        </main>
    );
}