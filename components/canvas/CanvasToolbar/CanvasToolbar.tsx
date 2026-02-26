// components/canvas/CanvasToolbar.tsx
"use client";

import React, { memo } from "react";
import { Pencil, Eraser, PaintBucket, Pipette, Download } from "lucide-react";
import { PALETTE, type PixelColor } from "@/lib/pixelEngine";
import type { Tool } from "../PixelCanvas";
import { motion } from "framer-motion";

export type { Tool };

export type BrushSize = 1 | 2 | 4;

export interface CanvasToolbarProps {
    tool: Tool;
    color: PixelColor;
    brushSize: BrushSize;
    onToolChange: (tool: Tool) => void;
    onColorChange: (color: PixelColor) => void;
    onBrushChange: (size: BrushSize) => void;
    onDownload: () => void;
    onlineUsers: string[];
    canDownload: boolean;
}

/**
 * Internal config
 */
const TOOL_CONFIG: { id: Tool; label: string; icon: React.ReactNode }[] = [
    { id: "pencil", icon: <Pencil size={15} />, label: "Pen" },
    { id: "eraser", icon: <Eraser size={15} />, label: "Eraser" },
    { id: "fill", icon: <PaintBucket size={15} />, label: "Fill" },
    { id: "eyedropper", icon: <Pipette size={15} />, label: "Pick" },
];

const BRUSH_SIZES: { size: BrushSize; dot: number; label: string }[] = [
    { size: 1, dot: 4, label: "Fine" },
    { size: 2, dot: 8, label: "Medium" },
    { size: 4, dot: 13, label: "Bold" },
];

// limit palette to a curated subset so the board feels cohesive
const CURATED_PALETTE: PixelColor[] = (PALETTE as PixelColor[]).slice(0, 12);

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

/**
 * Decorative "paper" section wrapper used inside the toolbar.
 */
const Section: React.FC<SectionProps> = ({ title, children }) => {
    return (
        <section className="flex flex-col gap-2">
            <p
                className="text-[9px] uppercase tracking-[0.18em] font-bold px-1"
                style={{ color: "rgba(139,94,82,0.55)", fontFamily: "'Noto Sans', sans-serif" }}
            >
                {title}
            </p>
            {children}
            <div
                className="mt-1 h-px mx-1"
                style={{ backgroundColor: "rgba(196,168,130,0.18)" }}
            />
        </section>
    );
};

/**
 * Individual tool button (Pen, Eraser, etc)
 */
interface ToolButtonProps {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

const ToolButton = memo(function ToolButton(props: ToolButtonProps) {
    const { active, icon, label, onClick } = props;

    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="relative flex-1 h-9 rounded-xl flex items-center gap-2.5 px-3 text-left transition-all"
            style={{
                backgroundColor: active ? "rgba(244,201,212,0.45)" : "transparent",
                color: "#8B5E52",
            }}
            type="button"
        >
            {active && (
                <span
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                    style={{ backgroundColor: "#E42E57" }}
                />
            )}
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/80 shadow-sm">
                {icon}
            </span>
            <span
                className="text-[11px] tracking-wide"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
            >
                {label}
            </span>
        </motion.button>
    );
});

interface BrushButtonProps {
    active: boolean;
    dotSize: number;
    label: string;
    onClick: () => void;
}

const BrushButton = memo(function BrushButton(props: BrushButtonProps) {
    const { active, dotSize, label, onClick } = props;

    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className="w-full h-9 rounded-xl flex items-center gap-3 px-3 transition-all"
            style={{
                backgroundColor: active ? "rgba(244,201,212,0.45)" : "transparent",
                color: "#8B5E52",
            }}
            type="button"
        >
            <span className="w-6 h-6 rounded-full bg-white/85 flex items-center justify-center">
                <span
                    className="rounded-full"
                    style={{
                        width: dotSize,
                        height: dotSize,
                        backgroundColor: "#8B5E52",
                    }}
                />
            </span>
            <span
                className="text-[11px]"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
            >
                {label}
            </span>
        </motion.button>
    );
});

interface ColorSwatchProps {
    color: PixelColor;
    active: boolean;
    onClick: () => void;
}

const ColorSwatch = memo(function ColorSwatch(props: ColorSwatchProps) {
    const { color, active, onClick } = props;

    return (
        <button
            type="button"
            onClick={onClick}
            className="w-5 h-5 rounded-full border transition-transform"
            style={{
                backgroundColor: color,
                borderColor: active ? "rgba(74,59,50,0.7)" : "rgba(0,0,0,0.06)",
                transform: active ? "scale(1.15)" : "scale(1)",
                boxShadow: active ? "0 0 0 1px rgba(253,251,244,0.9)" : "none",
            }}
            aria-label={`Select color ${color}`}
        />
    );
});

const OnlineUsersBadge: React.FC<{ onlineUsers: string[] }> = ({ onlineUsers }) => {
    if (!onlineUsers.length) return null;

    const count = onlineUsers.length;
    const label = count === 1 ? "guest" : "guests";

    return (
        <div className="mt-2 px-2 py-1 rounded-full inline-flex items-center gap-1.5 bg-white/70 shadow-sm">
            <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#7CB972" }}
            />
            <span
                className="text-[10px]"
                style={{ fontFamily: "'Noto Sans', sans-serif", color: "#8B5E52" }}
            >
                {count} {label} in the garden
            </span>
        </div>
    );
};

