"use client";

// components/overlay/SakuraOverlay.tsx
// Stream overlay version of the sakura tree.
// - Transparent background
// - Tree anchored top-left
// - No title, legend, or watering system
//
// Usage in app/overlay/page.tsx:
//   import { SakuraOverlay } from "@/components/overlay/SakuraOverlay";
//   <SakuraOverlay gb={13} fa={3} wi={3} />

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SakuraOverlayProps {
    gb: number;   // guestbook count
    fa: number;   // fanart count
    wi: number;   // wish count
}

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

// ─── SVG viewport ─────────────────────────────────────────────────────────────
// Tree is designed to sit in the top-left corner.
// viewBox starts from 0,0 — tree trunk at CX.

const VB_W = 480;
const VB_H = 480;
const CX = 220;          // tree centre x (left-biased)
const TREE_BASE_Y = 460;
const TREE_TOP_Y = 40;

// ─── Tree stages ──────────────────────────────────────────────────────────────

function getStage(total: number): Stage {
    if (total >= 100) return { id: "mythic", label: "mythic bloom", trunkColor: "#B8845A", glowColor: "rgba(255,215,100,0.28)", blossomBoost: 1.3 };
    if (total >= 60) return { id: "full", label: "full bloom", trunkColor: "#C4956A", glowColor: "rgba(249,200,217,0.22)", blossomBoost: 1.1 };
    if (total >= 30) return { id: "blooming", label: "blooming", trunkColor: "#C4956A", glowColor: "rgba(249,200,217,0.15)", blossomBoost: 1.0 };
    if (total >= 10) return { id: "growing", label: "growing", trunkColor: "#C4956A", glowColor: "rgba(200,220,200,0.12)", blossomBoost: 0.9 };
    return { id: "sprout", label: "young sprout", trunkColor: "#B8A090", glowColor: "rgba(200,220,200,0.08)", blossomBoost: 0.8 };
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
        [CX - 145, 40, CX - 30, 140], [CX + 30, 40, CX + 145, 140],
        [CX - 65, 130, CX + 65, 220], [CX - 185, 110, CX - 60, 188],
        [CX + 60, 110, CX + 185, 188],
    ],
    fanart: [
        [CX + 30, 40, CX + 145, 140], [CX - 145, 40, CX - 30, 140],
        [CX - 35, 25, CX + 35, 105], [CX + 65, 108, CX + 185, 182],
        [CX - 185, 108, CX - 65, 182],
    ],
    wish: [
        [CX - 65, 130, CX + 65, 230], [CX - 35, 25, CX + 35, 110],
        [CX - 160, 92, CX - 45, 172], [CX + 45, 92, CX + 160, 172],
        [CX - 105, 215, CX + 105, 295],
    ],
};

// ─── Blossom placement ────────────────────────────────────────────────────────

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

// ─── Branch tips (for falling petals) ────────────────────────────────────────

const BRANCH_TIPS: [number, number][] = [
    [CX - 125, 108], [CX - 168, 148], [CX - 92, 78],
    [CX + 125, 108], [CX + 168, 148], [CX + 92, 78],
    [CX, 42], [CX - 48, 165], [CX + 48, 165],
    [CX - 188, 182], [CX + 188, 182], [CX, 128],
];

// ─── SVG sub-components ───────────────────────────────────────────────────────

function Branch({ d, width, delay, color }: { d: string; width: number; delay: number; color: string }) {
    return (
        <motion.path
            d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
        />
    );
}

function FallingPetal({ idx, stage }: { idx: number; stage: Stage }) {
    const s = idx * 53;
    const tip = BRANCH_TIPS[idx % BRANCH_TIPS.length];
    const sx = r4(tip[0] + (sr(s + 3) - 0.5) * 36);
    const sy = r4(tip[1] + (sr(s + 6) - 0.5) * 22);
    const drift = r4((sr(s + 5) - 0.5) * 75);
    const dur = r4(5 + sr(s + 10) * 6);
    const delay = r4(sr(s + 15) * 12);
    const size = r4(4 + sr(s + 20) * 4);
    const cols = stage.id === "mythic"
        ? ["#FFF3C4", "#FFE0B2", "#E1F5FE"]
        : ["#F9C8D9", "#FFE4F0", "#E8D5F5"];
    return (
        <motion.g
            initial={{ x: sx, y: sy, opacity: 0, rotate: 0 }}
            animate={{ x: [sx, sx + drift * 0.4, sx + drift], y: [sy, sy + 180, sy + 430], opacity: [0, 0.7, 0.5, 0], rotate: [0, 180, 360] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "easeIn" }}
        >
            <ellipse cx={0} cy={0} rx={size} ry={size * 0.55} fill={cols[idx % cols.length]} />
        </motion.g>
    );
}

