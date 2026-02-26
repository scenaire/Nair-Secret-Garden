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
        <div className="w-max h-full bg-[#FFFDF9] rounded-2xl p-4 flex flex-col justify-center items-end gap-3 shadow-sm border border-solid border-[var(--theme-toolbar-border)]">

            <label className="text-xs font-serif uppercase tracking-widest text-[#4A3B32]/70 text-right w-full">
                Mood & Tone
            </label>

            {/* ✨ flex-wrap จำกัดความกว้างให้พอดี 3 dot × 2 แถว */}
            <div className="flex flex-wrap gap-2 sm:w-[calc(3*1.5rem+2*0.5rem)]">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => onThemeChange(t.id)}
                        className={cn(
                            "w-6 h-6 rounded-full border-2 transition-transform",
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