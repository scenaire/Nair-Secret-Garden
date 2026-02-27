// lib/canvasSync.ts
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Pixel } from "./pixelEngine";

const CHANNEL_NAME = "picnic-canvas";
const SNAPSHOT_BUCKET = "canvas-snapshots";
const SNAPSHOT_KEY = "current.png";

export interface StrokeMessage {
    userId: string;
    userName: string;
    pixels: Pixel[];
}

// ───────────────────────────────────────────────────────────────
// Realtime broadcast + presence
// ───────────────────────────────────────────────────────────────

export function subscribeToCanvas(
    onStroke: (msg: StrokeMessage) => void,
    onPresenceChange: (users: string[]) => void
): RealtimeChannel {
    const supabase = createClient();
    console.log("[realtime] creating channel", CHANNEL_NAME);

    const channel = supabase.channel(CHANNEL_NAME, {
        config: {
            broadcast: { self: false },
            presence: { key: "userName" },
        },
    });

    channel
        .on("broadcast", { event: "stroke" }, ({ payload }) => {
            console.log("[realtime] stroke received", payload);
            onStroke(payload as StrokeMessage);
        })
        .on("presence", { event: "sync" }, () => {
            const state = channel.presenceState<{ userName: string }>();
            const users = Object.values(state)
                .flat()
                .map((u) => u.userName);
            console.log("[realtime] presence sync", users);
            onPresenceChange(users);
        });

    channel.subscribe((status) => {
        console.log("[realtime] channel status:", status);
    });

    return channel;
}

export async function broadcastStroke(
    channel: RealtimeChannel,
    msg: StrokeMessage
): Promise<void> {
    const result = await channel.send({
        type: "broadcast",
        event: "stroke",
        payload: msg,
    });

    // result เป็น union string: "ok" | "timed out" | "error" | "channel closed" | "not joined"
    if (result !== "ok") {
        console.error("[realtime] broadcast error:", result);
    }
}

export async function trackPresence(
    channel: RealtimeChannel,
    userName: string
): Promise<void> {
    try {
        const result = await channel.track({ userName });

        // ถ้าอยากเช็ค error เผื่อ lib คืน { error } มา:
        if ((result as any)?.error) {
            console.error("[realtime] presence track error:", (result as any).error);
        }
    } catch (err) {
        console.error("[realtime] presence track error:", err);
    }
}

// ───────────────────────────────────────────────────────────────
// Snapshot (Supabase Storage)
// ───────────────────────────────────────────────────────────────

export async function saveSnapshot(canvas: HTMLCanvasElement): Promise<void> {
    const supabase = createClient();

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
            if (!b) {
                return reject(new Error("Failed to create PNG blob from canvas"));
            }
            resolve(b);
        }, "image/png");
    });

    const { data, error } = await supabase.storage
        .from(SNAPSHOT_BUCKET)
        .upload(SNAPSHOT_KEY, blob, {
            upsert: true,
            contentType: "image/png",
        });

    if (error) {
        console.error("[snapshot] save error", error);
    } else {
        console.log("[snapshot] saved", data);
    }
}

export async function loadSnapshot(): Promise<string | null> {
    const supabase = createClient();
    const { data } = supabase.storage
        .from(SNAPSHOT_BUCKET)
        .getPublicUrl(SNAPSHOT_KEY);

    if (!data?.publicUrl) {
        console.log("[snapshot] no existing snapshot");
        return null;
    }

    // cache-bust เพื่อให้โหลดรูปล่าสุดเสมอ
    const url = `${data.publicUrl}?t=${Date.now()}`;
    console.log("[snapshot] load url", url);
    return url;
}

// ───────────────────────────────────────────────────────────────
// Download canvas as PNG
// ───────────────────────────────────────────────────────────────

export function downloadCanvas(canvas: HTMLCanvasElement): void {
    const link = document.createElement("a");
    link.download = "picnic-canvas-final.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}