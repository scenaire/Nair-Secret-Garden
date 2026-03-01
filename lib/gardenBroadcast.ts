// lib/gardenBroadcast.ts
// Sends a one-shot broadcast to the garden-overlay Supabase channel.
// Call this from any client-side submit handler after a successful DB write.

import { createClient } from "@/lib/supabase/client";
import { OVERLAY_CHANNEL } from "@/components/overlay/constants";
import type { OverlayPayload } from "@/components/overlay/types";

export async function broadcastGardenEvent(payload: OverlayPayload): Promise<void> {
    try {
        const supabase = createClient();
        const channel = supabase.channel(OVERLAY_CHANNEL);

        // Subscribe briefly just to send, then clean up
        await new Promise<void>((resolve) => {
            channel
                .subscribe((status) => {
                    if (status === "SUBSCRIBED") {
                        channel
                            .send({ type: "broadcast", event: "garden-event", payload })
                            .then(() => resolve())
                            .catch(() => resolve()); // non-fatal
                    }
                });
        });

        await supabase.removeChannel(channel);
    } catch (err) {
        // Overlay broadcast is non-critical — log but don't throw
        console.warn("[gardenBroadcast] failed:", err);
    }
}