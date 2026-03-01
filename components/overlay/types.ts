// components/overlay/types.ts

import type { ThemeKey } from "./constants";

// ── Broadcast payload shapes ───────────────────────────────────────────────────

export interface SeedPayload {
    type: "seed";
    username: string;
    themeKey: ThemeKey;
}

export interface BloomPayload {
    type: "bloom";
    username: string;
    imageUrl?: string; // optional — shows placeholder polaroid if absent
}

export type OverlayPayload = SeedPayload | BloomPayload;

// ── Internal state ─────────────────────────────────────────────────────────────

export interface SeedBall {
    bodyId: number;   // Matter.js body id
    themeKey: string;
}

export interface PlacedFlower {
    id: string;
    x: number;  // left px
    topY: number;  // top px (stem base - stemH)
    baseY: number;  // stem base px
    stemH: number;
    flowerW: number;
    flowerType: string;
    paletteIdx: number;
    scaleFactor: number;
    swayFrom: string;
    swayTo: string;
    swayDur: string;
    growDur: string;
}