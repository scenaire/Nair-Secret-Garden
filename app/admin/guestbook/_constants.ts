import React from "react";

export const THEMES: Record<string, { bg: string; accent: string; accentText: string; label: string; patternRgb: string }> = {
    cream: { bg: "#FDFBF4", accent: "#E6D7BD", accentText: "#7A6147", label: "Vanilla Cream", patternRgb: "230,215,189" },
    blush: { bg: "#FFF3F6", accent: "#F4C9D4", accentText: "#A85F75", label: "Rose Blush", patternRgb: "244,201,212" },
    sky: { bg: "#F4F9FF", accent: "#D2E6F6", accentText: "#3A6F9E", label: "Morning Sky", patternRgb: "210,230,246" },
    sage: { bg: "#F4FBF7", accent: "#CFE7DA", accentText: "#3D7558", label: "Soft Sage", patternRgb: "207,231,218" },
    lavender: { bg: "#F8F5FF", accent: "#E3D9F6", accentText: "#6B5A9E", label: "Dusty Lavender", patternRgb: "227,217,246" },
    butter: { bg: "#FFFBEF", accent: "#F6E7B8", accentText: "#A27B1E", label: "Butter Honey", patternRgb: "246,231,184" },
};

export const PAPER_COLORS: Record<string, string> = {
    cream: "#FCFBEF",
    sakuraMilk: "#FCEDF1",
    apricotTea: "#FAEBE3",
    honeyLavender: "#F5EBFC",
    pastelSky: "#EBF5FA",
    almond: "#F6EFE6",
    warmSand: "#EFE3D3",
    oliveMilk: "#E8EBD9",
    terracottaBlush: "#F2DDD6",
    linen: "#F4F1EA",
    rubyPop: "#F56E8C",
    mintSplash: "#8ED6D3",
    sunnyMango: "#FFC857",
    violetCandy: "#B084F5",
    skyBubble: "#6EC5FF",
    twilightBlue: "#2F3C4F",
    plumNight: "#3A314F",
    deepTeal: "#244B4B",
    wineRose: "#4A2E3A",
    charcoalInk: "#2A2F36",
};

export const PAPER_LINK_COLORS: Record<string, string> = {
    cream: "#8C7A6B", sakuraMilk: "#D98880", apricotTea: "#C97A63",
    honeyLavender: "#9B7EBD", pastelSky: "#83adf2", almond: "#967E6D",
    warmSand: "#8C6A53", oliveMilk: "#788A63", terracottaBlush: "#B56A5B",
    linen: "#8A8178", rubyPop: "#FFD166", mintSplash: "#165a57",
    sunnyMango: "#7d4510", violetCandy: "#36156b", skyBubble: "#0b476c",
    twilightBlue: "#fbd971", plumNight: "#cfbff5", deepTeal: "#f1ffa5",
    wineRose: "#ede0e6", charcoalInk: "#c0c4d3",
};

export const TEXTURE_STYLES: Record<string, React.CSSProperties> = {
    plain: {},
    dotted: {
        backgroundImage: `radial-gradient(circle, rgba(120,100,90,0.5) 0.8px, transparent 0.8px)`,
        backgroundSize: "20px 20px",
    },
    "vintage-grid": {
        backgroundImage: `linear-gradient(rgba(120,100,90,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(120,100,90,0.08) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
    },
    "soft-paper": {
        backgroundImage: `radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)`,
        backgroundSize: "5px 5px",
    },
};

export const getTheme = (key: string) => THEMES[key] || THEMES.cream;
export const getPaperBg = (key: string) => PAPER_COLORS[key] || PAPER_COLORS.cream;
export const getPaperLinkColor = (key: string) => PAPER_LINK_COLORS[key] || PAPER_LINK_COLORS.cream;
export const getTextureStyle = (key: string): React.CSSProperties => TEXTURE_STYLES[key] || {};

export const bgPattern = (patternRgb: string) => ({
    backgroundImage: `
        linear-gradient(0deg, rgba(${patternRgb},0.18) 50%, transparent 50%),
        linear-gradient(90deg, rgba(${patternRgb},0.18) 50%, transparent 50%),
        repeating-linear-gradient(45deg, rgba(${patternRgb},0.22) 0px, rgba(${patternRgb},0.22) 2px, transparent 2px, transparent 6px)
    `,
    backgroundSize: "60px 60px",
});

// CSS ที่ inject ลงหน้า admin เพื่อให้ font และ scrollbar ทำงานถูกต้อง
export const ADMIN_STYLE_TAG = `
    .tiptap [style*="Noto Serif Thai"]  { font-family: var(--font-noto-serif), 'Noto Serif Thai', serif !important; }
    .tiptap [style*="Noto Sans Thai"]   { font-family: var(--font-noto-sans-thai), 'Noto Sans Thai', sans-serif !important; }
    .tiptap [style*="Playpen Sans Thai"]{ font-family: var(--font-playpen-sans-thai), 'Playpen Sans Thai', sans-serif !important; }
    .tiptap [style*="Caveat"]           { font-family: var(--font-caveat), 'Caveat', cursive !important; }
    .tiptap [style*="GivePANI"]         { font-family: 'GivePANINewYear2026', serif !important; }
    .tiptap [style*="Google Sans"]      { font-family: 'Google Sans', sans-serif !important; }
    .tiptap [style*="Anuphan"]          { font-family: 'Anuphan', sans-serif !important; }

    .stream-paper { scrollbar-width: none; }
    .stream-paper::-webkit-scrollbar { display: none; }
`;