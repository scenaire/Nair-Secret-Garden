"use client";

// ✨ 1. อย่าลืมนำเข้า useEffect กลับมาด้วยนะคะ
import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArchedFrame } from "@/components/ui/ArchedFrame";
import { ModernEditor } from "@/components/guestbook/editor/ModernEditor";
import { Sparkles } from "lucide-react";

import { Navbar } from "@/components/layout/GardenNavbar";
import { useAuth } from "@/hooks/useAuth";
import { useLoadEntry } from "@/components/guestbook/editor/hooks/useLoadEntry";

import { ShoujoTopicPrompt } from "@/components/guestbook/ShoujoTopicPrompt";
import { MoodToneSelector } from "@/components/guestbook/MoodToneSelector";
import { GuestbookFooter } from "@/components/guestbook/GuestbookFooter";

import { MyGuestbookPage } from "@/components/guestbook/MyGuestbookPage";

import { THEMES, ThemeKey, GUESTBOOK_QUESTIONS } from "@/components/guestbook/editor/constants";

export default function GuestbookPage() {
    const { isLoggedIn, user, rawUser, loginWithTwitch, logout } = useAuth();


    // ✨ 2. ดึง hasEntry กับ savedData ออกมาจาก Hook ด้วยค่ะ
    const { isFetchingDB, hasEntry, savedData, error, retry } = useLoadEntry();

    // ✨ 3. สร้าง State ไว้สลับโหมด อ่าน/เขียน
    const [viewMode, setViewMode] = useState<'read' | 'edit'>('edit');

    const [activeTheme, setActiveTheme] = useState<ThemeKey>('cream');
    const [content, setContent] = useState('');
    const [questionIndex, setQuestionIndex] = useState(0);
    const [promptToInsert, setPromptToInsert] = useState<string | null>(null);

    const currentTheme = THEMES[activeTheme] || THEMES['cream'];

    const themeOptions = Object.entries(THEMES).map(([id, t]) => ({
        id: id,
        name: t.name,
        color: t.cssVars['--theme-icon']
    }));

    // ✨ 4. ถ้าโหลดมาเจอว่ามีข้อมูลเก่า ให้สลับไปโหมดอ่านอัตโนมัติ
    useEffect(() => {
        if (hasEntry && savedData) {
            setViewMode('read');
            if (savedData.theme) {
                setActiveTheme(savedData.theme as ThemeKey);
            }
        }
    }, [hasEntry, savedData]);

    const handleShuffle = () => {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * GUESTBOOK_QUESTIONS.length);
        } while (nextIndex === questionIndex);
        setQuestionIndex(nextIndex);
    };

    const handlePromptSelect = (promptText: string) => {
        setPromptToInsert(promptText);
    };

    const handlePromptInserted = useCallback(() => {
        setPromptToInsert(null);
    }, []);

    const handleThemeChange = useCallback((id: string) => {
        if (THEMES[id as ThemeKey]) setActiveTheme(id as ThemeKey);
    }, []);

    if (isFetchingDB) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0]">
                <p className="font-serif text-[#4A3B32]/60 animate-pulse">
                    กำลังค้นหาความทรงจำของคุณในสวนแห่งนี้... 🌸
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0]">
                <div className="flex flex-col items-center gap-4 text-center px-6">
                    <p className="font-serif text-lg text-[#4A3B32]">🌧️</p>
                    <p className="font-serif text-[#4A3B32]">{error}</p>
                    <button
                        onClick={retry}
                        className="mt-2 px-6 py-2 rounded-full border border-[#4A3B32]/30 bg-white text-sm font-sans text-[#4A3B32] hover:bg-[#4A3B32]/5 transition-colors"
                    >
                        ลองใหม่อีกครั้ง
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main
            className="min-h-screen px-6 md:px-12 relative transition-colors duration-1000 bg-[var(--theme-bg)]"
            style={{
                ...(currentTheme.cssVars as React.CSSProperties),
                backgroundColor: "var(--theme-bg)", // ✨ ใช้สีพื้นหลังตามตีม
                backgroundImage: `
                    linear-gradient(0deg, rgba(var(--theme-pattern-rgb), 0.18) 50%, transparent 50%),
                    linear-gradient(90deg, rgba(var(--theme-pattern-rgb), 0.18) 50%, transparent 50%),
                    repeating-linear-gradient(45deg, rgba(var(--theme-pattern-rgb), 0.22) 0px, rgba(var(--theme-pattern-rgb), 0.22) 2px, transparent 2px, transparent 6px)
                `,
                backgroundSize: "60px 60px", // ✨ กำหนดขนาดของตาราง (ถ้าอยากให้ช่องเล็กลง ลองเปลี่ยนเป็น 40px 40px ดูนะคะ)
                backgroundBlendMode: "normal"
            }}
        >
            <Navbar isLoggedIn={isLoggedIn} user={user} userId={rawUser?.id} onLogin={loginWithTwitch} onLogout={logout} />


            <div className="absolute top-20 left-10 text-black/5 animate-pulse"><Sparkles size={40} strokeWidth={1} /></div>
            <div className="absolute bottom-20 right-20 text-black/5 animate-bounce"><Sparkles size={30} strokeWidth={1} /></div>

            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-16 z-10">

                {/* 🖼️ คอลัมน์ซ้าย: Arched Frame (คงไว้เหมือนเดิมตลอด) */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
                    className="lg:sticky lg:top-0 lg:h-screen flex flex-col items-center justify-center pt-16 sm:py-16 lg:py-0 z-0"
                >
                    <ArchedFrame className="aspect-[3/4] w-full max-w-md bg-white p-3 border-2 border-white/60 shadow-xl rotate-[-2deg]">
                        <div className="w-full h-full border border-dashed border-[#8c8682]/40 rounded-t-[999px] rounded-b-xl overflow-hidden relative bg-[var(--theme-bg)]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTheme}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center"
                                >
                                    <img
                                        src={currentTheme.coverImage} alt=""
                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity"
                                    />

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
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col gap-6 sm:gap-8 z-10 pb-16 sm:py-16 lg:py-24 w-full">

                    {/* ✨ 5. จุดสลับโหมดอยู่ตรงนี้ค่ะ! ✨ */}
                    {viewMode === 'read' && savedData ? (
                        // 📖 โหมดอ่านสมุด
                        <MyGuestbookPage
                            data={savedData}
                            onEdit={() => setViewMode('edit')}
                        />
                    ) : (
                        // 📝 โหมดเขียน (โค้ดเก่าทั้งหมดเอามาใส่ไว้ในนี้ค่ะ)
                        <>
                            <div className="w-full rounded-2xl overflow-hidden relative shadow-sm border transition-colors duration-500" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-toolbar-border)' }}>
                                <div className="absolute inset-0 opacity-30 transition-all duration-500" style={{ backgroundImage: `repeating-linear-gradient(45deg, var(--theme-btn-bg) 25%, transparent 25%, transparent 75%, var(--theme-btn-bg) 75%, var(--theme-btn-bg)), repeating-linear-gradient(45deg, var(--theme-btn-bg) 25%, transparent 25%, transparent 75%, var(--theme-btn-bg) 75%, var(--theme-btn-bg))`, backgroundPosition: `0 0, 10px 10px`, backgroundSize: `20px 20px` }} />
                                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-stretch p-4 w-full gap-4">
                                    <div className="flex-1 min-w-0 flex">
                                        <ShoujoTopicPrompt question={GUESTBOOK_QUESTIONS[questionIndex]} onShuffle={handleShuffle} onWrite={() => handlePromptSelect(GUESTBOOK_QUESTIONS[questionIndex].text)} />
                                    </div>
                                    <div className="flex-shrink-0 flex justify-end">
                                        <MoodToneSelector themes={themeOptions} activeTheme={activeTheme} onThemeChange={(id) => setActiveTheme(id as ThemeKey)} />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full">
                                <ModernEditor content={content} onChange={setContent} paperColor={currentTheme.defaultPaper} theme={activeTheme} onThemeChange={handleThemeChange} insertPrompt={promptToInsert} onPromptInserted={handlePromptInserted} />
                            </div>

                            <GuestbookFooter content={content} redirectTo="/thank-you" />
                        </>
                    )}
                </motion.div>
            </div>
        </main>
    );
}