/**
 * Main toolbar component.
 * Visually designed as a cute stationery card pinned next to the guestbook canvas.
 */
export const CanvasToolbar: React.FC<CanvasToolbarProps> = (props) => {
    const {
        tool,
        color,
        brushSize,
        onToolChange,
        onBrushChange,
        onColorChange,
        onDownload,
        onlineUsers,
        canDownload,
    } = props;

    return (
        <aside
            className="relative flex flex-col gap-4 p-4 rounded-2xl w-[240px] min-w-[240px]"
            style={{
                backgroundColor: "#FFFDF9",
                boxShadow: "0 10px 30px rgba(139,94,82,0.18)",
                border: "1px solid rgba(139,94,82,0.14)",
            }}
        >
            {/* decorative tape */}
            <div
                className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2"
                style={{
                    width: 60,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: "#FFE4B5",
                    opacity: 0.6,
                    transform: "translateX(-50%) rotate(-3deg)",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
                }}
            />

            {/* header */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex flex-col">
                    <span
                        className="text-[10px] uppercase tracking-[0.22em]"
                        style={{ fontFamily: "'Noto Sans', sans-serif", color: "rgba(139,94,82,0.7)" }}
                    >
                        Picnic Tools
                    </span>
                    <span
                        className="text-[11px]"
                        style={{ fontFamily: "'Noto Serif', serif", color: "#8B5E52" }}
                    >
                        Write your wish 💌
                    </span>
                </div>
            </div>

            {/* tools */}
            <Section title="Write With">
                <div className="grid grid-cols-2 gap-1.5">
                    {TOOL_CONFIG.map(({ id, label, icon }) => (
                        <ToolButton
                            key={id}
                            active={tool === id}
                            icon={icon}
                            label={label}
                            onClick={() => onToolChange(id)}
                        />
                    ))}
                </div>
            </Section>

            {/* brush size */}
            <Section title="Brush">
                <div className="flex flex-col gap-0.5">
                    {BRUSH_SIZES.map(({ size, dot, label }) => (
                        <BrushButton
                            key={size}
                            active={brushSize === size}
                            dotSize={dot}
                            label={label}
                            onClick={() => onBrushChange(size)}
                        />
                    ))}
                </div>
            </Section>

            {/* color */}
            <Section title="Color">
                <div className="flex flex-col gap-2">
                    {/* current color card */}
                    <div className="flex items-center gap-2">
                        <div
                            className="w-10 h-10 rounded-xl shadow-inner border"
                            style={{
                                backgroundColor: color,
                                borderColor: "rgba(74,59,50,0.2)",
                                boxShadow:
                                    "inset 0 0 0 1px rgba(253,251,244,0.6), 0 4px 10px rgba(0,0,0,0.06)",
                            }}
                        />
                        <div className="flex flex-col">
                            <span
                                className="text-[10px] uppercase tracking-[0.14em]"
                                style={{
                                    fontFamily: "'Noto Sans', sans-serif",
                                    color: "rgba(139,94,82,0.7)",
                                }}
                            >
                                Current
                            </span>
                            <span
                                className="text-[11px]"
                                style={{
                                    fontFamily: "'Noto Serif', serif",
                                    color: "#8B5E52",
                                }}
                            >
                                Your ink color
                            </span>
                        </div>
                    </div>

                    {/* palette */}
                    <div className="mt-1 grid grid-cols-6 gap-1.5">
                        {CURATED_PALETTE.map((swatch) => (
                            <ColorSwatch
                                key={swatch}
                                color={swatch}
                                active={color === swatch}
                                onClick={() => onColorChange(swatch)}
                            />
                        ))}
                    </div>
                </div>
            </Section>

            {/* footer: status + actions */}
            <div className="mt-1 flex flex-col gap-2 pt-1">
                {/* status line */}
                <p
                    className="text-[10px]"
                    style={{ fontFamily: "'Noto Serif', serif", color: "rgba(139,94,82,0.8)" }}
                >
                    {tool === "pencil"
                        ? "Pen"
                        : tool === "eraser"
                            ? "Eraser"
                            : tool === "fill"
                                ? "Fill"
                                : "Pick"}{" "}
                    ·{" "}
                    {brushSize === 1
                        ? "Fine"
                        : brushSize === 2
                            ? "Medium"
                            : "Bold"}
                </p>

                <OnlineUsersBadge onlineUsers={onlineUsers} />

                {canDownload && (
                    <motion.button
                        whileHover={{
                            scale: 1.03,
                            boxShadow: "0 8px 22px rgba(139,94,82,0.28)",
                        }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onDownload}
                        type="button"
                        className="w-full h-9 rounded-full flex items-center justify-center gap-2 mt-1"
                        style={{ backgroundColor: "#E7B8C7", color: "#4A3B32" }}
                    >
                        <Download size={14} />
                        <span
                            className="text-[11px] font-bold"
                            style={{ fontFamily: "'Noto Sans', sans-serif" }}
                        >
                            Post My Wish
                        </span>
                    </motion.button>
                )}
            </div>
        </aside>
    );
};

export default CanvasToolbar;