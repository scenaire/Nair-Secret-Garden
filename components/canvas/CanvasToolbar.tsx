// components/canvas/CanvasToolbar.tsx
"use client";

import React from "react";
import { StampCard } from "@/components/ui/StampCard";
import { PALETTE, type PixelColor } from "@/lib/pixelEngine";
import type { Tool } from "./PixelCanvas";
import { motion } from "framer-motion";

interface CanvasToolbarProps {
    tool: Tool;
    color: PixelColor;
    brushSize: 1 | 2 | 4;
    onToolChange: (t: Tool) => void;
    onColorChange: (c: PixelColor) => void;
    onBrushChange: (s: 1 | 2 | 4) => void;
    onDownload: () => void;
    onlineUsers: string[];
    canDownload: boolean; // admin only
}

const TOOLS: { id: Tool; emoji: string; label: string }[] = [
    { id: "pencil", emoji: "✏️", label: "Pencil" },
    { id: "eraser", emoji: "🧹", label: "Eraser" },
    { id: "fill", emoji: "🪣", label: "Fill" },
    { id: "eyedropper", emoji: "💧", label: "Pick color" },
];

const BRUSH_SIZES: (1 | 2 | 4)[] = [1, 2, 4];

export function CanvasToolbar({
    tool, color, brushSize,
    onToolChange, onColorChange, onBrushChange,
    onDownload, onlineUsers, canDownload,
}: CanvasToolbarProps) {

    return (
        <div className="flex flex-col h-full gap-3 p-1">
            <StampCard bgColor="#FFFDF9" teethRadius={6} teethDensity={0.9} borderColor="rgba(180,140,120,0.2)">
                <div className="p-3 flex flex-col gap-1">
                    <p className="text-[9px] uppercase tracking-widest opacity-50 mb-1"
                        style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                        Tools
                    </p>
                    {TOOLS.map(t => (
                        <motion.button key={t.id}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onToolChange(t.id)}
                            title={t.label}
                            className="w-full h-8 rounded-lg flex items-center justify-center text-base transition-all"
                            style={{
                                backgroundColor: tool === t.id
                                    ? "rgba(244,201,212,0.6)"
                                    : "transparent",
                                boxShadow: tool === t.id
                                    ? "inset 0 1px 3px rgba(139,94,82,0.15)"
                                    : "none",
                            }}>
                            <span className="text-sm">{t.emoji}</span>
                            <span className="text-[10px]" style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                                {t.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </StampCard>

            {/* Brush sizes */}
            <StampCard bgColor="#FFFDF9" teethRadius={6} teethDensity={0.9} borderColor="rgba(180,140,120,0.2)">
                <div className="p-3 flex flex-col gap-1">
                    <p className="text-[9px] uppercase tracking-widest opacity-50 mb-1"
                        style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                        Size
                    </p>
                    {BRUSH_SIZES.map(s => (
                        <motion.button key={s}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onBrushChange(s)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                            style={{
                                backgroundColor: brushSize === s
                                    ? "rgba(244,201,212,0.6)"
                                    : "transparent",
                            }}>
                            <div className="rounded-sm"
                                style={{
                                    width: s === 1 ? 4 : s === 2 ? 8 : 14,
                                    height: s === 1 ? 4 : s === 2 ? 8 : 14,
                                    backgroundColor: "#8B5E52",
                                    opacity: brushSize === s ? 1 : 0.4,
                                }} />
                        </motion.button>
                    ))}
                </div>
            </StampCard>

            {/* Current color swatch */}
            <StampCard bgColor="#FFFDF9" teethRadius={6} teethDensity={0.9} borderColor="rgba(180,140,120,0.2)">
                <div className="p-3 flex flex-col gap-2 items-center">
                    <p className="text-[9px] uppercase tracking-widest opacity-50 self-start"
                        style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                        Color
                    </p>
                    <div className="w-9 h-9 rounded-lg border-2 border-white shadow-sm"
                        style={{ backgroundColor: color, boxShadow: "0 2px 8px rgba(139,94,82,0.2)" }} />
                    <input type="color" value={color} onChange={e => onColorChange(e.target.value)}
                        className="w-8 h-5 rounded cursor-pointer border-0 p-0 opacity-60"
                        title="Custom color" />
                </div>
            </StampCard>

            {/* Color palette */}
            <StampCard bgColor="#FFFDF9" teethRadius={6} teethDensity={0.9} borderColor="rgba(180,140,120,0.2)">
                <div className="p-3">
                    <p className="text-[9px] uppercase tracking-widest opacity-50 mb-2"
                        style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                        Palette
                    </p>
                    <div className="grid grid-cols-4 gap-0.5">
                        {PALETTE.map(c => (
                            <motion.button key={c}
                                whileHover={{ scale: 1.2, zIndex: 10 }} whileTap={{ scale: 0.9 }}
                                onClick={() => onColorChange(c)}
                                className="w-5 h-5 rounded-sm relative"
                                style={{
                                    backgroundColor: c,
                                    boxShadow: color === c
                                        ? "0 0 0 2px #8B5E52, 0 0 0 3px white"
                                        : "none",
                                    border: c === "#FFFFFF" ? "1px solid rgba(180,140,120,0.3)" : "none",
                                }}
                                title={c}
                            />
                        ))}
                    </div>
                </div>
            </StampCard>

            {/* Online users */}
            <StampCard bgColor="#FFFDF9" teethRadius={6} teethDensity={0.9} borderColor="rgba(180,140,120,0.2)">
                <div className="p-3">
                    <p className="text-[9px] uppercase tracking-widest opacity-50 mb-2"
                        style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                        Online · {onlineUsers.length}
                    </p>
                    <div className="flex flex-col gap-1">
                        {onlineUsers.slice(0, 5).map(u => (
                            <div key={u} className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                <span className="text-[10px] truncate"
                                    style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                                    {u}
                                </span>
                            </div>
                        ))}
                        {onlineUsers.length > 5 && (
                            <span className="text-[10px] opacity-50"
                                style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}>
                                +{onlineUsers.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            </StampCard>

            {/* Download (admin only) */}
            {canDownload && (
                <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={onDownload}
                    className="w-full py-2.5 rounded-xl text-xs font-bold"
                    style={{
                        fontFamily: "'Noto Sans', sans-serif",
                        backgroundColor: "#E6D7BD",
                        color: "#7A6147",
                    }}>
                    💾 Save Final
                </motion.button>
            )}
        </div>
    );
}