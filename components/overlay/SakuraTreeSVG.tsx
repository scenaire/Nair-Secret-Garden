"use client";

// components/overlay/SakuraTreeSVG.tsx
// Pure SVG sakura tree sized to fit inside TerrariumOverlay jar (300×250).
// Counts are fetched live from Supabase and updated via realtime channel.

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { OVERLAY_CHANNEL } from "./constants";
import type { OverlayPayload } from "./types";

// ─── Props — no longer needed externally, counts are self-fetched ─────────────
// Keep as optional override for testing/static usage
interface SakuraTreeSVGProps {
  gb?: number;
  fa?: number;
  wi?: number;
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
  trunkColor: string;
  blossomBoost: number;
}

// ─── SVG viewport — matches jar interior (300×250) ───────────────────────────

const VB_W = 300;
const VB_H = 250;
const CX = 150;
const TREE_BASE_Y = 238;
const TREE_TOP_Y = 32;

// ─── Tree stages ──────────────────────────────────────────────────────────────

function getStage(total: number): Stage {
  if (total >= 100) return { id: "mythic", trunkColor: "#B8845A", blossomBoost: 1.3 };
  if (total >= 60) return { id: "full", trunkColor: "#C4956A", blossomBoost: 1.1 };
  if (total >= 30) return { id: "blooming", trunkColor: "#C4956A", blossomBoost: 1.0 };
  if (total >= 10) return { id: "growing", trunkColor: "#C4956A", blossomBoost: 0.9 };
  return { id: "sprout", trunkColor: "#B8A090", blossomBoost: 0.8 };
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

// ─── Blossom zones (scaled to 300×250 jar) ───────────────────────────────────

const ZONES: Record<BlossomType, [number, number, number, number][]> = {
  guestbook: [
    [CX - 88, 28, CX - 18, 100], [CX + 18, 28, CX + 88, 100],
    [CX - 42, 90, CX + 42, 158], [CX - 118, 78, CX - 38, 135],
    [CX + 38, 78, CX + 118, 135],
  ],
  fanart: [
    [CX + 18, 28, CX + 88, 100], [CX - 88, 28, CX - 18, 100],
    [CX - 22, 16, CX + 22, 78], [CX + 42, 72, CX + 118, 128],
    [CX - 118, 72, CX - 42, 128],
  ],
  wish: [
    [CX - 42, 92, CX + 42, 165], [CX - 22, 16, CX + 22, 82],
    [CX - 100, 65, CX - 28, 118], [CX + 28, 65, CX + 100, 118],
    [CX - 65, 148, CX + 65, 200],
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
      return Math.sqrt(dx * dx + dy * dy) < (e.scale + candidate.scale) * 9;
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
  [CX - 78, 72], [CX - 105, 95], [CX - 58, 52],
  [CX + 78, 72], [CX + 105, 95], [CX + 58, 52],
  [CX, 30], [CX - 30, 108], [CX + 30, 108],
  [CX - 118, 118], [CX + 118, 118], [CX, 82],
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  const sx = r4(tip[0] + (sr(s + 3) - 0.5) * 24);
  const sy = r4(tip[1] + (sr(s + 6) - 0.5) * 15);
  const drift = r4((sr(s + 5) - 0.5) * 55);
  const dur = r4(4 + sr(s + 10) * 5);
  const delay = r4(sr(s + 15) * 10);
  const size = r4(3 + sr(s + 20) * 3);
  const cols = stage.id === "mythic"
    ? ["#FFF3C4", "#FFE0B2", "#E1F5FE"]
    : ["#F9C8D9", "#FFE4F0", "#E8D5F5"];
  return (
    <motion.g
      initial={{ x: sx, y: sy, opacity: 0, rotate: 0 }}
      animate={{
        x: [sx, sx + drift * 0.4, sx + drift],
        y: [sy, sy + 100, sy + 220],
        opacity: [0, 0.75, 0.5, 0],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeIn" }}
    >
      <ellipse cx={0} cy={0} rx={size} ry={size * 0.55} fill={cols[idx % cols.length]} />
    </motion.g>
  );
}

function BlossomFlower({ blossom, stage }: { blossom: Blossom; stage: Stage }) {
  const palette = stage.id === "mythic" ? MYTHIC_PETAL : PETAL;
  const c = palette[blossom.type];
  const size = r4(blossom.scale * 13 * stage.blossomBoost);
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
        <motion.circle cx={0} cy={0} r={size * 0.38} fill="none"
          stroke="rgba(255,215,100,0.25)" strokeWidth="0.8"
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 2.5 + sr(blossom.x) * 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "0px 0px" }} />
      )}
    </motion.g>
  );
}

