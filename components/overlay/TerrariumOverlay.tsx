// components/overlay/TerrariumOverlay.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import { JarSVG } from "./JarSVG";
import { RibbonLabel } from "./RibbonLabel";
import { NotifToast, type ToastItem } from "./NotifToast";
import { PolaroidCard } from "./PolaroidCard";
import { DaisySVG, TulipSVG, CosmosSVG, RoseSVG, LilySVG } from "./flowers/FlowerSVGs";
import { useJarPhysics } from "./hooks/useJarPhysics";
import { useGardenChannel } from "./hooks/useGardenChannel";
import { useFlowerQueue, type BloomJob } from "./hooks/useFlowerQueue";
import { useInitialLoad } from "./hooks/useInitialLoad";
import {
    resolveTheme, rollFlower, getPhase, FLOWER_PALETTES,
    JAR, SEED_R, MAX_SEEDS,
    type FlowerType,
} from "./constants";
import type { OverlayPayload, PlacedFlower } from "./types";

// ── Sounds ────────────────────────────────────────────────────────────────────
function playBell(phase: 1 | 2 | 3) {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const vol = phase === 1 ? 0.12 : phase === 2 ? 0.15 : 0.17;
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = "sine"; o.frequency.value = f;
            const t = ctx.currentTime + i * 0.13;
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
            o.start(t); o.stop(t + 0.9);
        });
    } catch (_) { }
}

function playSparkle(phase: 1 | 2 | 3) {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const base = [523.25, 659.25, 880, 1108.73];
        const ext = phase >= 2 ? [1318.51] : [];
        const ext3 = phase === 3 ? [1760, 2093] : [];
        const vol = phase === 1 ? 0.09 : phase === 2 ? 0.11 : 0.13;
        [...base, ...ext, ...ext3].forEach((f, i) => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.type = "triangle"; o.frequency.value = f;
            const t = ctx.currentTime + i * 0.09;
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
            o.start(t); o.stop(t + 0.7);
        });
    } catch (_) { }
}

function playPolaroidSound() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01));
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = buf; g.gain.value = 0.12;
        src.connect(g); g.connect(ctx.destination); src.start();
        [1318.51, 1760].forEach((f, i) => {
            const o = ctx.createOscillator(), gn = ctx.createGain();
            o.connect(gn); gn.connect(ctx.destination); o.type = "sine"; o.frequency.value = f;
            const t = ctx.currentTime + 0.05 + i * 0.12;
            gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(0.09, t + 0.02);
            gn.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            o.start(t); o.stop(t + 0.6);
        });
    } catch (_) { }
}

// ── Wiggle ────────────────────────────────────────────────────────────────────
function triggerWiggle(el: HTMLElement | null, phase: 1 | 2 | 3) {
    if (!el) return;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = phase === 3
        ? "wigFirm 0.5s ease-in-out"
        : "wigNormal 0.42s ease-in-out";
    setTimeout(() => { if (el) el.style.animation = ""; }, 520);
}

// ── Build flower placement ────────────────────────────────────────────────────
function buildFlowerData(surfaceY: number, ratio: number, flowerIdx: number): Omit<PlacedFlower, "id"> {
    const phase = getPhase(ratio);
    const scaleFactor = phase === 1 ? 0.78 : phase === 2 ? 0.92 : 1.0;
    const stemH = Math.round((28 + Math.random() * 18) * scaleFactor);
    const flowerW = Math.round(34 * scaleFactor);
    const baseY = Math.max(JAR.NECK_Y + 10, Math.min(surfaceY + 2, JAR.BOTTOM - 4));
    const topY = baseY - stemH;
    const x = JAR.LEFT + flowerW / 2 + 10 + Math.random() * (JAR.WIDTH - flowerW - 20);
    const swayRange = phase === 1 ? 2.5 : phase === 2 ? 4 : 6;
    return {
        x, topY, baseY, stemH, flowerW, scaleFactor,
        flowerType: rollFlower(),
        paletteIdx: flowerIdx % FLOWER_PALETTES.length,
        swayFrom: `${(-swayRange * 0.6 - Math.random() * swayRange * 0.4).toFixed(1)}deg`,
        swayTo: `${(swayRange * 0.5 + Math.random() * swayRange * 0.5).toFixed(1)}deg`,
        swayDur: `${(3.2 + Math.random() * 2).toFixed(1)}s`,
        growDur: `${(0.9 + Math.random() * 0.3).toFixed(2)}s`,
    };
}

