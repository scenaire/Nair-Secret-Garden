"use client";

// components/landing/SakuraHero.tsx

import React, { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookHeart, Palette, Coins, Sparkles, Droplets } from "lucide-react";

// ─── TODO: replace with real data when ready ──────────────────────────────────
const STATIC_GUESTBOOK_COUNT = 13;
const STATIC_FANART_COUNT = 3;
const STATIC_WISH_COUNT = 3;

// ─── Types ────────────────────────────────────────────────────────────────────

type BlossomType = "guestbook" | "fanart" | "wish";

interface Blossom {
    id: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    type: BlossomType;
}

interface BlossomMap {
    guestbook: Blossom[];
    fanart: Blossom[];
    wish: Blossom[];
}

interface Stage {
    id: "sprout" | "growing" | "blooming" | "full" | "mythic";
    label: string;
    trunkColor: string;
    glowColor: string;
    blossomBoost: number;
}

interface Droplet {
    id: number;
    x: number;
    y: number;
}

// ─── SVG viewport ─────────────────────────────────────────────────────────────

const VB_W = 960;
const VB_H = 540;
const CX = 480;
const TREE_BASE_Y = 520;
const TREE_TOP_Y = 60;

// ─── Tree stages ──────────────────────────────────────────────────────────────

function getStage(total: number): Stage {
    if (total >= 100) {
        return {
            id: "mythic",
            label: "mythic bloom",
            trunkColor: "#B8845A",
            glowColor: "rgba(255,215,100,0.32)",
            blossomBoost: 1.3,
        };
    }
    if (total >= 60) {
        return {
            id: "full",
            label: "full bloom",
            trunkColor: "#C4956A",
            glowColor: "rgba(249,200,217,0.28)",
            blossomBoost: 1.1,
        };
    }
    if (total >= 30) {
        return {
            id: "blooming",
            label: "blooming",
            trunkColor: "#C4956A",
            glowColor: "rgba(249,200,217,0.18)",
            blossomBoost: 1.0,
        };
    }
    if (total >= 10) {
        return {
            id: "growing",
            label: "growing",
            trunkColor: "#C4956A",
            glowColor: "rgba(200,220,200,0.15)",
            blossomBoost: 0.9,
        };
    }
    return {
        id: "sprout",
        label: "young sprout",
        trunkColor: "#B8A090",
        glowColor: "rgba(200,220,200,0.1)",
        blossomBoost: 0.8,
    };
}

// ─── Petal colours ────────────────────────────────────────────────────────────

const PETAL: Record<BlossomType, { fill: string; center: string }> = {
    guestbook: { fill: "#F9C8D9", center: "#F48FB1" },
    fanart: { fill: "#FFE4F0", center: "#F06292" },
    wish: { fill: "#E8D5F5", center: "#CE93D8" },
};

const MYTHIC_PETAL: Record<BlossomType, { fill: string; center: string }> = {
    guestbook: { fill: "#FFF3C4", center: "#FFD54F" },
    fanart: { fill: "#FFE0B2", center: "#FFA726" },
    wish: { fill: "#E1F5FE", center: "#81D4FA" },
};

// ─── Seeded random ────────────────────────────────────────────────────────────

