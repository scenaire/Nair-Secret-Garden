// lib/canvasSync.ts
import { createClient } from "@/lib/supabase/client";
import type { Pixel } from "./pixelEngine";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./pixelEngine";

const CHANNEL_NAME = "picnic-canvas";
const SNAPSHOT_BUCKET = "canvas-snapshots";
const SNAPSHOT_KEY = "current.png";

export interface StrokeMessage {
    userId: string;
    userName: string;
    pixels: Pixel[];
}

// ─── Realtime broadcast ─────────────────────────────────────────────────────
export function subscribeToCanvas(
    onStroke: (msg: StrokeMessage) => void,
    onPresenceChange: (users: string[]) => void
) {
    const supabase = createClient();

    const channel = supabase.channel(CHANNEL_NAME, {
        config: { broadcast: { self: false } },
    });

    channel
        .on("broadcast", { event: "stroke" }, ({ payload }) => {
            onStroke(payload as StrokeMessage);
        })
        .on("presence", { event: "sync" }, () => {
            const state = channel.presenceState<{ userName: string }>();
            const users = Object.values(state)
                .flat()
                .map((u) => u.userName);
            onPresenceChange(users);
        })
        .subscribe();

    return channel;
}

export async function broadcastStroke(
    channel: ReturnType<ReturnType<typeof createClient>["channel"]>,
    msg: StrokeMessage
) {
    await channel.send({
        type: "broadcast",
        event: "stroke",
        payload: msg,
    });
}

export async function trackPresence(
    channel: ReturnType<ReturnType<typeof createClient>["channel"]>,
    userName: string
) {
    await channel.track({ userName });
}

// ─── Snapshot (Storage) ─────────────────────────────────────────────────────
export async function saveSnapshot(canvas: HTMLCanvasElement): Promise<void> {
    const supabase = createClient();
    const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/png")
    );

    await supabase.storage
        .from(SNAPSHOT_BUCKET)
        .upload(SNAPSHOT_KEY, blob, {
            upsert: true,
            contentType: "image/png",
        });
}

export async function loadSnapshot(): Promise<string | null> {
    const supabase = createClient();
    const { data } = supabase.storage
        .from(SNAPSHOT_BUCKET)
        .getPublicUrl(SNAPSHOT_KEY);
    if (!data?.publicUrl) return null;
    // cache-bust เพื่อโหลดล่าสุดเสมอ
    return `${data.publicUrl}?t=${Date.now()}`;
}

// ─── Download final image ────────────────────────────────────────────────────
export function downloadCanvas(canvas: HTMLCanvasElement) {
    const link = document.createElement("a");
    link.download = "picnic-canvas-final.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}