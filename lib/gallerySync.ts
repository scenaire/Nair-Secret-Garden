// lib/gallerySync.ts
"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "fanart";

export interface FanartSubmission {
    id: string;
    created_at: string;
    user_id: string;
    artist_name: string;
    social_link: string | null;
    image_path: string;
    image_url: string;
}

// ── fetch all submissions (newest first) ──────────────────────
export async function fetchSubmissions(): Promise<FanartSubmission[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("fanart_submissions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

// ── upload image + insert row ─────────────────────────────────
export async function submitFanart({
    file,
    artistName,
    socialLink,
    userId,
}: {
    file: File;
    artistName: string;
    socialLink: string;
    userId: string;
}): Promise<FanartSubmission> {
    const supabase = createClient();

    // 1. upload to storage
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    // 2. get public URL
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const imageUrl = urlData.publicUrl;

    // 3. insert row
    const { data, error: insertError } = await supabase
        .from("fanart_submissions")
        .insert({
            user_id: userId,
            artist_name: artistName.trim(),
            social_link: socialLink.trim() || null,
            image_path: path,
            image_url: imageUrl,
        })
        .select()
        .single();

    if (insertError) {
        // rollback upload ถ้า insert ล้มเหลว
        await supabase.storage.from(BUCKET).remove([path]);
        throw insertError;
    }

    return data;
}

// ── delete submission (own only, enforced by RLS) ────────────
export async function deleteSubmission(id: string, imagePath: string) {
    const supabase = createClient();

    const { error: deleteRowError } = await supabase
        .from("fanart_submissions")
        .delete()
        .eq("id", id);

    if (deleteRowError) throw deleteRowError;

    await supabase.storage.from(BUCKET).remove([imagePath]);
}