"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from './editor/types';
import { MOOD_STYLES } from './editor/constants';
import { cn } from "@/lib/utils";
import { StampCard } from "@/components/ui/StampCard";


interface ShoujoTopicPromptProps {
    question: Question;
    onShuffle: () => void;
    onWrite: () => void;
}

export function ShoujoTopicPrompt({ question, onShuffle, onWrite }: ShoujoTopicPromptProps) {
    const currentMood = MOOD_STYLES[question.mood] || MOOD_STYLES.shy;

    return (
        <StampCard
            bgColor="#FFFDF9"
            teethRadius={8}
            teethDensity={1.0}
            borderColor="rgba(74,59,50,0.18)"
            className="flex-1"
        >
            {/* เพิ่ม padding ตรงนี้ จาก p-5 → p-6 หรือมากกว่า */}
            <div className="w-full flex items-center gap-4">

                {/* 🖼️ Chibi: ใช้ h-full + aspect-square เพื่อให้สูงเท่าเนื้อหาเป๊ะๆ และเป็นจัตุรัสเสมอ */}
                <div className={cn(
                    "w-14 h-14 flex-shrink-0 rounded-xl aspect-square flex-shrink-0 rounded-xl flex items-center justify-center text-3xl transition-colors duration-500",
                    "border border-[var(--theme-toolbar-border)]", // เปลี่ยนจาก border-white/50 เป็นตัวแปรตามธีม
                    "shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]",   // ปรับ shadow-inner ให้เบาบางลงมาก ๆ
                    currentMood.bg
                )}>
                    {currentMood.emoji}
                </div>

                {/* 📝 Topic & Prompt */}
                <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                    <div>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest opacity-60 font-serif text-[#4A3B32]">
                            Topic
                        </span>

                        <div className="min-h-[2.5rem] flex items-center mt-1 mb-2 w-full">
                            <AnimatePresence mode="wait">
                                <motion.h2
                                    key={question.text}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    // ✨ ใช้ฟอนต์ Noto Serif Thai ตามที่แนร์ต้องการ
                                    className="font-noto-serif text-base leading-snug line-clamp-2 text-[var(--theme-accent-text)] font-medium"
                                >
                                    '{question.text}'
                                </motion.h2>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* 🔘 Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onWrite}
                            className="text-xs bg-[var(--theme-btn-bg)] text-[var(--theme-accent-text)] px-4 py-1.5 rounded-full hover:scale-105 hover:shadow-md transition-all shadow-sm font-medium flex items-center"
                        >
                            Write this one
                        </button>
                        <button
                            onClick={onShuffle}
                            className="text-xs bg-[#4A3B32]/5 text-[#4A3B32] hover:bg-[#4A3B32]/10 px-4 py-1.5 rounded-full transition-all flex items-center"
                        >
                            Try another
                        </button>
                    </div>

                </div>
            </div>
        </StampCard>
    );
}