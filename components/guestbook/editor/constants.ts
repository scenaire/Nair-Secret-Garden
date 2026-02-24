import { TextureType, MoodType, Question } from './types'; // 
import type { ThemeConfig } from './types';

export const PAPER_COLORS = {
    // 🌸 Spring Bloom
    cream: "bg-[#FCFBEF]",
    sakuraMilk: "bg-[#FCEDF1]",      // ชมพูใสแต่มี warmth
    apricotTea: "bg-[#FAEBE3]",      // พีชอุ่นแบบชาแอปริคอต
    honeyLavender: "bg-[#F5EBFC]",   // ม่วงอุ่น ไม่อมฟ้า
    pastelSky: "bg-[#EBF5FA]",      // โรสผสมครีม อบอุ่นมาก
    // 🌿 Garden Light
    almond: "bg-[#F6EFE6]",        // เบจอัลมอนด์ อบอุ่น
    warmSand: "bg-[#EFE3D3]",      // ทรายอุ่น
    oliveMilk: "bg-[#E8EBD9]",     // เขียวมะกอกอ่อนมาก
    terracottaBlush: "bg-[#F2DDD6]", // ชมพูดินเผาอ่อน
    linen: "bg-[#F4F1EA]",         // ผ้าลินินธรรมชาติ
    // 🌺 Candy Pop
    rubyPop: "bg-[#F56E8C]",       // ชมพูแดงสด (ตัวอย่างที่เธอให้)
    mintSplash: "bg-[#8ED6D3]",    // มิ้นต์สดใส
    sunnyMango: "bg-[#FFC857]",    // เหลืองมะม่วงสด
    violetCandy: "bg-[#B084F5]",   // ม่วงลูกกวาด
    skyBubble: "bg-[#6EC5FF]",     // ฟ้าลูกโป่ง
    // 🌙 Night Letter
    twilightBlue: "bg-[#2F3C4F]",
    plumNight: "bg-[#3A314F]",
    deepTeal: "bg-[#244B4B]",
    wineRose: "bg-[#4A2E3A]",
    charcoalInk: "bg-[#2A2F36]"
} as const;

export type PaperColorType = keyof typeof PAPER_COLORS;


export const PAPER_COLLECTIONS: Record<string, PaperColorType[]> = {
    " 🌸 Spring Bloom": ["cream", "sakuraMilk", "apricotTea", "honeyLavender", "pastelSky"],
    " 🌿 Garden Light": ["almond", "warmSand", "oliveMilk", "terracottaBlush", "linen"],
    " 🧁 Candy Pop": ["rubyPop", "mintSplash", "sunnyMango", "violetCandy", "skyBubble"],
    " 🌙 Night Letter": ["twilightBlue", "plumNight", "deepTeal", "wineRose", "charcoalInk"],

};

export const PAPER_LINK_COLORS: Record<PaperColorType, string> = {
    // 🌸 Spring Bloom
    cream: "#8C7A6B",
    sakuraMilk: "#D98880",
    apricotTea: "#C97A63",
    honeyLavender: "#9B7EBD",
    pastelSky: "#83adf2ff",
    // 🌿 Garden Light
    almond: "#967E6D",
    warmSand: "#8C6A53",
    oliveMilk: "#788A63",
    terracottaBlush: "#B56A5B",
    linen: "#8A8178",
    // 🌺 Candy Pop
    rubyPop: "#FFD166",
    mintSplash: "#165a57ff",
    sunnyMango: "#7d4510ff",
    violetCandy: "#36156bff",
    skyBubble: "#0b476cff",
    // 🌙 Night Letter
    twilightBlue: "#fbd971ff",
    plumNight: "#cfbff5ff",
    deepTeal: "#f1ffa5ff",
    wineRose: "#ede0e6ff",
    charcoalInk: "#c0c4d3ff"
};

