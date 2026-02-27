// components/canvas/CanvasToolbar/CanvasToolbar.tsx
"use client";

import React, { memo, useState, useRef, useCallback } from "react";
import { Pencil, Eraser, PaintBucket, Pipette, Download } from "lucide-react";
import { PALETTE, type PixelColor } from "@/lib/pixelEngine";
import type { Tool } from "../PixelCanvas";
import { motion, AnimatePresence } from "framer-motion";

export type { Tool };
export type BrushSize = 1 | 2 | 5;

export interface CanvasToolbarProps {
    tool: Tool;
    color: PixelColor;
    brushSize: number;
    onToolChange: (tool: Tool) => void;
    onColorChange: (color: PixelColor) => void;
    onBrushChange: (size: number) => void;
    onDownload: () => void;

    onlineUsers: { name: string; avatar?: string }[];
    drawingUsers?: string[]; // ชื่อของคนที่กำลังวาด

    canDownload: boolean;
    recentColors?: PixelColor[];
}

// ✨ Full botanical palette
const FULL_PALETTE: PixelColor[] = [
    // Row 1 – Pink → Warm
    '#EE7EA0', '#FFA9BA', '#FFD7D6', '#EA7D70', '#F69F95', '#FFAF6E',

    // Row 2 – Peach → Yellow → Soft Green
    '#FFCC80', '#FFE2A6', '#BCC07B', '#DBE098', '#D5E2D3', '#ABCDDE',

    // Row 3 – Blue → Lavender
    '#7D8BE0', '#B5BEF5', '#D5EDF8', '#9A81B0', '#CDBDEB', '#8E715B',

    // Row 4 – Brown → Cream → Base
    '#C9A98D', '#E5DACA', '#F1ECEA', '#E1CFCA', '#B19F9A', '#4F3F3E',

    // Row 5 – Neutrals / Grayscale
    '#FFFFFF', '#CCCCCC', '#999999', '#666666', '#333333', '#000000',
];

const TOOL_CONFIG: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "pencil", icon: <Pencil size={16} strokeWidth={1.8} />, label: "Pencil" },
    { id: "eraser", icon: <Eraser size={16} strokeWidth={1.8} />, label: "Eraser" },
    { id: "fill", icon: <PaintBucket size={16} strokeWidth={1.8} />, label: "Fill" },
    { id: "eyedropper", icon: <Pipette size={16} strokeWidth={1.8} />, label: "Pick Color" },
];

const PRESET_SIZES: { size: BrushSize; label: string }[] = [
    { size: 1, label: "1px" },
    { size: 2, label: "2px" },
    { size: 5, label: "5px" },
];

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

const Divider = () => (
    <div className="w-full h-px my-1" style={{ backgroundColor: "rgba(196,168,130,0.18)" }} />
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[9px] uppercase tracking-[0.2em] mb-2 px-0.5"
        style={{ color: "rgba(139,94,82,0.45)", fontFamily: "var(--font-noto-sans-thai), sans-serif" }}>
        {children}
    </p>
);

const ToolButton = memo(function ToolButton({
    active, icon, label, onClick,
}: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onClick}
            title={label}
            type="button"
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
                backgroundColor: active ? "rgba(242,198,194,0.55)" : "rgba(253,251,244,0.5)",
                color: active ? "#8B4559" : "rgba(74,59,50,0.55)",
                boxShadow: active
                    ? "inset 0 1px 3px rgba(139,69,89,0.15), 0 1px 0 rgba(255,255,255,0.9)"
                    : "inset 0 1px 0 rgba(255,255,255,0.7)",
                border: active ? "1px solid rgba(242,198,194,0.6)" : "1px solid rgba(196,168,130,0.2)",
            }}
        >
            {active && (
                <motion.span
                    layoutId="tool-pip"
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#E87A9A" }}
                />
            )}
            {icon}
        </motion.button>
    );
});