function sr(seed: number): number {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

function r4(n: number): number {
    return Math.round(n * 10000) / 10000;
}

// ─── Blossom zones ────────────────────────────────────────────────────────────

const ZONES: Record<BlossomType, [number, number, number, number][]> = {
    guestbook: [
        [CX - 160, 55, CX - 40, 155],
        [CX + 40, 55, CX + 160, 155],
        [CX - 80, 145, CX + 80, 248],
        [CX - 200, 128, CX - 70, 208],
        [CX + 70, 128, CX + 200, 208],
    ],
    fanart: [
        [CX + 40, 55, CX + 160, 155],
        [CX - 160, 55, CX - 40, 155],
        [CX - 40, 38, CX + 40, 118],
        [CX + 75, 125, CX + 195, 202],
        [CX - 195, 125, CX - 75, 202],
    ],
    wish: [
        [CX - 80, 148, CX + 80, 252],
        [CX - 40, 38, CX + 40, 128],
        [CX - 170, 108, CX - 50, 192],
        [CX + 50, 108, CX + 170, 192],
        [CX - 120, 235, CX + 120, 318],
    ],
};

// ─── Blossom placement helpers ────────────────────────────────────────────────

function makeBlossom(type: BlossomType, localIdx: number, globalIdx: number): Blossom {
    const zones = ZONES[type];
    const z = zones[localIdx % zones.length];
    const s = globalIdx * 37 + localIdx * 13;
    return {
        id: `${type}-${localIdx}`,
        x: r4(z[0] + sr(s) * (z[2] - z[0])),
        y: r4(z[1] + sr(s + 7) * (z[3] - z[1])),
        scale: r4(0.65 + sr(s + 14) * 0.85),
        rotation: r4(sr(s + 21) * 360),
        type,
    };
}

function placeOrganic(blossom: Blossom, existing: Blossom[], seed: number): Blossom {
    const zones = ZONES[blossom.type];
    let best = blossom;

    for (let attempt = 0; attempt < 6; attempt++) {
        const s = seed * 97 + attempt * 31;
        const zone = zones[attempt % zones.length];

        const candidate: Blossom = {
            ...blossom,
            x: r4(zone[0] + sr(s) * (zone[2] - zone[0])),
            y: r4(zone[1] + sr(s + 11) * (zone[3] - zone[1])),
        };

        const tooClose = existing.some((e) => {
            const dx = e.x - candidate.x;
            const dy = e.y - candidate.y;
            return Math.sqrt(dx * dx + dy * dy) < (e.scale + candidate.scale) * 12;
        });

        if (!tooClose) return candidate;
        best = candidate;
    }

    return best;
}

function reconcileBlossoms(prev: BlossomMap, gb: number, fa: number, wi: number): BlossomMap {
    const targets: Record<BlossomType, number> = { guestbook: gb, fanart: fa, wish: wi };
    const next = {} as BlossomMap;
    const placed: Blossom[] = [];

    let globalIdx = 0;

    for (const type of ["guestbook", "fanart", "wish"] as BlossomType[]) {
        const count = targets[type];
        const existing = prev[type] ?? [];
        const result: Blossom[] = [];

        for (let i = 0; i < count; i++) {
            if (i < existing.length) {
                const kept = { ...existing[i] };
                result.push(kept);
                placed.push(kept);
            } else {
                let b = makeBlossom(type, i, globalIdx);
                b = placeOrganic(b, placed, globalIdx * 17 + i);
                result.push(b);
                placed.push(b);
            }
            globalIdx++;
        }

        next[type] = result;
    }

    return next;
}

// ─── Branch tips ──────────────────────────────────────────────────────────────

const BRANCH_TIPS: [number, number][] = [
    [CX - 140, 120],
    [CX - 185, 162],
    [CX - 105, 88],
    [CX + 140, 120],
    [CX + 185, 162],
    [CX + 105, 88],
    [CX, 58],
    [CX - 55, 182],
    [CX + 55, 182],
    [CX - 205, 200],
    [CX + 205, 200],
    [CX, 142],
];

// ─── SVG sub-components ───────────────────────────────────────────────────────

function Branch({
    d,
    width,
    delay,
    color,
}: {
    d: string;
    width: number;
    delay: number;
    color: string;
}) {
    return (
        <motion.path
            d={d}
            stroke={color}
            strokeWidth={width}
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
        />
    );
}

function FallingPetal({ idx, stage }: { idx: number; stage: Stage }) {
    const s = idx * 53;
    const tip = BRANCH_TIPS[idx % BRANCH_TIPS.length];
    const sx = r4(tip[0] + (sr(s + 3) - 0.5) * 40);
    const sy = r4(tip[1] + (sr(s + 6) - 0.5) * 25);
    const drift = r4((sr(s + 5) - 0.5) * 90);
    const dur = r4(5 + sr(s + 10) * 6);
    const delay = r4(sr(s + 15) * 12);
    const size = r4(5 + sr(s + 20) * 5);

    const cols =
        stage.id === "mythic"
            ? ["#FFF3C4", "#FFE0B2", "#E1F5FE"]
            : ["#F9C8D9", "#FFE4F0", "#E8D5F5"];

    return (
        <motion.g
            initial={{ x: sx, y: sy, opacity: 0, rotate: 0 }}
            animate={{
                x: [sx, sx + drift * 0.4, sx + drift],
                y: [sy, sy + 200, sy + 480],
                opacity: [0, 0.7, 0.5, 0],
                rotate: [0, 180, 360],
            }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "easeIn" }}
        >
            <ellipse cx={0} cy={0} rx={size} ry={size * 0.55} fill={cols[idx % cols.length]} />
        </motion.g>
    );
}