// ✨ ข้อมูล Mood & Tone แบบใหม่ที่ใช้ CSS Variables!
export const THEMES: Record<string, ThemeConfig> = {

    cream: {
        id: "cream",
        name: "Vanilla Cream",
        coverImage: "/images/cover-cream.png",
        defaultPaper: "cream",
        cssVars: {
            '--theme-bg': '#FDFBF4',
            '--theme-icon': '#E6D7BD',
            '--theme-btn-bg': '#E6D7BD',
            '--theme-btn-text': '#4A3B32',

            '--theme-toolbar-bg': 'rgba(253, 251, 244, 0.92)',
            '--theme-toolbar-border': 'rgba(230, 215, 189, 0.7)',

            '--theme-toolbar-icon-idle': 'rgba(74, 59, 50, 0.65)',
            '--theme-toolbar-icon-active': 'rgba(230, 215, 189, 0.9)',
            '--theme-toolbar-icon-hover': 'rgba(74, 59, 50, 0.08)',

            '--theme-text-body': '#4A3B32',
            '--theme-selection': 'rgba(230, 215, 189, 0.55)',

            '--theme-scrollbar-thumb': 'rgba(230, 215, 189, 0.9)',
            '--theme-scrollbar-track': 'transparent'
        }
    },

    blush: {
        id: "blush",
        name: "Rose Blush",
        coverImage: "/images/cover-blush.png",
        defaultPaper: "cream",
        cssVars: {
            '--theme-bg': '#FFF3F6',
            '--theme-icon': '#F4C9D4',
            '--theme-btn-bg': '#F4C9D4',
            '--theme-btn-text': '#4A3B32',

            '--theme-toolbar-bg': 'rgba(255, 243, 246, 0.9)',
            '--theme-toolbar-border': 'rgba(244, 201, 212, 0.75)',

            '--theme-toolbar-icon-idle': 'rgba(74, 59, 50, 0.65)',
            '--theme-toolbar-icon-active': 'rgba(244, 201, 212, 0.9)',
            '--theme-toolbar-icon-hover': 'rgba(74, 59, 50, 0.08)',

            '--theme-text-body': '#4A3B32',
            '--theme-selection': 'rgba(244, 201, 212, 0.6)',

            '--theme-scrollbar-thumb': 'rgba(244, 201, 212, 0.9)',
            '--theme-scrollbar-track': 'transparent'
        }
    },

    sky: {
        id: "sky",
        name: "Morning Sky",
        coverImage: "/images/cover-sky.png",
        defaultPaper: "cream",
        cssVars: {
            '--theme-bg': '#F4F9FF',
            '--theme-icon': '#D2E6F6',
            '--theme-btn-bg': '#D2E6F6',
            '--theme-btn-text': '#4A3B32',

            '--theme-toolbar-bg': 'rgba(244, 249, 255, 0.9)',
            '--theme-toolbar-border': 'rgba(210, 230, 246, 0.75)',

            '--theme-toolbar-icon-idle': 'rgba(74, 59, 50, 0.65)',
            '--theme-toolbar-icon-active': 'rgba(210, 230, 246, 0.9)',
            '--theme-toolbar-icon-hover': 'rgba(74, 59, 50, 0.08)',

            '--theme-text-body': '#4A3B32',
            '--theme-selection': 'rgba(210, 230, 246, 0.6)',

            '--theme-scrollbar-thumb': 'rgba(210, 230, 246, 0.9)',
            '--theme-scrollbar-track': 'transparent'

        }
    },

};

export type ThemeKey = keyof typeof THEMES;

export const TEXTURE_STYLES: Record<TextureType, React.CSSProperties> = {
    plain: {},
    dotted: {
        backgroundImage: `
        radial-gradient(circle, rgba(120, 100, 90, 0.5) 0.8px, transparent 0.8px)
    `,
        backgroundSize: '20px 20px',
    },
    'vintage-grid': {
        backgroundImage: `
        linear-gradient(rgba(120, 100, 90, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(120, 100, 90, 0.08) 1px, transparent 1px)
    `,
        backgroundSize: '32px 32px',
    },
    'soft-paper': {
        backgroundImage: `radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)`,
        backgroundSize: '5px 5px'
    }
};

// ✨ ย้ายสไตล์อารมณ์มาไว้ที่นี่
export const MOOD_STYLES: Record<MoodType, { bg: string; emoji: string }> = {
    warm: { bg: "bg-orange-100", emoji: "☀️" },
    playful: { bg: "bg-yellow-100", emoji: "🎵" },
    shy: { bg: "bg-pink-200", emoji: "🌸" },
    sincere: { bg: "bg-blue-100", emoji: "❄️" },
    teasing: { bg: "bg-purple-100", emoji: "✨" },
};

export const MOODS: MoodType[] = ["warm", "playful", "shy", "sincere", "teasing"];

// ✨ ชุดคำถามใหม่ที่จับคู่อารมณ์ไว้แล้ว (อัปเดตหรือเพิ่มเองได้เลยนะคะ)
export const GUESTBOOK_QUESTIONS: Question[] = [
    { text: "เรารู้จักกันได้อย่างไร?", mood: "warm" },
    { text: "ประทับใจอะไรในตัวฉัน?", mood: "shy" },
    { text: "เรื่องตลกที่สุดที่เราเคยเจอด้วยกัน?", mood: "playful" },
    { text: "ถ้าเปรียบฉันเป็นเพลง จะเป็นเพลงอะไร?", mood: "sincere" },
    { text: "ความลับที่ยังไม่เคยบอกฉันคืออะไร?", mood: "teasing" }
];

export const STICKER_PACKS = {
    floral: ['🌸', '🌹', '🌻', '🌷', '🌺', '🌼'],
    cute: ['🧸', '🎀', '🍓', '🍰', '💌', '💖'],
    vintage: ['☕', '🕊️', '🕰️', '📜', '🗝️', '🕯️']
} as const;