function Lantern({ idx }: { idx: number }) {
  const s = idx * 61;
  const hx = r4(CX - 52 - sr(s) * 68);
  const hy = r4(58 + sr(s + 5) * 72);
  return (
    <motion.g
      initial={{ x: hx, y: hy - 15, opacity: 0, scale: 0 }}
      animate={{ x: hx, y: hy, opacity: 1, scale: 1 }}
      transition={{ delay: 1.8 + idx * 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <line x1={0} y1={-12} x2={0} y2={-5} stroke="#C4956A" strokeWidth="0.7" />
      <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 2.5 + sr(s + 20), repeat: Infinity, ease: "easeInOut" }}>
        <ellipse cx={0} cy={0} rx={5} ry={7} fill="rgba(255,220,140,0.9)" stroke="#E8A030" strokeWidth="0.6" />
        <ellipse cx={0} cy={0} rx={3} ry={4} fill="rgba(255,245,180,0.7)" />
        <ellipse cx={0} cy={-7} rx={4} ry={1.5} fill="#D4880A" />
        <ellipse cx={0} cy={7} rx={4} ry={1.5} fill="#D4880A" />
        <motion.ellipse cx={0} cy={0} rx={9} ry={11} fill="rgba(255,220,80,0.07)"
          animate={{ opacity: [0.07, 0.14, 0.07] }}
          transition={{ duration: 2 + sr(s + 25), repeat: Infinity, ease: "easeInOut" }} />
      </motion.g>
    </motion.g>
  );
}

function GoldParticle({ idx }: { idx: number }) {
  const s = idx * 41;
  const px = r4(CX - 125 + sr(s) * 250);
  const py = r4(25 + sr(s + 3) * 185);
  const size = r4(1.2 + sr(s + 6) * 2);
  return (
    <motion.circle cx={0} cy={0} r={size} fill="#FFD54F"
      initial={{ x: px, y: py, opacity: 0, scale: 0 }}
      animate={{ x: px, y: [py, py - 14, py], opacity: [0, 0.9, 0.5, 0], scale: [0, 1, 0.8, 0] }}
      transition={{ delay: sr(s + 15) * 4, duration: 2.5 + sr(s + 20) * 2, repeat: Infinity, ease: "easeInOut" }} />
  );
}

