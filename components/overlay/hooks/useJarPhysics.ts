// components/overlay/hooks/useJarPhysics.ts
"use client";

import { useEffect, useRef, useCallback } from "react";
import { JAR, SEED_R } from "../constants";

export interface SeedBody {
    bodyId: number;
    el: HTMLDivElement;
}

interface SeedStyle {
    bg: string;
    border: string;
    glow: [number, number, number];
}

export function useJarPhysics(ballLayerRef: React.RefObject<HTMLDivElement | null>) {
    const engineRef = useRef<any>(null);
    const runnerRef = useRef<any>(null);
    const bodiesRef = useRef<SeedBody[]>([]);

    // ── Setup engine once ────────────────────────────────────────────────────
    useEffect(() => {
        async function init() {
            const Matter = (await import("matter-js")).default;
            const { Engine, World, Bodies, Runner, Events } = Matter;

            const engine = Engine.create();
            engine.gravity.y = 1.5;
            engineRef.current = engine;

            const WT = JAR.WALL_T;
            World.add(engine.world, [
                Bodies.rectangle(150, JAR.BOTTOM + WT / 2, 300, WT, { isStatic: true }),
                Bodies.rectangle(JAR.LEFT - WT / 2, 150, WT, 600, { isStatic: true }),
                Bodies.rectangle(JAR.RIGHT + WT / 2, 150, WT, 600, { isStatic: true }),
                Bodies.rectangle(150, -400, 300, 40, { isStatic: true }),
            ]);

            const runner = Runner.create();
            runnerRef.current = runner;
            Runner.run(runner, engine);

            Events.on(engine, "afterUpdate", () => {
                engine.world.bodies.forEach((body: any) => {
                    if (body.isStatic) return;
                    const seed = bodiesRef.current.find(s => s.bodyId === body.id);
                    if (seed) {
                        seed.el.style.transform =
                            `translate3d(${body.position.x - SEED_R}px,${body.position.y - SEED_R}px,0) rotate(${body.angle}rad)`;
                    }
                });
            });
        }

        init();

        return () => {
            import("matter-js").then(({ default: M }) => {
                if (runnerRef.current) M.Runner.stop(runnerRef.current);
                if (engineRef.current) M.Engine.clear(engineRef.current);
            });
        };
    }, []);

    // ── Shared DOM seed creator ──────────────────────────────────────────────
    const createSeedEl = useCallback((style: SeedStyle): HTMLDivElement | null => {
        if (!ballLayerRef.current) return null;
        const d = SEED_R * 2;
        const [r, g, b] = style.glow;
        const el = document.createElement("div");
        el.style.cssText = `
            position:absolute;top:0;left:0;
            width:${d}px;height:${d}px;border-radius:50%;
            will-change:transform;border:1px solid ${style.border};
            background:${style.bg};
            box-shadow:0 0 ${SEED_R * 0.7}px rgba(${r},${g},${b},0.28),
                       inset 0 1px 2px rgba(255,255,255,0.38),
                       inset 0 -1px 2px rgba(0,0,0,0.06);
        `;
        ballLayerRef.current.appendChild(el);
        return el;
    }, [ballLayerRef]);

    // ── Spawn single seed (realtime) ─────────────────────────────────────────
    const spawnSeed = useCallback(async (style: SeedStyle) => {
        if (!engineRef.current) return;
        const Matter = (await import("matter-js")).default;
        const x = JAR.LEFT + SEED_R + 4 + Math.random() * (JAR.WIDTH - SEED_R * 2 - 8);
        const body = Matter.Bodies.circle(x, JAR.NECK_Y - SEED_R - 4, SEED_R, {
            restitution: 0.3, friction: 0.06, density: 0.06, frictionAir: 0.013,
        });
        Matter.World.add(engineRef.current.world, body);
        const el = createSeedEl(style);
        if (el) bodiesRef.current.push({ bodyId: body.id, el });
        return body.id;
    }, [createSeedEl]);

    // ── Spawn batch of seeds instantly (initial load) ────────────────────────
    // Drops them from staggered heights so they settle naturally
    const spawnSeedBatch = useCallback(async (styles: SeedStyle[]) => {
        if (!engineRef.current || styles.length === 0) return;
        const Matter = (await import("matter-js")).default;

        styles.forEach((style, i) => {
            // stagger drop position so they don't all collide at once
            const x = JAR.LEFT + SEED_R + 4 + Math.random() * (JAR.WIDTH - SEED_R * 2 - 8);
            const dropY = JAR.NECK_Y - SEED_R - 4 - Math.floor(i / 8) * (SEED_R * 2 + 2);
            const body = Matter.Bodies.circle(x, dropY, SEED_R, {
                restitution: 0.3, friction: 0.06, density: 0.06, frictionAir: 0.013,
            });
            Matter.World.add(engineRef.current.world, body);
            const el = createSeedEl(style);
            if (el) bodiesRef.current.push({ bodyId: body.id, el });
        });
    }, [createSeedEl]);

    // ── Get topmost seed Y from live physics ─────────────────────────────────
    const getSeedSurface = useCallback((): number => {
        if (!engineRef.current) return JAR.BOTTOM - 2;
        const bodies = engineRef.current.world.bodies.filter((b: any) => !b.isStatic);
        if (!bodies.length) return JAR.BOTTOM - 2;
        let minY = JAR.BOTTOM;
        bodies.forEach((b: any) => {
            if (b.position.y - SEED_R < minY) minY = b.position.y - SEED_R;
        });
        return minY;
    }, []);

    // ── Clear all ────────────────────────────────────────────────────────────
    const clearSeeds = useCallback(async () => {
        if (!engineRef.current) return;
        const Matter = (await import("matter-js")).default;
        const toRemove = engineRef.current.world.bodies.filter((b: any) => !b.isStatic);
        Matter.World.remove(engineRef.current.world, toRemove);
        bodiesRef.current.forEach(s => s.el.remove());
        bodiesRef.current = [];
    }, []);

    return { spawnSeed, spawnSeedBatch, getSeedSurface, clearSeeds };
}