function BlossomFlower({
    blossom,
    stage,
    watered,
}: {
    blossom: Blossom;
    stage: Stage;
    watered: boolean;
}) {
    const palette = stage.id === "mythic" ? MYTHIC_PETAL : PETAL;
    const c = palette[blossom.type];
    const size = r4(blossom.scale * 20 * stage.blossomBoost);
    const swayPhase = r4(sr(blossom.x * 3 + blossom.y) * 0.6);

    return (
        <motion.g
            initial={{ x: blossom.x, y: blossom.y, scale: 0, opacity: 0 }}
            animate={{
                x: watered
                    ? [
                        blossom.x,
                        blossom.x - 3 + sr(blossom.y) * 6,
                        blossom.x + 2 - sr(blossom.x) * 4,
                        blossom.x,
                    ]
                    : blossom.x,
                y: blossom.y,
                scale: 1,
                opacity: 1,
                rotate: watered
                    ? [0, -4 + sr(blossom.x) * 8, 3 - sr(blossom.y) * 6, 0]
                    : 0,
            }}
            transition={{
                scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                x: watered
                    ? {
                        duration: 1.6 + swayPhase,
                        ease: "easeInOut",
                        delay: swayPhase * 0.4,
                    }
                    : {},
                rotate: watered
                    ? {
                        duration: 1.6 + swayPhase,
                        ease: "easeInOut",
                        delay: swayPhase * 0.4,
                    }
                    : {},
            }}
        >
            {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                    key={a}
                    cx={0}
                    cy={-size * 0.55}
                    rx={size * 0.38}
                    ry={size * 0.55}
                    fill={c.fill}
                    stroke={stage.id === "mythic" ? "rgba(255,220,80,0.4)" : "#F8BBD0"}
                    strokeWidth="0.5"
                    transform={`rotate(${a + blossom.rotation})`}
                />
            ))}
            <circle cx={0} cy={0} r={size * 0.22} fill={c.center} opacity={0.85} />
            <circle cx={0} cy={0} r={size * 0.12} fill="#fff" opacity={0.6} />

            {stage.id === "mythic" && (
                <motion.circle
                    cx={0}
                    cy={0}
                    r={size * 0.38}
                    fill="none"
                    stroke="rgba(255,215,100,0.25)"
                    strokeWidth="1"
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
                    transition={{
                        duration: 2.5 + sr(blossom.x) * 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{ transformOrigin: "0px 0px" }}
                />
            )}
        </motion.g>
    );
}