function BlossomFlower({ blossom, stage }: { blossom: Blossom; stage: Stage }) {
    const palette = stage.id === "mythic" ? MYTHIC_PETAL : PETAL;
    const c = palette[blossom.type];
    const size = r4(blossom.scale * 18 * stage.blossomBoost);
    return (
        <motion.g
            initial={{ x: blossom.x, y: blossom.y, scale: 0, opacity: 0 }}
            animate={{ x: blossom.x, y: blossom.y, scale: 1, opacity: 1 }}
            transition={{ scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.5 } }}
        >
            {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx={0} cy={-size * 0.55} rx={size * 0.38} ry={size * 0.55}
                    fill={c.fill}
                    stroke={stage.id === "mythic" ? "rgba(255,220,80,0.4)" : "#F8BBD0"}
                    strokeWidth="0.5" transform={`rotate(${a + blossom.rotation})`} />
            ))}
            <circle cx={0} cy={0} r={size * 0.22} fill={c.center} opacity={0.85} />
            <circle cx={0} cy={0} r={size * 0.12} fill="#fff" opacity={0.6} />
            {stage.id === "mythic" && (
                <motion.circle cx={0} cy={0} r={size * 0.38} fill="none" stroke="rgba(255,215,100,0.25)" strokeWidth="1"
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
                    transition={{ duration: 2.5 + sr(blossom.x) * 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "0px 0px" }} />
            )}
        </motion.g>
    );
}

function Butterfly({ idx }: { idx: number }) {
    const s = idx * 79;
    const px = r4(CX + 60 + sr(s) * 110);
    const py = r4(80 + sr(s + 5) * 110);
    const fy = r4(py - 8 - sr(s + 10) * 6);
    const wingDur = r4(0.5 + sr(s + 30) * 0.4);
    return (
        <motion.g
            initial={{ x: px, y: py - 20, opacity: 0, scale: 0 }}
            animate={{ x: px, y: [py, fy, py], opacity: 1, scale: 1 }}
            transition={{
                opacity: { delay: 1.5 + idx * 0.45, duration: 0.6 },
                scale: { delay: 1.5 + idx * 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                y: { delay: 2 + idx * 0.45, duration: 3 + sr(s + 20) * 2, repeat: Infinity, ease: "easeInOut" },
            }}
        >
            <motion.ellipse cx={-7} cy={-3} rx={9} ry={6} fill="#F48FB1" opacity={0.82}
                animate={{ scaleX: [1, 0.3, 1] }} transition={{ duration: wingDur, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "0 0" }} />
            <motion.ellipse cx={7} cy={-3} rx={9} ry={6} fill="#F06292" opacity={0.82}
                animate={{ scaleX: [1, 0.3, 1] }} transition={{ duration: wingDur, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "0 0" }} />
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
    const hx = r4(CX - 75 - sr(s) * 100);
    const hy = r4(80 + sr(s + 5) * 95);
    return (
        <motion.g
            initial={{ x: hx, y: hy - 22, opacity: 0, scale: 0 }}
            animate={{ x: hx, y: hy, opacity: 1, scale: 1 }}
            transition={{ delay: 1.8 + idx * 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
            <line x1={0} y1={-18} x2={0} y2={-8} stroke="#C4956A" strokeWidth="0.8" />
            <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 2.5 + sr(s + 20), repeat: Infinity, ease: "easeInOut" }}>
                <ellipse cx={0} cy={0} rx={7} ry={10} fill="rgba(255,220,140,0.9)" stroke="#E8A030" strokeWidth="0.7" />
                <ellipse cx={0} cy={0} rx={4} ry={6} fill="rgba(255,245,180,0.7)" />
                <ellipse cx={0} cy={-10} rx={5} ry={2} fill="#D4880A" />
                <ellipse cx={0} cy={10} rx={5} ry={2} fill="#D4880A" />
                {([-4, 0, 4] as number[]).map((rx) => (
                    <line key={rx} x1={rx} y1={-10} x2={rx} y2={10} stroke="rgba(200,140,0,0.3)" strokeWidth="0.5" />
                ))}
                <motion.ellipse cx={0} cy={0} rx={13} ry={16} fill="rgba(255,220,80,0.07)"
                    animate={{ opacity: [0.07, 0.14, 0.07] }}
                    transition={{ duration: 2 + sr(s + 25), repeat: Infinity, ease: "easeInOut" }} />
            </motion.g>
        </motion.g>
    );
}

function GoldParticle({ idx }: { idx: number }) {
    const s = idx * 41;
    const px = r4(CX - 200 + sr(s) * 400);
    const py = r4(35 + sr(s + 3) * 270);
    const size = r4(2 + sr(s + 6) * 3);
    return (
        <motion.circle cx={0} cy={0} r={size} fill="#FFD54F"
            initial={{ x: px, y: py, opacity: 0, scale: 0 }}
            animate={{ x: px, y: [py, py - 20, py], opacity: [0, 0.9, 0.5, 0], scale: [0, 1, 0.8, 0] }}
            transition={{ delay: sr(s + 15) * 4, duration: 2.5 + sr(s + 20) * 2, repeat: Infinity, ease: "easeInOut" }} />
    );
}

function LeafPile({ total }: { total: number }) {
    const count = Math.min(10, Math.max(2, Math.floor(total * 0.35)));
    const colors = ["#F9C8D9", "#F48FB1", "#FFE4F0", "#E8D5F5", "#CE93D8", "#FFF3C4"];
    return (
        <g>
            {Array.from({ length: count }).map((_, i) => {
                const s = i * 43;
                const lx = r4(CX - 48 + sr(s) * 96);
                const angle = r4((sr(s + 3) - 0.5) * 60);
                const lw = r4(9 + sr(s + 6) * 9);
                const lh = r4(4 + sr(s + 9) * 4);
                return (
                    <motion.g
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.65, scale: 1 }}
                        transition={{ delay: 1.2 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: `${lx}px ${TREE_BASE_Y - 5}px` }}
                    >
                        <ellipse cx={lx} cy={TREE_BASE_Y - 5} rx={lw} ry={lh}
                            fill={colors[i % colors.length]}
                            transform={`rotate(${angle}, ${lx}, ${TREE_BASE_Y - 5})`} />
                    </motion.g>
                );
            })}
        </g>
    );
}

