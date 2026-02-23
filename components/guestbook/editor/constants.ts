import { TextureType } from './types'; // ❌ ลบ PaperColorType ออกจากบรรทัดนี้นะคะ


export const PAPER_COLORS = {
    // 🌸 Spring Bloom
    cream: "bg-[#FCFBEF]",
    sakuraMilk: "bg-[#FCEDF1]",      // ชมพูใสแต่มี warmth
    apricotTea: "bg-[#FAEBE3]",      // พีชอุ่นแบบชาแอปริคอต
    honeyLavender: "bg-[#F5EBFC]",   // ม่วงอุ่น ไม่อมฟ้า
    butterRose: "bg-[#FFF4EA]",      // โรสผสมครีม อบอุ่นมาก
    // 🌿 Garden Light
    almond: "bg-[#F6EFE6]",        // เบจอัลมอนด์ อบอุ่น
    warmSand: "bg-[#EFE3D3]",      // ทรายอุ่น
    oliveMilk: "bg-[#E8EBD9]",     // เขียวมะกอกอ่อนมาก
    terracottaBlush: "bg-[#F2DDD6]", // ชมพูดินเผาอ่อน
    linen: "bg-[#F4F1EA]",         // ผ้าลินินธรรมชาติ
    // 🌺 Candy Pop
    rubyPop: "bg-[#E42E57]",       // ชมพูแดงสด (ตัวอย่างที่เธอให้)
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
    " 🌸 Spring Bloom": ["cream", "sakuraMilk", "apricotTea", "honeyLavender", "butterRose"],
    " 🌿 Garden Light": ["almond", "warmSand", "oliveMilk", "terracottaBlush", "linen"],
    " 🧁 Candy Pop": ["rubyPop", "mintSplash", "sunnyMango", "violetCandy", "skyBubble"],
    " 🌙 Night Letter": ["twilightBlue", "plumNight", "deepTeal", "wineRose", "charcoalInk"],

};

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

export const STICKER_PACKS = {
    floral: ['🌸', '🌹', '🌻', '🌷', '🌺', '🌼'],
    cute: ['🧸', '🎀', '🍓', '🍰', '💌', '💖'],
    vintage: ['☕', '🕊️', '🕰️', '📜', '🗝️', '🕯️']
} as const;