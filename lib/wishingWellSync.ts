// lib/wishingWellSync.ts
"use client";

import { createClient } from "@/lib/supabase/client";

const SLIP_BUCKET = "wish-slips";

// ── Types ────────────────────────────────────────────────────

export interface WishItem {
    id: string;
    created_at: string;
    title: string;
    description: string | null;
    image_url: string | null;
    product_link: string | null;
    category: string | null;
    mode: "crowdfund" | "buynow";
    target_amount: number;
    is_granted: boolean;
    sort_order: number;
    // joined from wish_item_totals view
    approved_total: number;
    pending_total: number;
    supporter_count: number;
}

export interface WishContribution {
    id: string;
    created_at: string;
    wish_item_id: string;
    user_id: string;
    twitch_name: string;
    avatar_url: string | null;
    amount: number;
    status: "pending" | "approved" | "rejected";
    reject_reason: string | null;
    approved_at: string | null;
}

export interface LeaderboardEntry {
    user_id: string;
    twitch_name: string;
    avatar_url: string | null;
    total_amount: number;
    gift_count: number;
}

// ── Image compression (Canvas API) ──────────────────────────
// slip: max 1200px, WebP 0.82 — ลดขนาดก่อนอัปโหลด
async function compressImage(
    file: File,
    maxDim = 1200,
    quality = 0.82,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const w = Math.round(img.width * scale);
            const h = Math.round(img.height * scale);
            const canvas = document.createElement("canvas");
            canvas.width = w; canvas.height = h;
            canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
            canvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error("Compression failed")),
                "image/webp", quality,
            );
        };
        img.onerror = reject;
        img.src = url;
    });
}

// ── Upload slip to storage ────────────────────────────────────
async function uploadSlip(file: File, userId: string): Promise<string> {
    const supabase = createClient();
    // compress: max 1200px, WebP 0.82
    const compressed = await compressImage(file, 1200, 0.82);
    const path = `${userId}/${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage
        .from(SLIP_BUCKET)
        .upload(path, compressed, { contentType: "image/webp", cacheControl: "3600", upsert: false });
    if (error) throw error;
    return path;
}

// ── Fetch all wish items with totals ─────────────────────────
export async function fetchWishItems(): Promise<WishItem[]> {
    const supabase = createClient();

    const [itemsRes, totalsRes] = await Promise.all([
        supabase
            .from("wish_items")
            .select("*")
            .order("sort_order", { ascending: true }),
        supabase.rpc("get_wish_item_totals"),
    ]);

    if (itemsRes.error) throw itemsRes.error;
    if (totalsRes.error) throw totalsRes.error;

    const totalsMap = new Map<string, { approved_total: number; pending_total: number; supporter_count: number }>();
    for (const t of (totalsRes.data ?? []) as any[]) {
        totalsMap.set(t.wish_item_id, {
            approved_total: Number(t.approved_total) || 0,
            pending_total: Number(t.pending_total) || 0,
            supporter_count: Number(t.supporter_count) || 0,
        });
    }

    return (itemsRes.data ?? []).map((row: any) => ({
        ...row,
        ...(totalsMap.get(row.id) ?? { approved_total: 0, pending_total: 0, supporter_count: 0 }),
    }));
}

// ── Fetch contributions for a specific item ───────────────────
export async function fetchContributions(wishItemId: string): Promise<WishContribution[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("wish_contributions")
        .select("*")
        .eq("wish_item_id", wishItemId)
        .eq("status", "approved")
        .order("approved_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
}

// ── Fetch current user's own pending contributions ────────────
export async function fetchMyPending(userId: string): Promise<string[]> {
    // returns list of wish_item_ids where user has a pending slip
    const supabase = createClient();
    const { data, error } = await supabase
        .from("wish_contributions")
        .select("wish_item_id")
        .eq("user_id", userId)
        .eq("status", "pending");
    if (error) throw error;
    return (data ?? []).map((r: any) => r.wish_item_id);
}

// ── Submit a contribution (drop a coin / make it real) ────────
export async function submitContribution({
    wishItemId, amount, slipFile, userId, twitchName, avatarUrl,
}: {
    wishItemId: string;
    amount: number;
    slipFile: File;
    userId: string;
    twitchName: string;
    avatarUrl?: string;
}): Promise<void> {
    const slipPath = await uploadSlip(slipFile, userId);
    const supabase = createClient();
    const { error } = await supabase.from("wish_contributions").insert({
        wish_item_id: wishItemId,
        user_id: userId,
        twitch_name: twitchName,
        avatar_url: avatarUrl ?? null,
        amount,
        slip_url: slipPath,
        status: "pending",
    });
    if (error) {
        // rollback slip
        await supabase.storage.from(SLIP_BUCKET).remove([slipPath]);
        throw error;
    }
}

// ── Submit a surprise gift ────────────────────────────────────
export async function submitSurprise({
    itemName, productLink, amount, message, slipFile, userId, twitchName, avatarUrl,
}: {
    itemName: string;
    productLink?: string;
    amount?: number;
    message?: string;
    slipFile: File;
    userId: string;
    twitchName: string;
    avatarUrl?: string;
}): Promise<void> {
    const slipPath = await uploadSlip(slipFile, userId);
    const supabase = createClient();
    const { error } = await supabase.from("wish_surprises").insert({
        user_id: userId,
        twitch_name: twitchName,
        avatar_url: avatarUrl ?? null,
        item_name: itemName,
        product_link: productLink || null,
        amount: amount ?? null,
        message: message || null,
        slip_url: slipPath,
        status: "pending",
    });
    if (error) {
        await supabase.storage.from(SLIP_BUCKET).remove([slipPath]);
        throw error;
    }
}

// ── Fetch leaderboard ─────────────────────────────────────────
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_wish_leaderboard");
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
        ...r,
        total_amount: Number(r.total_amount) || 0,
        gift_count: Number(r.gift_count) || 0,
    }));
}

// ── Format currency (Thai Baht) ───────────────────────────────
export function formatBaht(amount: number): string {
    if (amount >= 1000) {
        return `฿${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
    }
    return `฿${amount.toLocaleString()}`;
}