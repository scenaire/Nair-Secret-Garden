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

// ── Upload slip to storage ────────────────────────────────────
async function uploadSlip(file: File, userId: string): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
        .from(SLIP_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    // return path (not public URL — admin fetches via signed URL)
    return path;
}

// ── Fetch all wish items with totals ─────────────────────────
export async function fetchWishItems(): Promise<WishItem[]> {
    const supabase = createClient();
    // join items with totals view
    const { data, error } = await supabase
        .from("wish_items")
        .select(`
            *,
            wish_item_totals (
                approved_total,
                pending_total,
                supporter_count
            )
        `)
        .order("sort_order", { ascending: true });
    if (error) throw error;

    return (data ?? []).map((row: any) => ({
        ...row,
        approved_total: row.wish_item_totals?.approved_total ?? 0,
        pending_total: row.wish_item_totals?.pending_total ?? 0,
        supporter_count: row.wish_item_totals?.supporter_count ?? 0,
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
    const { data, error } = await supabase
        .from("wish_leaderboard")
        .select("*");
    if (error) throw error;
    return data ?? [];
}

// ── Format currency (Thai Baht) ───────────────────────────────
export function formatBaht(amount: number): string {
    if (amount >= 1000) {
        return `฿${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
    }
    return `฿${amount.toLocaleString()}`;
}