function LeafPile({ total }: { total: number }) {
  const count = Math.min(8, Math.max(2, Math.floor(total * 0.3)));
  const colors = ["#F9C8D9", "#F48FB1", "#FFE4F0", "#E8D5F5", "#CE93D8", "#FFF3C4"];
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const s = i * 43;
        const lx = r4(CX - 35 + sr(s) * 70);
        const angle = r4((sr(s + 3) - 0.5) * 60);
        const lw = r4(7 + sr(s + 6) * 7);
        const lh = r4(3 + sr(s + 9) * 3);
        return (
          <motion.g key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.65, scale: 1 }}
            transition={{ delay: 1.2 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${lx}px ${TREE_BASE_Y - 4}px` }}
          >
            <ellipse cx={lx} cy={TREE_BASE_Y - 4} rx={lw} ry={lh}
              fill={colors[i % colors.length]}
              transform={`rotate(${angle}, ${lx}, ${TREE_BASE_Y - 4})`} />
          </motion.g>
        );
      })}
    </g>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const SakuraTreeSVG: React.FC<SakuraTreeSVGProps> = ({
  gb: gbProp,
  fa: faProp,
  wi: wiProp,
}) => {
  const [mounted, setMounted] = useState(false);

  // Live counts — start from props (for static/testing) then update from Supabase
  const [gb, setGb] = useState(gbProp ?? 0);
  const [fa, setFa] = useState(faProp ?? 0);
  const [wi, setWi] = useState(wiProp ?? 0);

  const blossomMap = useRef<BlossomMap>({ guestbook: [], fanart: [], wish: [] });

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    async function load() {
      const supabase = createClient();
      const [
        { count: gbCount },
        { count: faCount },
        { count: wcCount },
        { count: wsCount },
      ] = await Promise.all([
        supabase.from("guestbook_entries").select("id", { count: "exact", head: true }),
        supabase.from("fanart_submissions").select("id", { count: "exact", head: true }),
        supabase.from("wish_contributions").select("id", { count: "exact", head: true }),
        supabase.from("wish_surprises").select("id", { count: "exact", head: true }),
      ]);
      setGb(gbCount ?? 0);
      setFa(faCount ?? 0);
      setWi((wcCount ?? 0) + (wsCount ?? 0));
    }

    load();
  }, []);

  // ── Realtime updates ───────────────────────────────────────────────────────
  const handleEvent = useCallback((payload: OverlayPayload) => {
    if (payload.type === "seed") setGb(n => n + 1);
    if (payload.type === "bloom") setFa(n => n + 1);
    if (payload.type === "wish_contribution") setWi(n => n + 1);
    if (payload.type === "wish_surprise") setWi(n => n + 1);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(OVERLAY_CHANNEL)
      .on("broadcast", { event: "garden-event" }, ({ payload }) => {
        if (!payload?.type) return;
        handleEvent(payload as OverlayPayload);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [handleEvent]);

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
  const lanterns = useMemo(() => Array.from({ length: Math.floor(gb / 5) }, (_, i) => i), [gb]);
  const goldParticles = stage.id === "mythic" ? Array.from({ length: 10 }, (_, i) => i) : [];
  const tc = stage.trunkColor;

  if (!mounted) return null;

  return (
    // Sits as absolute layer inside jarZoneRef — clipped by jarClip from JarSharedDefs
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={VB_W}
      height={VB_H}
      xmlns="http://www.w3.org/2000/svg"
      clipPath="url(#jarClip)"
      suppressHydrationWarning
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {/* Scale tree to ~62% and anchor trunk base at jar bottom (~y 234) */}
      <g transform={`translate(${CX}, 225) scale(0.70) translate(-${CX}, -${TREE_BASE_Y})`}>
        {/* Mythic gold ring */}
        {stage.id === "mythic" && (
          <motion.ellipse cx={CX} cy={130} rx={115} ry={118}
            fill="none" stroke="rgba(255,215,100,0.12)" strokeWidth="14"
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
        )}

        {/* Falling petals — clipped inside jar */}
        {Array.from({ length: 14 }).map((_, i) => <FallingPetal key={i} idx={i} stage={stage} />)}

        {/* Ground */}
        <ellipse cx={CX} cy={VB_H - 6} rx={72} ry={8} fill="rgba(210,235,200,0.22)" />

        {/* Leaf pile */}
        <LeafPile total={total} />

        {/* Trunk */}
        <Branch d={`M ${CX - 3} ${TREE_BASE_Y} C ${CX - 4} 210 ${CX - 7} 182 ${CX - 4} 158 C ${CX - 1} 135 ${CX - 5} 120 ${CX - 1} 105 C ${CX + 1} 92 ${CX + 3} 80 ${CX} ${TREE_TOP_Y + 42}`} width={11} delay={0} color={tc} />
        <Branch d={`M ${CX - 1} ${TREE_BASE_Y} C ${CX - 2} 210 ${CX - 4} 182 ${CX - 2} 158 C ${CX} 135 ${CX - 3} 120 ${CX + 1} 118`} width={3} delay={0.1} color={tc} />

        {/* Left branches */}
        <Branch d={`M ${CX - 1} 105 C ${CX - 16} 92 ${CX - 38} 80 ${CX - 72} 58`} width={6} delay={0.8} color={tc} />
        <Branch d={`M ${CX - 36} 88 C ${CX - 52} 78 ${CX - 68} 70 ${CX - 88} 58`} width={4} delay={0.95} color={tc} />
        <Branch d={`M ${CX - 62} 75 C ${CX - 75} 76 ${CX - 92} 80 ${CX - 104} 90`} width={2.5} delay={1.05} color={tc} />

        {/* Right branches */}
        <Branch d={`M ${CX - 1} 105 C ${CX + 14} 92 ${CX + 36} 80 ${CX + 70} 58`} width={6} delay={0.85} color={tc} />
        <Branch d={`M ${CX + 34} 88 C ${CX + 50} 78 ${CX + 66} 70 ${CX + 86} 58`} width={4} delay={1.0} color={tc} />
        <Branch d={`M ${CX + 60} 75 C ${CX + 73} 76 ${CX + 90} 80 ${CX + 102} 90`} width={2.5} delay={1.1} color={tc} />

        {/* Centre upward */}
        <Branch d={`M ${CX + 2} 80 C ${CX + 2} 68 ${CX + 1} 54 ${CX} ${TREE_TOP_Y}`} width={5} delay={0.9} color={tc} />

        {goldParticles.map((i) => <GoldParticle key={i} idx={i} />)}

        <AnimatePresence>
          {lanterns.map((i) => <Lantern key={`lantern-${i}`} idx={i} />)}
        </AnimatePresence>

        <AnimatePresence>
          {allBlossoms.map((b) => (
            <BlossomFlower key={b.id} blossom={b} stage={stage} />
          ))}
        </AnimatePresence>
      </g>
    </svg>
  );
};