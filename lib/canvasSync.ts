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

export interface PresenceUser {
    id: string;
    name: string;
    avatar?: string;
}

// ───────────────────────────────────────────────────────────────
// Realtime broadcast + presence
// ───────────────────────────────────────────────────────────────

/**
 * Subscribe realtime canvas channel
 * - onStroke: เรียกเมื่อมี stroke ใหม่จากคนอื่น
 * - onPresenceChange: เรียกเมื่อ presence sync (รายชื่อ + avatar เปลี่ยน)
 */
export function subscribeToCanvas(
    onStroke: (msg: StrokeMessage) => void,
    onPresenceChange: (users: PresenceUser[]) => void
): RealtimeChannel {
    const supabase = createClient();
    console.log("[realtime] creating channel", CHANNEL_NAME);

    const channel = supabase.channel(CHANNEL_NAME, {
        config: {
            broadcast: { self: false },
            // ใช้ userId เป็น key ใน presence state
            presence: { key: "userId" },
        },
    });

    // stroke จากคนอื่น
    channel.on("broadcast", { event: "stroke" }, ({ payload }) => {
        console.log("[realtime] stroke received", payload);
        onStroke(payload as StrokeMessage);
    });

    // presence sync → ดึงทั้งชื่อ + avatar
    channel.on("presence", { event: "sync" }, () => {
        type PresencePayload = {
            userId: string;
            userName: string;
            avatarUrl?: string;
        };

        const state = channel.presenceState<PresencePayload>();

        const users: PresenceUser[] = [];
        for (const [key, entries] of Object.entries(state)) {
            for (const entry of entries) {
                users.push({
                    id: entry.userId ?? key,
                    name: entry.userName,
                    avatar: entry.avatarUrl,
                });
            }
        }

        console.log("[realtime] presence sync", users);
        onPresenceChange(users);
    });

    channel.subscribe((status) => {
        console.log("[realtime] channel status:", status);
    });

    return channel;
}

/**
 * Broadcast stroke ไปยังคนอื่นในห้อง
 */
export async function broadcastStroke(
    channel: RealtimeChannel,
    msg: StrokeMessage
): Promise<void> {
    const result = await channel.send({
        type: "broadcast",
        event: "stroke",
        payload: msg,
    });

    // result: "ok" | "timed out" | "error" | "channel closed" | "not joined"
    if (result !== "ok") {
        console.error("[realtime] broadcast error:", result);
    }
}

/**
 * Track presence ของ user ปัจจุบัน
 * - ส่ง userId, userName, avatarUrl ไปเก็บใน presence state
 */
export async function trackPresence(
    channel: RealtimeChannel,
    userId: string,
    userName: string,
    avatarUrl?: string
): Promise<void> {
    try {
        const payload: {
            userId: string;
            userName: string;
            avatarUrl?: string;
        } = { userId, userName };

        if (avatarUrl) {
            payload.avatarUrl = avatarUrl;
        }

        const result = await channel.track(payload as any);

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

/**
 * เซฟ snapshot ของ canvas (PNG) ลง Supabase Storage
 */
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

/**
 * คืน URL ของ snapshot ล่าสุดใน storage (พร้อม cache-bust)
 * - ถ้าไม่มีไฟล์ → คืน null
 */
export async function loadSnapshot(): Promise<string | null> {
    const supabase = createClient();

    const { data } = supabase.storage
        .from(SNAPSHOT_BUCKET)
        .getPublicUrl(SNAPSHOT_KEY);

    if (!data?.publicUrl) {
        console.log("[snapshot] no existing snapshot");
        return null;
    }

    const url = `${data.publicUrl}?t=${Date.now()}`;
    console.log("[snapshot] load url", url);
    return url;
}

// ───────────────────────────────────────────────────────────────
// Download canvas as PNG (ฝั่ง client กดเซฟรูปลงเครื่องตัวเอง)
// ───────────────────────────────────────────────────────────────

export function downloadCanvas(canvas: HTMLCanvasElement): void {
    const link = document.createElement("a");
    link.download = "picnic-canvas-final.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}