const ColorSwatch = memo(function ColorSwatch({
    color, active, onClick,
}: { color: PixelColor; active: boolean; onClick: () => void }) {
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="rounded-md border transition-all"
            style={{
                backgroundColor: color,
                width: 18, height: 18,
                borderColor: active ? "#8B5E52" : "rgba(0,0,0,0.08)",
                boxShadow: active ? `0 0 0 2px rgba(253,251,244,0.95), 0 0 0 3px #8B5E52` : "none",
                transform: active ? "scale(1.15)" : "scale(1)",
            }}
            aria-label={color}
        />
    );
});



// ────────────────────────────────────────────────────────────
// Main CanvasToolbar
// ────────────────────────────────────────────────────────────
export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
    tool,
    color,
    brushSize,
    onToolChange,
    onBrushChange,
    onColorChange,
    onDownload,
    onlineUsers,
    drawingUsers = [],    // ✨ default []
    canDownload,
    recentColors = [],
}) => {
    const colorInputRef = useRef<HTMLInputElement>(null);

    const handleColorSelect = useCallback((c: PixelColor) => {
        onColorChange(c);
    }, [onColorChange]);

    const showBrush = tool === "pencil" || tool === "eraser";

    return (
        <div
            className="flex flex-col gap-3 py-4 px-3 select-none"
            style={{ fontFamily: "var(--font-noto-sans-thai), sans-serif" }}
        >
            {/* ── TOOLS ── */}
            <section>
                <SectionLabel>Tools</SectionLabel>
                <div className="grid grid-cols-4 gap-1.5">
                    {TOOL_CONFIG.map(({ id, icon, label }) => (
                        <ToolButton
                            key={id}
                            active={tool === id}
                            icon={icon}
                            label={label}
                            onClick={() => onToolChange(id)}
                        />
                    ))}
                </div>
            </section>

            <Divider />

            {/* ── BRUSH SIZE (pencil/eraser only) ── */}
            <AnimatePresence>
                {showBrush && (
                    <motion.section
                        key="brush"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden" }}
                    >
                        <SectionLabel>Size — {brushSize}px</SectionLabel>

                        {/* Preset buttons */}
                        <div className="flex gap-1.5 mb-2.5">
                            {PRESET_SIZES.map(({ size, label }) => (
                                <motion.button
                                    key={size}
                                    type="button"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onBrushChange(size)}
                                    className="flex-1 py-1 rounded-lg text-[10px] font-bold transition-all"
                                    style={{
                                        backgroundColor: brushSize === size
                                            ? "rgba(242,198,194,0.55)"
                                            : "rgba(253,251,244,0.5)",
                                        color: brushSize === size ? "#8B4559" : "rgba(74,59,50,0.5)",
                                        border: brushSize === size
                                            ? "1px solid rgba(242,198,194,0.6)"
                                            : "1px solid rgba(196,168,130,0.2)",
                                    }}
                                >
                                    {label}
                                </motion.button>
                            ))}
                        </div>

                        {/* Slider 1–10 */}
                        <div className="relative px-0.5">
                            <input
                                type="range"
                                min={1}
                                max={10}
                                step={1}
                                value={brushSize}
                                onChange={(e) => onBrushChange(Number(e.target.value))}
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                style={{
                                    accentColor: "#E87A9A",
                                    background: `linear-gradient(to right, #E87A9A ${(brushSize - 1) / 9 * 100}%, rgba(196,168,130,0.25) ${(brushSize - 1) / 9 * 100}%)`,
                                }}
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-[8px]" style={{ color: "rgba(139,94,82,0.35)" }}>1</span>
                                <span className="text-[8px]" style={{ color: "rgba(139,94,82,0.35)" }}>10</span>
                            </div>
                        </div>

                        <Divider />
                    </motion.section>
                )}
            </AnimatePresence>

            {/* ── COLOR ── */}
            <section className="relative">
                <SectionLabel>Color</SectionLabel>

                {/* Current color — คลิกสี → native color picker เปิดทันที */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="w-10 h-10 rounded-xl border cursor-pointer"
                            style={{
                                backgroundColor: color,
                                borderColor: "rgba(74,59,50,0.15)",
                                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5), 0 4px 10px rgba(0,0,0,0.06)",
                            }}
                            onClick={() => colorInputRef.current?.click()}
                        />
                        {/* ✨ hidden native input — กด swatch ด้านบนแล้ว trigger มา */}
                        <input
                            ref={colorInputRef}
                            type="color"
                            value={color}
                            onChange={(e) => handleColorSelect(e.target.value as PixelColor)}
                            className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                            tabIndex={-1}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-[0.15em]"
                            style={{ color: "rgba(139,94,82,0.45)" }}>Current</span>
                        <span className="text-[10px] font-mono" style={{ color: "#8B5E52" }}>{color}</span>
                        <span className="text-[9px]" style={{ color: "rgba(139,94,82,0.4)" }}>
                            tap to customize
                        </span>
                    </div>
                </div>

                {/* Recent colors */}
                {recentColors.length > 0 && (
                    <>
                        <p className="text-[9px] uppercase tracking-[0.2em] mb-1.5"
                            style={{ color: "rgba(139,94,82,0.45)" }}>Recent</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {recentColors.map((c) => (
                                <ColorSwatch key={c} color={c} active={color === c} onClick={() => handleColorSelect(c)} />
                            ))}
                        </div>
                        <Divider />
                    </>
                )}

                {/* Full palette */}
                <p className="text-[9px] uppercase tracking-[0.2em] mb-1.5 mt-2"
                    style={{ color: "rgba(139,94,82,0.45)" }}>Palette</p>
                <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
                    {FULL_PALETTE.map((c) => (
                        <ColorSwatch key={c} color={c} active={color === c} onClick={() => handleColorSelect(c)} />
                    ))}
                </div>
            </section>

            <Divider />

            {/* ── ONLINE USERS ── */}
            {onlineUsers.length > 0 && (
                <section className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: "#7CB972" }}
                            />
                            <span
                                className="text-[10px] font-semibold"
                                style={{ color: "rgba(139,94,82,0.75)" }}
                            >
                                Guests in the garden
                            </span>
                        </div>
                        <span
                            className="text-[10px]"
                            style={{ color: "rgba(139,94,82,0.6)" }}
                        >
                            {onlineUsers.length}
                        </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-3">
                        {onlineUsers.map((user, index) => {
                            const isDrawing = drawingUsers.includes(user.name);
                            const initial = user.name.trim().charAt(0).toUpperCase() || "?";
                            const key = `${user.name}-${index}`;

                            return (
                                <div
                                    key={key}
                                    className="flex flex-col items-center gap-0.5 min-w-[40px]"
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm bg-white overflow-hidden"
                                        style={{
                                            borderColor: isDrawing ? "#E87A9A" : "#7CB972",
                                            boxShadow: isDrawing
                                                ? "0 0 0 2px rgba(232,122,154,0.35)"
                                                : "0 0 0 1px rgba(124,185,114,0.25)",
                                        }}
                                    >
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <span
                                                className="text-[11px] font-semibold"
                                                style={{ color: "rgba(74,59,50,0.9)" }}
                                            >
                                                {initial}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className="text-[9px] max-w-[60px] truncate text-center"
                                        style={{ color: "rgba(139,94,82,0.8)" }}
                                        title={user.name}
                                    >
                                        {user.name}
                                    </span>
                                    {isDrawing && (
                                        <span
                                            className="text-[9px] text-[rgba(232,122,154,0.95)] animate-pulse"
                                        >
                                            drawing…
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── DOWNLOAD ── */}
            {canDownload && (
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(139,94,82,0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onDownload}
                    type="button"
                    className="w-full h-9 rounded-full flex items-center justify-center gap-2"
                    style={{
                        background: "linear-gradient(135deg, rgba(242,198,194,0.7) 0%, rgba(213,237,248,0.7) 100%)",
                        border: "1px solid rgba(242,198,194,0.5)",
                        color: "#6B4C43",
                    }}
                >
                    <Download size={13} strokeWidth={2} />
                    <span className="text-[11px] font-semibold tracking-wide"
                        style={{ fontFamily: "var(--font-noto-sans-thai), sans-serif" }}>
                        Save Canvas
                    </span>
                </motion.button>
            )}
        </div>
    );
};

export default CanvasToolbar;