// ── Flower renderer ───────────────────────────────────────────────────────────
function FlowerElement({ flower }: { flower: PlacedFlower }) {
    const pal = FLOWER_PALETTES[flower.paletteIdx];
    const uid = flower.id;
    const props = { palette: pal, stemH: flower.stemH, flowerW: flower.flowerW, uid, scaleFactor: flower.scaleFactor };
    const FlowerMap: Record<FlowerType, React.FC<typeof props>> = {
        daisy: DaisySVG, tulip: TulipSVG, cosmos: CosmosSVG, rose: RoseSVG, lily: LilySVG,
    };
    const FlowerComp = FlowerMap[flower.flowerType as FlowerType] ?? DaisySVG;

    return (
        <div style={{
            position: "absolute",
            left: flower.x - flower.flowerW / 2,
            top: flower.topY,
            width: flower.flowerW,
            height: flower.stemH + 16,
            opacity: 0,
            transformOrigin: "bottom center",
            animation: `flowerGrow ${flower.growDur} cubic-bezier(0.34,1.4,0.64,1) forwards`,
            pointerEvents: "none",
        }}>
            <div style={{
                animation: `flowerSway ${flower.swayDur} ease-in-out infinite alternate`,
                transformOrigin: "bottom center",
                ["--sf" as any]: flower.swayFrom,
                ["--st" as any]: flower.swayTo,
            }}>
                <FlowerComp {...props} />
            </div>
        </div>
    );
}

// ── Glow helpers ──────────────────────────────────────────────────────────────
function computeGlowStyle(ratio: number, glowRgb: [number, number, number]) {
    const phase = getPhase(ratio);
    const [r, g, b] = glowRgb;
    let op: number, w: number, h: number, blur: number;
    if (phase === 1) { op = ratio * 0.28; w = 80 + ratio * 35; h = 18 + ratio * 8; blur = 12; }
    else if (phase === 2) { op = 0.08 + ratio * 0.32; w = 115 + ratio * 45; h = 28 + ratio * 12; blur = 16; }
    else { op = 0.22 + ratio * 0.20; w = 155 + ratio * 38; h = 42 + ratio * 14; blur = 22; }
    return {
        opacity: op,
        width: `${w}px`,
        height: `${h}px`,
        filter: `blur(${blur}px)`,
        background: `radial-gradient(ellipse,rgba(${r},${g},${b},${(op * 1.5).toFixed(2)}) 0%,rgba(${r},${g},${b},${(op * 0.4).toFixed(2)}) 45%,transparent 75%)`,
    };
}

function computeShimmerOpacity(ratio: number): number {
    const phase = getPhase(ratio);
    if (phase === 1) return 0;
    if (phase === 2) return Math.min((ratio - 0.3) / 0.25, 1) * 0.5;
    return 0.5 + Math.min((ratio - 0.7) / 0.2, 1) * 0.38;
}

