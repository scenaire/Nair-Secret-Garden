// components/overlay/hooks/useGardenChannel.ts
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { OVERLAY_CHANNEL } from "../constants";
import type { OverlayPayload } from "../types";

export function useGardenChannel(onEvent: (payload: OverlayPayload) => void) {
    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(OVERLAY_CHANNEL)
            .on("broadcast", { event: "garden-event" }, ({ payload }) => {
                if (!payload?.type) return;
                onEvent(payload as OverlayPayload);
            })
            .subscribe((status) => {
                if (process.env.NODE_ENV === "development") {
                    console.log(`[GardenOverlay] channel status: ${status}`);
                }
            });

        return () => { supabase.removeChannel(channel); };
    }, [onEvent]);
}