function Butterfly({ idx }: { idx: number }) {
    const s = idx * 79;
    const px = r4(CX + 75 + sr(s) * 130);
    const py = r4(95 + sr(s + 5) * 125);
    const fy = r4(py - 8 - sr(s + 10) * 6);
    const wingDur = r4(0.5 + sr(s + 30) * 0.4);

    return (
        <motion.g
            initial={{ x: px, y: py - 20, opacity: 0, scale: 0 }}
            animate={{ x: px, y: [py, fy, py], opacity: 1, scale: 1 }}
            transition={{
                opacity: { delay: 1.5 + idx * 0.45, duration: 0.6 },
                scale: { delay: 1.5 + idx * 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                y: {
                    delay: 2 + idx * 0.45,
                    duration: 3 + sr(s + 20) * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                },
            }}
        >
            <motion.ellipse
                cx={-7}
                cy={-3}
                rx={9}
                ry={6}
                fill="#F48FB1"
                opacity={0.82}
                animate={{ scaleX: [1, 0.3, 1] }}
                transition={{ duration: wingDur, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "0 0" }}
            />
            <motion.ellipse
                cx={7}
                cy={-3}
                rx={9}
                ry={6}
                fill="#F06292"
                opacity={0.82}
                animate={{ scaleX: [1, 0.3, 1] }}
                transition={{ duration: wingDur, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "0 0" }}
            />
            <ellipse cx={0} cy={0} rx={1.8} ry={5} fill="#A0526A" />
            <line x1={-1} y1={-5} x2={-5} y2={-10} stroke="#A0526A" strokeWidth="0.7" strokeLinecap="round" />
            <line x1={1} y1={-5} x2={5} y2={-10} stroke="#A0526A" strokeWidth="0.7" strokeLinecap="round" />
            <circle cx={-5} cy={-10} r={1.2} fill="#F48FB1" />
            <circle cx={5} cy={-10} r={1.2} fill="#F48FB1" />
        </motion.g>
    );
}

function Lantern({ idx }: { idx: number }) {
    const s = idx * 61;
    const hx = r4(CX - 85 - sr(s) * 115);
    const hy = r4(90 + sr(s + 5) * 110);

    return (
        <motion.g
            initial={{ x: hx, y: hy - 22, opacity: 0, scale: 0 }}
            animate={{ x: hx, y: hy, opacity: 1, scale: 1 }}
            transition={{
                delay: 1.8 + idx * 0.55,
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            <line x1={0} y1={-18} x2={0} y2={-8} stroke="#C4956A" strokeWidth="0.8" />
            <motion.g
                animate={{ y: [0, -3, 0] }}
                transition={{
                    duration: 2.5 + sr(s + 20),
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <ellipse cx={0} cy={0} rx={7} ry={10} fill="rgba(255,220,140,0.9)" stroke="#E8A030" strokeWidth="0.7" />
                <ellipse cx={0} cy={0} rx={4} ry={6} fill="rgba(255,245,180,0.7)" />
                <ellipse cx={0} cy={-10} rx={5} ry={2} fill="#D4880A" />
                <ellipse cx={0} cy={10} rx={5} ry={2} fill="#D4880A" />
                {([-4, 0, 4] as number[]).map((rx) => (
                    <line
                        key={rx}
                        x1={rx}
                        y1={-10}
                        x2={rx}
                        y2={10}
                        stroke="rgba(200,140,0,0.3)"
                        strokeWidth="0.5"
                    />
                ))}
                <motion.ellipse
                    cx={0}
                    cy={0}
                    rx={13}
                    ry={16}
                    fill="rgba(255,220,80,0.07)"
                    animate={{ opacity: [0.07, 0.14, 0.07] }}
                    transition={{ duration: 2 + sr(s + 25), repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.g>
        </motion.g>
    );
}

function GoldParticle({ idx }: { idx: number }) {
    const s = idx * 41;
    const px = r4(CX - 220 + sr(s) * 440);
    const py = r4(40 + sr(s + 3) * 310);
    const size = r4(2 + sr(s + 6) * 3);

    return (
        <motion.circle
            cx={0}
            cy={0}
            r={size}
            fill="#FFD54F"
            initial={{ x: px, y: py, opacity: 0, scale: 0 }}
            animate={{
                x: px,
                y: [py, py - 22, py],
                opacity: [0, 0.9, 0.5, 0],
                scale: [0, 1, 0.8, 0],
            }}
            transition={{
                delay: sr(s + 15) * 4,
                duration: 2.5 + sr(s + 20) * 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}

function LeafPile({ total }: { total: number }) {
    const count = Math.min(12, Math.max(3, Math.floor(total * 0.4)));
    const colors = ["#F9C8D9", "#F48FB1", "#FFE4F0", "#E8D5F5", "#CE93D8", "#FFF3C4"];

    return (
        <g>
            {Array.from({ length: count }).map((_, i) => {
                const s = i * 43;
                const lx = r4(CX - 55 + sr(s) * 110);
                const angle = r4((sr(s + 3) - 0.5) * 60);
                const lw = r4(10 + sr(s + 6) * 10);
                const lh = r4(5 + sr(s + 9) * 5);

                return (
                    <motion.g
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.65, scale: 1 }}
                        transition={{
                            delay: 1.2 + i * 0.08,
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{ transformOrigin: `${lx}px ${TREE_BASE_Y - 6}px` }}
                    >
                        <ellipse
                            cx={lx}
                            cy={TREE_BASE_Y - 6}
                            rx={lw}
                            ry={lh}
                            fill={colors[i % colors.length]}
                            transform={`rotate(${angle}, ${lx}, ${TREE_BASE_Y - 6})`}
                        />
                    </motion.g>
                );
            })}
        </g>
    );
}

function WateringDroplet({
    id,
    x,
    y,
    onDone,
}: {
    id: number;
    x: number;
    y: number;
    onDone: () => void;
}) {
    return (
        <motion.g
            initial={{ x, y, opacity: 1, scale: 1 }}
            animate={{ y: y + 90, opacity: 0, scale: 0.4 }}
            transition={{ duration: r4(0.75 + sr(id % 97) * 0.5), ease: "easeIn" }}
            onAnimationComplete={onDone}
        >
            <ellipse cx={0} cy={0} rx={2.5} ry={4.5} fill="#81C9E8" opacity={0.85} />
        </motion.g>
    );
}

// ─── HTML sub-components ──────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    accent,
}: {
    label: string;
    value: string | number;
    accent: string;
}) {
    return (
        <div
            className="rounded-[22px] px-4 py-4"
            style={{
                background: "rgba(255,255,255,0.68)",
                border: "1px solid rgba(239, 192, 213, 0.55)",
                boxShadow: "0 8px 30px rgba(214, 170, 193, 0.10)",
                backdropFilter: "blur(10px)",
            }}
        >
            <div
                style={{
                    fontFamily: "'Noto Serif', serif",
                    fontSize: 11,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: "#B996A9",
                    marginBottom: 8,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontFamily: "'Noto Serif', serif",
                    fontSize: 24,
                    lineHeight: 1.1,
                    color: accent,
                    fontWeight: 600,
                }}
            >
                {value}
            </div>
        </div>
    );
}

function LegendRow({
    color,
    icon: Icon,
    label,
    count,
}: {
    color: string;
    icon: React.ElementType;
    label: string;
    count: number;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                        background: "rgba(255,255,255,0.72)",
                        border: "1px solid rgba(239, 192, 213, 0.50)",
                    }}
                >
                    <Icon size={15} color={color} strokeWidth={2} />
                </div>

                <span
                    className="truncate"
                    style={{
                        fontFamily: "'Noto Serif', serif",
                        fontSize: 14,
                        color: "#8F697A",
                        letterSpacing: "0.02em",
                    }}
                >
                    {label}
                </span>
            </div>

            <span
                style={{
                    fontFamily: "'Noto Serif', serif",
                    fontSize: 18,
                    color: "#C47E95",
                    fontWeight: 700,
                }}
            >
                {count}
            </span>
        </div>
    );
}

function WaterAction({
    onWater,
    stage,
}: {
    onWater: () => void;
    stage: Stage;
}) {
    return (
        <motion.button
            type="button"
            onClick={onWater}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-[24px] px-5 py-4 text-left"
            style={{
                background:
                    stage.id === "mythic"
                        ? "linear-gradient(180deg, rgba(255,250,235,0.92), rgba(255,244,225,0.82))"
                        : "linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,245,249,0.72))",
                border:
                    stage.id === "mythic"
                        ? "1px solid rgba(255, 215, 84, 0.45)"
                        : "1px solid rgba(239, 192, 213, 0.55)",
                boxShadow: "0 10px 30px rgba(214, 170, 193, 0.10)",
                backdropFilter: "blur(10px)",
            }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{
                        background:
                            stage.id === "mythic"
                                ? "rgba(255, 239, 194, 0.85)"
                                : "rgba(236, 247, 240, 0.95)",
                        border:
                            stage.id === "mythic"
                                ? "1px solid rgba(255, 215, 84, 0.28)"
                                : "1px solid rgba(159, 203, 175, 0.28)",
                    }}
                >
                    <Droplets size={20} color="#7CB89A" strokeWidth={2} />
                </div>

                <div>
                    <div
                        style={{
                            fontFamily: "'Noto Serif', serif",
                            fontSize: 16,
                            color: stage.id === "mythic" ? "#A37614" : "#8B6777",
                            fontWeight: 600,
                        }}
                    >
                        water the tree
                    </div>
                    <div
                        style={{
                            fontFamily: "'Noto Serif', serif",
                            fontSize: 12,
                            color: "#B892A4",
                            marginTop: 2,
                        }}
                    >
                        a tiny interaction to make the blossoms sway
                    </div>
                </div>
            </div>
        </motion.button>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const SakuraHero: React.FC = () => {
    const gb = STATIC_GUESTBOOK_COUNT;
    const fa = STATIC_FANART_COUNT;
    const wi = STATIC_WISH_COUNT;

    const [droplets, setDroplets] = useState<Droplet[]>([]);
    const [watered, setWatered] = useState(false);
    const blossomMap = useRef<BlossomMap>({ guestbook: [], fanart: [], wish: [] });

    const allBlossoms = useMemo(() => {
        blossomMap.current = reconcileBlossoms(blossomMap.current, gb, fa, wi);
        return [
            ...blossomMap.current.guestbook,
            ...blossomMap.current.fanart,
            ...blossomMap.current.wish,
        ];
    }, [gb, fa, wi]);

    const total = gb + fa + wi;
    const stage = getStage(total);

    const butterflies = useMemo(
        () => Array.from({ length: Math.floor(fa / 5) }, (_, i) => i),
        [fa]
    );
    const lanterns = useMemo(
        () => Array.from({ length: Math.floor(gb / 5) }, (_, i) => i),
        [gb]
    );
    const goldParticles =
        stage.id === "mythic" ? Array.from({ length: 18 }, (_, i) => i) : [];

    const handleWater = useCallback(() => {
        const drops: Droplet[] = Array.from({ length: 14 }, (_, i) => ({
            id: Date.now() + i,
            x: CX - 150 + sr(i * 19) * 300,
            y: 28 + sr(i * 19 + 7) * 90,
        }));

        setDroplets((d) => [...d, ...drops]);
        setWatered(true);

        setTimeout(() => setWatered(false), 2200);
    }, []);

    const removeDroplet = useCallback((id: number) => {
        setDroplets((d) => d.filter((x) => x.id !== id));
    }, []);

    const tc = stage.trunkColor;

    return (
        <section
            className="w-full py-8 md:py-10 lg:py-14"
            suppressHydrationWarning
        >
            <div className="w-full px-6 md:px-10 xl:px-[15%]">
                <div className="mx-auto w-full max-w-[1200px]">
                    <div
                        className="rounded-[32px] px-5 py-6 md:px-7 md:py-8 lg:px-10 lg:py-10 overflow-hidden"
                        style={{
                            background:
                                stage.id === "mythic"
                                    ? "linear-gradient(180deg, rgba(255,247,250,0.88), rgba(255,251,241,0.82))"
                                    : "linear-gradient(180deg, rgba(255,243,248,0.82), rgba(251,245,255,0.80))",
                            border: "1px solid rgba(236, 208, 221, 0.65)",
                            boxShadow: "0 18px 60px rgba(212, 177, 197, 0.12)",
                            backdropFilter: "blur(6px)",
                        }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,420px)_minmax(0,1fr)] gap-8 lg:gap-10 items-center">
                            {/* ── LEFT: INFO PANEL ───────────────────────────────────────────── */}
                            <motion.div
                                initial={{ opacity: 0, x: -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="flex flex-col gap-6 lg:gap-7"
                            >
                                <div>
                                    <p
                                        style={{
                                            fontFamily: "'Noto Serif', serif",
                                            fontSize: 11,
                                            color: "#C29CAE",
                                            letterSpacing: "0.20em",
                                            textTransform: "uppercase",
                                            margin: "0 0 8px",
                                        }}
                                    >
                                        Nair&apos;s Secret Garden
                                    </p>

                                    <h2
                                        style={{
                                            fontFamily: "'Noto Serif', serif",
                                            fontSize: "clamp(2rem, 3vw, 2.6rem)",
                                            color: stage.id === "mythic" ? "#B8860B" : "#A86080",
                                            margin: 0,
                                            fontWeight: 500,
                                            lineHeight: 1.15,
                                            transition: "color 1s",
                                        }}
                                    >
                                        our sakura tree
                                    </h2>

                                    <p
                                        style={{
                                            fontFamily: "'Noto Serif', serif",
                                            fontSize: 13,
                                            color: "#B892A4",
                                            letterSpacing: "0.04em",
                                            marginTop: 12,
                                            lineHeight: 1.7,
                                            maxWidth: 420,
                                        }}
                                    >
                                        every blossom is someone who showed up — little traces of love,
                                        support, and memories gathered in one place.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <StatCard
                                        label="total blossoms"
                                        value={total}
                                        accent={stage.id === "mythic" ? "#B8860B" : "#C47E95"}
                                    />
                                    <StatCard
                                        label="current stage"
                                        value={stage.label}
                                        accent={stage.id === "mythic" ? "#A37614" : "#9A7184"}
                                    />
                                </div>

                                <div
                                    className="rounded-[24px] px-5 py-4"
                                    style={{
                                        background: "rgba(255,255,255,0.62)",
                                        border: "1px solid rgba(239, 192, 213, 0.50)",
                                        boxShadow: "0 8px 30px rgba(214, 170, 193, 0.08)",
                                        backdropFilter: "blur(10px)",
                                    }}
                                >
                                    <div
                                        className="flex items-center gap-2 mb-1"
                                        style={{
                                            fontFamily: "'Noto Serif', serif",
                                            fontSize: 12,
                                            color: "#B892A4",
                                            letterSpacing: "0.10em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        <Sparkles size={13} color="#D39AB6" />
                                        blossom breakdown
                                    </div>

                                    <LegendRow color="#F48FB1" icon={BookHeart} label="guestbook" count={gb} />
                                    <div className="h-px bg-[rgba(239,192,213,0.35)]" />
                                    <LegendRow color="#F06292" icon={Palette} label="fanart" count={fa} />
                                    <div className="h-px bg-[rgba(239,192,213,0.35)]" />
                                    <LegendRow color="#CE93D8" icon={Coins} label="wishes" count={wi} />
                                </div>

                                <WaterAction onWater={handleWater} stage={stage} />
                            </motion.div>

                            {/* ── RIGHT: TREE PANEL ──────────────────────────────────────────── */}
                            <div className="relative w-full min-w-0">
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background: `radial-gradient(ellipse 60% 58% at 54% 42%, ${stage.glowColor} 0%, transparent 72%)`,
                                        transition: "background 1.5s",
                                        filter: "blur(2px)",
                                    }}
                                />

                                <div
                                    className="relative rounded-[28px] overflow-hidden"
                                    style={{
                                        background: "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.08))",
                                        border: "1px solid rgba(239, 192, 213, 0.30)",
                                    }}
                                >
                                    <svg
                                        viewBox="0 0 760 520"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-full h-auto min-h-[340px] md:min-h-[420px]"
                                        suppressHydrationWarning
                                        style={{ overflow: "visible" }}
                                    >
                                        {stage.id === "mythic" && (
                                            <motion.ellipse
                                                cx={380}
                                                cy={230}
                                                rx={210}
                                                ry={220}
                                                fill="none"
                                                stroke="rgba(255,215,100,0.16)"
                                                strokeWidth="28"
                                                animate={{ opacity: [0.4, 0.9, 0.4] }}
                                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                                            />
                                        )}

                                        {Array.from({ length: 18 }).map((_, i) => (
                                            <FallingPetal key={i} idx={i} stage={stage} />
                                        ))}

                                        <ellipse cx={CX} cy={VB_H - 10} rx={110} ry={12} fill="rgba(210,235,200,0.3)" />
                                        <LeafPile total={total} />

                                        <Branch
                                            d={`M ${CX - 5} ${TREE_BASE_Y} C ${CX - 7} 450 ${CX - 12} 390 ${CX - 8} 330 C ${CX - 4} 270 ${CX - 10} 240 ${CX - 2} 200 C ${CX + 2} 180 ${CX + 5} 160 ${CX} ${TREE_TOP_Y + 90}`}
                                            width={20}
                                            delay={0}
                                            color={tc}
                                        />
                                        <Branch
                                            d={`M ${CX - 2} ${TREE_BASE_Y} C ${CX - 4} 450 ${CX - 9} 390 ${CX - 5} 330 C ${CX - 1} 270 ${CX - 7} 240 ${CX + 1} 210`}
                                            width={6}
                                            delay={0.1}
                                            color={tc}
                                        />

                                        <Branch
                                            d={`M ${CX - 2} 200 C ${CX - 30} 175 ${CX - 70} 150 ${CX - 130} 110`}
                                            width={11}
                                            delay={0.8}
                                            color={tc}
                                        />
                                        <Branch
                                            d={`M ${CX - 65} 162 C ${CX - 95} 145 ${CX - 125} 130 ${CX - 160} 108`}
                                            width={7}
                                            delay={0.95}
                                            color={tc}
                                        />
                                        <Branch
                                            d={`M ${CX - 110} 138 C ${CX - 135} 140 ${CX - 165} 148 ${CX - 185} 165`}
                                            width={5}
                                            delay={1.05}
                                            color={tc}
                                        />

                                        <Branch
                                            d={`M ${CX - 2} 200 C ${CX + 28} 175 ${CX + 68} 150 ${CX + 128} 110`}
                                            width={11}
                                            delay={0.85}
                                            color={tc}
                                        />
                                        <Branch
                                            d={`M ${CX + 63} 162 C ${CX + 93} 145 ${CX + 123} 130 ${CX + 158} 108`}
                                            width={7}
                                            delay={1.0}
                                            color={tc}
                                        />
                                        <Branch
                                            d={`M ${CX + 108} 138 C ${CX + 133} 140 ${CX + 163} 148 ${CX + 183} 165`}
                                            width={5}
                                            delay={1.1}
                                            color={tc}
                                        />

                                        <Branch
                                            d={`M ${CX + 5} 160 C ${CX + 5} 135 ${CX + 2} 105 ${CX} ${TREE_TOP_Y}`}
                                            width={9}
                                            delay={0.9}
                                            color={tc}
                                        />

                                        {goldParticles.map((i) => (
                                            <GoldParticle key={i} idx={i} />
                                        ))}

                                        <AnimatePresence>
                                            {lanterns.map((i) => (
                                                <Lantern key={`lantern-${i}`} idx={i} />
                                            ))}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {allBlossoms.map((b) => (
                                                <BlossomFlower key={b.id} blossom={b} stage={stage} watered={watered} />
                                            ))}
                                        </AnimatePresence>

                                        <AnimatePresence>
                                            {butterflies.map((i) => (
                                                <Butterfly key={`butterfly-${i}`} idx={i} />
                                            ))}
                                        </AnimatePresence>

                                        {droplets.map((d) => (
                                            <WateringDroplet
                                                key={d.id}
                                                id={d.id}
                                                x={d.x}
                                                y={d.y}
                                                onDone={() => removeDroplet(d.id)}
                                            />
                                        ))}
                                    </svg>

                                    {/* floating helper tag inside tree panel */}
                                    <div className="absolute top-4 right-4">
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.8, duration: 0.45 }}
                                            className="rounded-full px-4 py-2"
                                            style={{
                                                background: "rgba(255,255,255,0.78)",
                                                border:
                                                    stage.id === "mythic"
                                                        ? "1px solid rgba(255,215,84,0.45)"
                                                        : "1px solid rgba(239,192,213,0.50)",
                                                backdropFilter: "blur(10px)",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontFamily: "'Noto Serif', serif",
                                                    fontSize: 12,
                                                    color: stage.id === "mythic" ? "#A37614" : "#B07E93",
                                                    letterSpacing: "0.04em",
                                                }}
                                            >
                                                stage: {stage.label}
                                            </span>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};