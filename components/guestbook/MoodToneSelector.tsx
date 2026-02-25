"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface ThemeOption {
    id: string;
    name: string;
    color: string;
}

interface MoodToneSelectorProps {
    themes: ThemeOption[];
    activeTheme: string;
    onThemeChange: (themeId: string) => void;
}

export function MoodToneSelector({ themes, activeTheme, onThemeChange }: MoodToneSelectorProps) {
    return (
        // ✨ กระดาษสีครีมขอบมนเรียบๆ สำหรับฝั่ง 20%
        <div className="w-full h-full bg-[#FFFDF9] rounded-2xl p-4 flex flex-col justify-center items-end gap-3 shadow-sm border border-solid border-[var(--theme-toolbar-border)]">

            <label className="text-xs font-serif uppercase tracking-widest text-[#4A3B32]/70 text-right w-full">
                Mood & Tone
            </label>

            {/* ✨ โค้ดปุ่มเลือกสีออริจินัลของแนร์เป๊ะๆ เลยค่ะ */}
            <div className="flex flex-wrap justify-end gap-3">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => onThemeChange(t.id)}
                        className={cn(
                            "w-8 h-8 rounded-full border-2 transition-transform",
                            activeTheme === t.id
                                ? "border-[#4A3B32]/30 shadow-md scale-110"
                                : "border-transparent opacity-60 hover:scale-105"
                        )}
                        style={{ backgroundColor: t.color }}
                        title={t.name}
                    />
                ))}
            </div>

        </div>
    );
}