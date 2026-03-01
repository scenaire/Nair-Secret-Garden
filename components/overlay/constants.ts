// components/overlay/constants.ts

export const OVERLAY_CHANNEL = "garden-overlay";

// ── Jar physics dimensions (must match JarSVG viewBox) ────────────────────────
export const JAR = {
    LEFT: 65,
    RIGHT: 235,
    BOTTOM: 240,
    NECK_Y: 65,
    WIDTH: 170, // RIGHT - LEFT
    WALL_T: 50,
} as const;

export const SEED_R = 9;
export const MAX_SEEDS = 50;

// ── Theme palette ──────────────────────────────────────────────────────────────
export type ThemeKey = "cream" | "blush" | "sky" | "sage" | "lavender" | "butter";

export interface ThemeColors {
    bg: string; // rgba for seed fill
    border: string; // rgba for seed border
    glow: [number, number, number]; // rgb tuple for dynamic glow
    noteDot: string; // hex for notification dot
}

export const THEMES: Record<ThemeKey, ThemeColors> = {
    cream: { bg: "rgba(245,232,205,0.52)", border: "rgba(205,182,142,0.48)", glow: [255, 225, 160], noteDot: "#d4c090" },
    blush: { bg: "rgba(248,210,220,0.52)", border: "rgba(215,165,178,0.48)", glow: [240, 160, 185], noteDot: "#e8a0b8" },
    sky: { bg: "rgba(200,225,248,0.52)", border: "rgba(148,192,228,0.48)", glow: [140, 195, 240], noteDot: "#8abcd4" },
    sage: { bg: "rgba(195,228,210,0.52)", border: "rgba(140,192,168,0.48)", glow: [140, 210, 175], noteDot: "#80c4a0" },
    lavender: { bg: "rgba(218,205,248,0.52)", border: "rgba(172,150,228,0.48)", glow: [185, 160, 235], noteDot: "#b0a0d8" },
    butter: { bg: "rgba(250,235,175,0.52)", border: "rgba(215,190,120,0.48)", glow: [255, 215, 120], noteDot: "#d4a830" },
};

export function resolveTheme(themeKey?: string): ThemeColors {
    if (themeKey && themeKey in THEMES) return THEMES[themeKey as ThemeKey];
    return THEMES.cream;
}

// ── Flower gacha rates ─────────────────────────────────────────────────────────
export type FlowerType = "daisy" | "tulip" | "cosmos" | "rose" | "lily";

export function rollFlower(): FlowerType {
    const r = Math.random() * 100;
    if (r < 50) return "daisy";
    if (r < 70) return "tulip";
    if (r < 85) return "cosmos";
    if (r < 95) return "rose";
    return "lily";
}

// ── Flower color palettes ──────────────────────────────────────────────────────
export const FLOWER_PALETTES = [
    { center: "#f5e680", petal: "#fff8e8", stem: "#7ab870" },
    { center: "#f0c060", petal: "#ffe8f0", stem: "#88b870" },
    { center: "#e8d870", petal: "#f0e8ff", stem: "#78b880" },
    { center: "#f8d090", petal: "#e8f8f0", stem: "#80c080" },
    { center: "#f0b870", petal: "#fff0e0", stem: "#90b878" },
] as const;

// ── Phase thresholds ───────────────────────────────────────────────────────────
export function getPhase(ratio: number): 1 | 2 | 3 {
    if (ratio < 0.3) return 1;
    if (ratio < 0.7) return 2;
    return 3;
}