"use client";

import { createClient } from "@/lib/supabase/client";

// ── Types ────────────────────────────────────────────────────

export interface PendingContribution {
    id: string;
    created_at: string;
    wish_item_id: string;
    user_id: string;
    twitch_name: string;
    avatar_url: string | null;
    amount: number;
    slip_url: string;
    status: "pending" | "approved" | "rejected";
    reject_reason: string | null;
    // joined
    wish_item_title: string;
}

export interface PendingSurprise {
    id: string;
    created_at: string;
    user_id: string;
    twitch_name: string;
    avatar_url: string | null;
    item_name: string;
    product_link: string | null;
    amount: number | null;
    message: string | null;
    slip_url: string;
    status: "pending" | "approved" | "rejected";
    reject_reason: string | null;
}

export interface WishItemAdmin {
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
}

// ── Slip signed URL ───────────────────────────────────────────
export async function getSlipSignedUrl(slipPath: string): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.storage
        .from("wish-slips")
        .createSignedUrl(slipPath, 60 * 10);
    if (error) throw error;
    return data.signedUrl;
}

// ── Fetch pending contributions ───────────────────────────────
export async function fetchPendingContributions(): Promise<PendingContribution[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("wish_contributions")
        .select(`*, wish_items ( title )`)
        .eq("status", "pending")
        .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
        ...r,
        wish_item_title: r.wish_items?.title ?? "—",
    }));
}

// ── Fetch all contributions (for history tab) ─────────────────
export async function fetchAllContributions(): Promise<PendingContribution[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("wish_contributions")
        .select(`*, wish_items ( title )`)
        .order("created_at", { ascending: false })
        .limit(100);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
        ...r,
        wish_item_title: r.wish_items?.title ?? "—",
    }));
}

// ── Notification helper ───────────────────────────────────────
async function createNotification(supabase: any, {
    userId, type, title, message, rejectReason,
}: {
    userId: string;
    type: 'wishlist_approved' | 'wishlist_rejected' | 'surprise_approved' | 'surprise_rejected';
    title: string;
    message: string;
    rejectReason?: string;
}) {
    await supabase.from('notifications').insert({
        user_id: userId,
        type,
        title,
        message,
        reject_reason: rejectReason ?? null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
}

// ── Approve contribution ──────────────────────────────────────
export async function approveContribution(id: string): Promise<void> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('wish_contributions')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', id)
        .select('user_id, amount, wish_items(title)')
        .single();
    if (error) throw error;

    const title = (data as any).wish_items?.title ?? 'ของขวัญ';
    await createNotification(supabase, {
        userId: data.user_id,
        type: 'wishlist_approved',
        title,
        message: `สลิปของคุณสำหรับ "${title}" ได้รับการยืนยันแล้ว ✦`,
    });
}

// ── Reject contribution ───────────────────────────────────────
export async function rejectContribution(id: string, reason?: string): Promise<void> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('wish_contributions')
        .update({ status: 'rejected', reject_reason: reason ?? null })
        .eq('id', id)
        .select('user_id, wish_items(title)')
        .single();
    if (error) throw error;

    const title = (data as any).wish_items?.title ?? 'ของขวัญ';
    await createNotification(supabase, {
        userId: data.user_id,
        type: 'wishlist_rejected',
        title,
        message: `สลิปสำหรับ "${title}" ถูกปฏิเสธ`,
        rejectReason: reason,
    });
}

// ── Fetch all surprises ───────────────────────────────────────
export async function fetchSurprises(statusFilter?: "pending" | "approved" | "rejected"): Promise<PendingSurprise[]> {
    const supabase = createClient();
    let q = supabase
        .from("wish_surprises")
        .select("*")
        .order("created_at", { ascending: false });
    if (statusFilter) q = q.eq("status", statusFilter);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
}

// ── Approve / reject surprise ─────────────────────────────────
export async function approveSurprise(id: string): Promise<void> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('wish_surprises')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', id)
        .select('user_id, item_name')
        .single();
    if (error) throw error;

    await createNotification(supabase, {
        userId: data.user_id,
        type: 'surprise_approved',
        title: data.item_name ?? 'Surprise Gift',
        message: `ของขวัญเซอร์ไพรส์ "${data.item_name}" ของคุณได้รับการยืนยันแล้ว 🎁`,
    });
}

export async function rejectSurprise(id: string, reason?: string): Promise<void> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('wish_surprises')
        .update({ status: 'rejected', reject_reason: reason ?? null })
        .eq('id', id)
        .select('user_id, item_name')
        .single();
    if (error) throw error;

    await createNotification(supabase, {
        userId: data.user_id,
        type: 'surprise_rejected',
        title: data.item_name ?? 'Surprise Gift',
        message: `ของขวัญเซอร์ไพรส์ "${data.item_name}" ถูกปฏิเสธ`,
        rejectReason: reason,
    });
}

// ── Wish item CRUD ────────────────────────────────────────────
export async function fetchWishItemsAdmin(): Promise<WishItemAdmin[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("wish_items")
        .select("*")
        .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function createWishItem(item: Omit<WishItemAdmin, "id" | "created_at">): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("wish_items").insert(item);
    if (error) throw error;
}

export async function updateWishItem(id: string, updates: Partial<WishItemAdmin>): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
        .from("wish_items")
        .update(updates)
        .eq("id", id);
    if (error) throw error;
}

export async function deleteWishItem(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
        .from("wish_items")
        .delete()
        .eq("id", id);
    if (error) throw error;
}

// ── Image compression (shared helper) ────────────────────────
async function compressImage(file: File, maxDim = 1200, quality = 0.85): Promise<Blob> {
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

// ── Upload wish item image (public bucket) ────────────────────
export async function uploadWishImage(file: File): Promise<string> {
    const supabase = createClient();
    const compressed = await compressImage(file, 1200, 0.85);
    const path = `wish-items/${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage
        .from("wish-images")
        .upload(path, compressed, { contentType: "image/webp", cacheControl: "86400", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("wish-images").getPublicUrl(path);
    return data.publicUrl;
}

// ── Format helpers ────────────────────────────────────────────
export function formatBaht(amount: number): string {
    return `฿${amount.toLocaleString()}`;
}

export function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}