// ══════════════════════════════════════════════════════════════════════════════
export function TerrariumOverlay() {
    const jarZoneRef = useRef<HTMLDivElement>(null);
    const ballLayerRef = useRef<HTMLDivElement>(null);

    const [totalCount, setTotalCount] = useState(0);
    const [flowers, setFlowers] = useState<PlacedFlower[]>([]);
    const [glowRgb, setGlowRgb] = useState<[number, number, number]>([255, 225, 160]);
    const [lastType, setLastType] = useState<"seed" | "bloom" | null>(null);
    const [lastUsername, setLastUsername] = useState<string | null>(null);
    const [toastQueue, setToastQueue] = useState<ToastItem[]>([]);
    const [polaroid, setPolaroid] = useState<{ username: string; imageUrl?: string; rotation: number } | null>(null);

    const flowerIdxRef = useRef(0);
    const { spawnSeed, spawnSeedBatch, getSeedSurface } = useJarPhysics(ballLayerRef);

    // ── Initial load from DB ──────────────────────────────────────────────────
    useInitialLoad({
        onSeedsLoaded: async (seeds) => {
            // Spawn all existing seeds as a batch (no sound, no notification)
            const styles = seeds.map(s => {
                const theme = resolveTheme(s.themeKey);
                return { bg: theme.bg, border: theme.border, glow: theme.glow };
            });
            await spawnSeedBatch(styles);
            // Update glow to last seed's color
            if (styles.length > 0) setGlowRgb(styles[styles.length - 1].glow);
        },
        onFlowersLoaded: (initialFlowers) => {
            setFlowers(initialFlowers);
        },
        onCountSet: (count) => {
            setTotalCount(count);
        },
        onLastEventSet: (type, username) => {
            setLastType(type);
            setLastUsername(username);
        },
        getSeedSurface,
    });

    // ── Handle incoming seed (realtime) ───────────────────────────────────────
    const handleSeed = useCallback(async (payload: Extract<OverlayPayload, { type: "seed" }>) => {
        const theme = resolveTheme(payload.themeKey);
        const ratio = totalCount / MAX_SEEDS;
        const phase = getPhase(ratio);
        await spawnSeed({ bg: theme.bg, border: theme.border, glow: theme.glow });
        setTotalCount(c => c + 1);
        setGlowRgb(theme.glow);
        setLastType("seed");
        setLastUsername(payload.username);
        setToastQueue(q => [...q, {
            id: `${Date.now()}`, username: payload.username,
            type: "seed", dotColor: theme.noteDot,
        }]);
        triggerWiggle(jarZoneRef.current, phase);
        playBell(phase);
    }, [totalCount, spawnSeed]);

    // ── Handle bloom job (serialized via queue) ───────────────────────────────
    const handleBloomJob = useCallback((job: BloomJob, done: () => void) => {
        const ratio = totalCount / MAX_SEEDS;
        const phase = getPhase(ratio);
        const rotation = -5 + Math.random() * 10;

        setPolaroid({ username: job.username, imageUrl: job.imageUrl, rotation });
        playPolaroidSound();

        setTimeout(() => {
            setPolaroid(null);
            setTimeout(() => {
                const surfaceY = getSeedSurface();
                const flowerData = buildFlowerData(surfaceY, ratio, flowerIdxRef.current++);
                setFlowers(f => [...f, { ...flowerData, id: `flower-${Date.now()}-${Math.random()}` }]);
                setTotalCount(c => c + 1);
                setLastType("bloom");
                setLastUsername(job.username);
                setToastQueue(q => [...q, {
                    id: `${Date.now()}`, username: job.username,
                    type: "bloom", dotColor: "#d4c870",
                }]);
                triggerWiggle(jarZoneRef.current, phase);
                playSparkle(phase);
                done();
            }, 80);
        }, 2500);
    }, [totalCount, getSeedSurface]);

    const { enqueue: enqueueBloom } = useFlowerQueue(handleBloomJob);

    const handleEvent = useCallback((payload: OverlayPayload) => {
        if (payload.type === "seed") handleSeed(payload);
        if (payload.type === "bloom") enqueueBloom(payload);
    }, [handleSeed, enqueueBloom]);

    useGardenChannel(handleEvent);

    // ── Derived values ────────────────────────────────────────────────────────
    const ratio = Math.min(totalCount / MAX_SEEDS, 1);
    const glowStyle = computeGlowStyle(ratio, glowRgb);
    const shimmerOp = computeShimmerOpacity(ratio);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Thai:wght@300;400;500&display=swap');
                @keyframes flowerGrow {
                    0%   { opacity:0; transform:scaleY(0) translateY(8px); }
                    65%  { opacity:1; transform:scaleY(1.06) translateY(-2px); }
                    100% { opacity:1; transform:scaleY(1) translateY(0); }
                }
                @keyframes flowerSway {
                    from { transform:rotate(var(--sf)); }
                    to   { transform:rotate(var(--st)); }
                }
                @keyframes pIn {
                    from { opacity:0; transform:translateY(24px) rotate(-4deg) scale(0.7); }
                    to   { opacity:1; transform:translateY(0) rotate(var(--p-rot)) scale(1); }
                }
                @keyframes polShimmer {
                    from { transform:translateX(-130%); }
                    to   { transform:translateX(200%); }
                }
                @keyframes cardIn  { from{opacity:0;transform:translateX(-12px);}  to{opacity:1;transform:translateX(0);} }
                @keyframes cardOut { from{opacity:1;transform:translateX(0);} to{opacity:0;transform:translateX(-10px) scaleY(0.88);} }
                @keyframes ribbonUpdate {
                    0%,100% { background:rgba(16,11,7,0.58); }
                    40%     { background:rgba(55,38,20,0.72); box-shadow:0 0 10px rgba(200,160,80,0.22); }
                }
                @keyframes wigFirm {
                    0%,100%{transform:rotate(0);}25%{transform:rotate(-0.7deg);}55%{transform:rotate(1deg);}80%{transform:rotate(-0.4deg);}
                }
                @keyframes wigNormal {
                    0%,100%{transform:rotate(0);}25%{transform:rotate(-1deg);}55%{transform:rotate(1.5deg);}80%{transform:rotate(-0.6deg);}
                }
            `}</style>

            <div style={{ position: "relative", width: 300, height: 310 }}>

                <div ref={jarZoneRef} style={{ position: "absolute", top: 0, left: 0, width: 300, height: 250 }}>

                    {/* Seeds (physics DOM) */}
                    <div ref={ballLayerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }} />

                    {/* Flowers */}
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                        {flowers.map(f => <FlowerElement key={f.id} flower={f} />)}
                    </div>

                    {/* Glow */}
                    <div style={{
                        position: "absolute", bottom: 10, left: "50%",
                        transform: "translateX(-50%)",
                        borderRadius: "50%", pointerEvents: "none",
                        transition: "opacity 1.8s ease, width 1.8s ease, height 1.8s ease, background 2s ease",
                        ...glowStyle,
                    }} />

                    {/* Polaroid */}
                    {polaroid && (
                        <div style={{
                            position: "absolute", left: "50%", top: "50%",
                            transform: "translate(-50%, -58%)", zIndex: 50, pointerEvents: "none",
                        }}>
                            <PolaroidCard
                                username={polaroid.username}
                                imageUrl={polaroid.imageUrl}
                                rotation={polaroid.rotation}
                            />
                        </div>
                    )}

                    {/* Jar SVG frame on top */}
                    <JarSVG shimmerOpacity={shimmerOp} />
                </div>

                <NotifToast
                    queue={toastQueue}
                    onDone={id => setToastQueue(q => q.filter(t => t.id !== id))}
                />

                <RibbonLabel
                    lastType={lastType}
                    lastUsername={lastUsername}
                    count={totalCount}
                />
            </div>
        </>
    );
}