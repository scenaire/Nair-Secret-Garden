// components/overlay/types.ts
// (full replacement — adds wish event payloads with progress fields)

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
    imageUrl?: string;
}

export interface WishContributionPayload {
    type: "wish_contribution";
    username: string;
    wishTitle: string;
    amount: number;
    avatarUrl?: string;
    approvedTotal?: number; // current approved total BEFORE this contribution
    targetAmount?: number; // wish item target
}

export interface WishSurprisePayload {
    type: "wish_surprise";
    username: string;
    itemName: string;
    message?: string;
    amount?: number;
    avatarUrl?: string;
}

export type OverlayPayload =
    | SeedPayload
    | BloomPayload
    | WishContributionPayload
    | WishSurprisePayload;

// ── Internal state ─────────────────────────────────────────────────────────────

export interface SeedBall {
    bodyId: number;
    themeKey: string;
}

export interface PlacedFlower {
    id: string;
    x: number;
    topY: number;
    baseY: number;
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