function StageBadge({ stage }: { stage: Stage }) {
    return (
        <motion.g key={stage.id}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }}
        >
            <rect x={CX - 52} y={VB_H - 44} width={104} height={20} rx={10}
                fill="rgba(255,255,255,0.7)"
                stroke={stage.id === "mythic" ? "#FFD54F" : "#F9C8D9"} strokeWidth="1" />
            <text x={CX} y={VB_H - 29} textAnchor="middle" fontSize="9"
                fill={stage.id === "mythic" ? "#B8860B" : "#C47E95"}
                fontFamily="Georgia" letterSpacing="0.09em">
                {stage.label}
            </text>
        </motion.g>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const SakuraOverlay: React.FC<SakuraOverlayProps> = ({ gb, fa, wi }) => {
    const [mounted, setMounted] = useState(false);
    const blossomMap = useRef<BlossomMap>({ guestbook: [], fanart: [], wish: [] });

    useEffect(() => { setMounted(true); }, []);

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
    const butterflies = useMemo(() => Array.from({ length: Math.floor(fa / 5) }, (_, i) => i), [fa]);
    const lanterns = useMemo(() => Array.from({ length: Math.floor(gb / 5) }, (_, i) => i), [gb]);
    const goldParticles = stage.id === "mythic" ? Array.from({ length: 14 }, (_, i) => i) : [];
    const tc = stage.trunkColor;

    if (!mounted) return null;

    return (
        // Transparent background, fixed size for OBS browser source (adjust as needed)
        <div
            className="relative"
            suppressHydrationWarning
            style={{ width: VB_W, height: VB_H, background: "transparent" }}
        >
            {/* Subtle ambient glow — still looks good over dark stream bg */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `radial-gradient(ellipse 72% 66% at 48% 42%, ${stage.glowColor} 0%, transparent 70%)`,
                    transition: "background 1.5s",
                }}
            />

            <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                width={VB_W}
                height={VB_H}
                xmlns="http://www.w3.org/2000/svg"
                suppressHydrationWarning
                style={{ overflow: "visible", display: "block" }}
            >
                {/* Mythic gold ring */}
                {stage.id === "mythic" && (
                    <motion.ellipse cx={CX} cy={210} rx={188} ry={198}
                        fill="none" stroke="rgba(255,215,100,0.14)" strokeWidth="24"
                        animate={{ opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
                )}

                {/* Falling petals */}
                {Array.from({ length: 16 }).map((_, i) => <FallingPetal key={i} idx={i} stage={stage} />)}

                {/* Ground */}
                <ellipse cx={CX} cy={VB_H - 8} rx={95} ry={10} fill="rgba(210,235,200,0.25)" />

                {/* Leaf pile */}
                <LeafPile total={total} />

                {/* Trunk */}
                <Branch d={`M ${CX - 4} ${TREE_BASE_Y} C ${CX - 6} 400 ${CX - 10} 345 ${CX - 6} 290 C ${CX - 2} 238 ${CX - 8} 210 ${CX - 1} 178 C ${CX + 2} 158 ${CX + 4} 140 ${CX} ${TREE_TOP_Y + 72}`} width={18} delay={0} color={tc} />
                <Branch d={`M ${CX - 2} ${TREE_BASE_Y} C ${CX - 3} 400 ${CX - 7} 345 ${CX - 3} 290 C ${CX} 238 ${CX - 5} 210 ${CX + 1} 188`} width={5} delay={0.1} color={tc} />

                {/* Left branches */}
                <Branch d={`M ${CX - 1} 178 C ${CX - 26} 156 ${CX - 62} 133 ${CX - 115} 96`} width={10} delay={0.8} color={tc} />
                <Branch d={`M ${CX - 58} 144 C ${CX - 85} 128 ${CX - 110} 115 ${CX - 142} 95`} width={6} delay={0.95} color={tc} />
                <Branch d={`M ${CX - 98} 122 C ${CX - 120} 124 ${CX - 148} 132 ${CX - 166} 148`} width={4} delay={1.05} color={tc} />

                {/* Right branches */}
                <Branch d={`M ${CX - 1} 178 C ${CX + 24} 156 ${CX + 60} 133 ${CX + 113} 96`} width={10} delay={0.85} color={tc} />
                <Branch d={`M ${CX + 56} 144 C ${CX + 83} 128 ${CX + 108} 115 ${CX + 140} 95`} width={6} delay={1.0} color={tc} />
                <Branch d={`M ${CX + 96} 122 C ${CX + 118} 124 ${CX + 146} 132 ${CX + 164} 148`} width={4} delay={1.1} color={tc} />

                {/* Centre upward */}
                <Branch d={`M ${CX + 4} 140 C ${CX + 4} 118 ${CX + 2} 92 ${CX} ${TREE_TOP_Y}`} width={8} delay={0.9} color={tc} />

                {goldParticles.map((i) => <GoldParticle key={i} idx={i} />)}

                <AnimatePresence>
                    {lanterns.map((i) => <Lantern key={`lantern-${i}`} idx={i} />)}
                </AnimatePresence>

                <AnimatePresence>
                    {allBlossoms.map((b) => (
                        <BlossomFlower key={b.id} blossom={b} stage={stage} />
                    ))}
                </AnimatePresence>

                <AnimatePresence>
                    {butterflies.map((i) => <Butterfly key={`butterfly-${i}`} idx={i} />)}
                </AnimatePresence>

                {/* Stage badge */}
                <AnimatePresence mode="wait">
                    <StageBadge key={stage.id} stage={stage} />
                </AnimatePresence>

                {/* Blossom count badge — top-right corner */}
                <motion.g
                    initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <circle cx={VB_W - 44} cy={44} r={34}
                        fill="rgba(255,255,255,0.78)"
                        stroke={stage.id === "mythic" ? "#FFD54F" : "#F9C8D9"} strokeWidth="1.2" />
                    <text x={VB_W - 44} y={38} textAnchor="middle" fontSize="17" fontWeight="700"
                        fill={stage.id === "mythic" ? "#B8860B" : "#C47E95"} fontFamily="Georgia">
                        {total}
                    </text>
                    <text x={VB_W - 44} y={54} textAnchor="middle" fontSize="8" fill="#D4A0B5"
                        fontFamily="Georgia" letterSpacing="0.5">
                        blossoms
                    </text>
                </motion.g>
            </svg>
        </div>
    );
};