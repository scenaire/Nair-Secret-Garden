// components/overlay/hooks/useInitialLoad.ts
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { THEMES, FLOWER_PALETTES, rollFlower, getPhase, JAR, SEED_R, MAX_SEEDS } from "../constants";
import type { PlacedFlower } from "../types";

interface InitialLoadOptions {
    onSeedsLoaded: (seeds: Array<{ themeKey: string }>) => void;
    onFlowersLoaded: (flowers: PlacedFlower[]) => void;
    onCountSet: (count: number) => void;
    onLastEventSet: (type: "seed" | "bloom", username: string) => void;
    getSeedSurface: () => number;
}

// Build a PlacedFlower from index + surface (no physics, pure position)
function buildInitialFlower(
    index: number,
    total: number,
    surfaceY: number,
    flowerIdxRef: { current: number },
): PlacedFlower {
    const ratio = Math.min(index / MAX_SEEDS, 1);
    const phase = getPhase(ratio);
    const scaleFactor = phase === 1 ? 0.78 : phase === 2 ? 0.92 : 1.0;
    const stemH = Math.round((28 + ((index * 7919) % 18)) * scaleFactor); // deterministic via index
    const flowerW = Math.round(34 * scaleFactor);
    const baseY = Math.max(JAR.NECK_Y + 10, Math.min(surfaceY + 2, JAR.BOTTOM - 4));
    const topY = baseY - stemH;
    // spread x deterministically so flowers don't all stack
    const xSlot = (index % 5) / 4; // 0, 0.25, 0.5, 0.75, 1.0
    const x = JAR.LEFT + flowerW / 2 + 10 + xSlot * (JAR.WIDTH - flowerW - 20);
    const swayRange = phase === 1 ? 2.5 : phase === 2 ? 4 : 6;
    const swayBase = (index * 31) % 10; // pseudo-random per index

    return {
        id: `init-flower-${index}`,
        x, topY, baseY, stemH, flowerW, scaleFactor,
        flowerType: rollFlower(),   // gacha still applies
        paletteIdx: flowerIdxRef.current++ % FLOWER_PALETTES.length,
        swayFrom: `${(-swayRange * 0.6 - (swayBase % 4) * 0.1).toFixed(1)}deg`,
        swayTo: `${(swayRange * 0.5 + (swayBase % 5) * 0.1).toFixed(1)}deg`,
        swayDur: `${(3.2 + (swayBase % 20) * 0.1).toFixed(1)}s`,
        growDur: "0.01s",  // instant for initial load — no grow animation
    };
}

export function useInitialLoad({
    onSeedsLoaded,
    onFlowersLoaded,
    onCountSet,
    onLastEventSet,
    getSeedSurface,
}: InitialLoadOptions) {
    useEffect(() => {
        let cancelled = false;

        async function load() {
            const supabase = createClient();

            // ── Fetch both tables in parallel ────────────────────────────────
            const [{ data: entries, error: eErr }, { data: fanarts, error: fErr }] = await Promise.all([
                supabase
                    .from("guestbook_entries")
                    .select("author_alias, theme, created_at")
                    .order("created_at", { ascending: true }),
                supabase
                    .from("fanart_submissions")
                    .select("artist_name, image_url, created_at")
                    .order("created_at", { ascending: true }),
            ]);

            if (cancelled) return;
            if (eErr) console.warn("[overlay] guestbook load error:", eErr.message);
            if (fErr) console.warn("[overlay] fanart load error:", fErr.message);

            const safeEntries = entries ?? [];
            const safeFanarts = fanarts ?? [];

            // ── Seeds: spawn physics bodies ──────────────────────────────────
            const seedList = safeEntries.map(e => ({
                themeKey: (e.theme ?? "cream") as string,
            }));
            onSeedsLoaded(seedList);

            // ── Wait for physics to settle, then place flowers ────────────
            // seeds take ~600ms to fall to rest under gravity
            setTimeout(() => {
                if (cancelled) return;

                const flowerIdxRef = { current: 0 };
                const flowers: PlacedFlower[] = safeFanarts.map((fa, i) => {
                    const surfaceY = getSeedSurface();
                    return buildInitialFlower(i, safeFanarts.length, surfaceY, flowerIdxRef);
                });

                onFlowersLoaded(flowers);

                // Total count = seeds + flowers
                const total = safeEntries.length + safeFanarts.length;
                onCountSet(total);

                // Set ribbon to most recent event
                const allEvents = [
                    ...safeEntries.map(e => ({ type: "seed" as const, username: e.author_alias, at: e.created_at })),
                    ...safeFanarts.map(f => ({ type: "bloom" as const, username: f.artist_name, at: f.created_at })),
                ].sort((a, b) => b.at.localeCompare(a.at));

                if (allEvents.length > 0) {
                    onLastEventSet(allEvents[0].type, allEvents[0].username);
                }
            }, 800);
        }

        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run once on mount
}