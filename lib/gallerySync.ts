// lib/gallerySync.ts
"use client";

import { createClient } from "@/lib/supabase/client";
import { broadcastGardenEvent } from "@/lib/gardenBroadcast";

const BUCKET = "fanart";
const MAX_PX = 1200;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            let { width, height } = img;
            if (width > MAX_PX || height > MAX_PX) {
                if (width >= height) { height = Math.round((height / width) * MAX_PX); width = MAX_PX; }
                else { width = Math.round((width / height) * MAX_PX); height = MAX_PX; }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) { reject(new Error("Canvas not supported")); return; }
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                blob => { if (!blob) { reject(new Error("Compression failed")); return; } resolve(blob); },
                "image/webp", QUALITY,
            );
        };
        img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Failed to load image")); };
        img.src = objectUrl;
    });
}

export interface FanartSubmission {
    id: string; created_at: string; user_id: string;
    artist_name: string; social_link: string | null;
    image_path: string | null; image_url: string;
}

export async function fetchSubmissions(): Promise<FanartSubmission[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("fanart_submissions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function submitFanartFile({
    file, artistName, socialLink, userId,
}: {
    file: File; artistName: string; socialLink: string; userId: string;
}): Promise<FanartSubmission> {
    const supabase = createClient();
    const compressed = await compressImage(file);
    const path = `${userId}/${crypto.randomUUID()}.webp`;

    const { error: uploadError } = await supabase.storage
        .from(BUCKET).upload(path, compressed, { contentType: "image/webp", cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { data, error: insertError } = await supabase
        .from("fanart_submissions")
        .insert({
            user_id: userId, artist_name: artistName.trim(),
            social_link: socialLink.trim() || null,
            image_path: path, image_url: urlData.publicUrl,
        })
        .select().single();

    if (insertError) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw insertError;
    }

    // ── Broadcast to overlay (non-blocking) ──────────────────────────────────
    broadcastGardenEvent({
        type: "bloom",
        username: artistName.trim(),
        imageUrl: urlData.publicUrl,
    });

    return data;
}

export async function submitFanartUrl({
    imageUrl, artistName, socialLink, userId,
}: {
    imageUrl: string; artistName: string; socialLink: string; userId: string;
}): Promise<FanartSubmission> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("fanart_submissions")
        .insert({
            user_id: userId, artist_name: artistName.trim(),
            social_link: socialLink.trim() || null,
            image_path: null, image_url: imageUrl.trim(),
        })
        .select().single();
    if (error) throw error;

    // ── Broadcast to overlay (non-blocking) ──────────────────────────────────
    broadcastGardenEvent({
        type: "bloom",
        username: artistName.trim(),
        imageUrl: imageUrl.trim(),
    });

    return data;
}

export async function deleteSubmission(id: string, imagePath: string | null) {
    const supabase = createClient();
    const { error } = await supabase.from("fanart_submissions").delete().eq("id", id);
    if (error) throw error;
    if (imagePath) await supabase.storage.from(BUCKET).remove([imagePath]);
}