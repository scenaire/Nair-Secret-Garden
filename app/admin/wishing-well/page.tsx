// app/admin/wishing-well/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2, XCircle, Clock, Eye, Trash2, Plus,
    Pencil, ExternalLink, Loader2, ImageIcon, ChevronDown, X,
    Gift, Inbox, LayoutGrid, History,
} from "lucide-react";
import {
    fetchPendingContributions, fetchAllContributions,
    fetchSurprises, fetchWishItemsAdmin,
    approveContribution, rejectContribution,
    approveSurprise, rejectSurprise,
    createWishItem, updateWishItem, deleteWishItem, uploadWishImage,
    getSlipSignedUrl, formatBaht, timeAgo,
    type PendingContribution, type PendingSurprise, type WishItemAdmin,
} from "@/lib/adminSync";

// ── Tab type ─────────────────────────────────────────────────
type Tab = "queue" | "surprises" | "items" | "history";

// ── Styles ───────────────────────────────────────────────────
const inputCls: React.CSSProperties = {
    width: "100%", padding: "8px 11px",
    border: "1px solid rgba(143,175,138,0.3)", borderRadius: 7,
    background: "rgba(255,255,255,0.8)", fontSize: 13, color: "#3A3530",
    outline: "none", fontFamily: "inherit",
};
const labelCls: React.CSSProperties = {
    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" as const,
    color: "#4A6B45", opacity: 0.6, marginBottom: 3, display: "block",
};

// ────────────────────────────────────────────────────────────
export default function AdminWishingWellPage() {
    const [tab, setTab] = useState<Tab>("queue");
    const [pending, setPending] = useState<PendingContribution[]>([]);
    const [history, setHistory] = useState<PendingContribution[]>([]);
    const [surprises, setSurprises] = useState<PendingSurprise[]>([]);
    const [items, setItems] = useState<WishItemAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = checking

    // ── hooks ทั้งหมดต้องอยู่ก่อน early return เสมอ ──────────
    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [p, s, wi] = await Promise.all([
                fetchPendingContributions(),
                fetchSurprises(),
                fetchWishItemsAdmin(),
            ]);
            setPending(p);
            setSurprises(s);
            setItems(wi);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    }, []);

    const loadHistory = useCallback(async () => {
        try {
            const h = await fetchAllContributions();
            setHistory(h);
        } catch (e) { console.error(e); }
    }, []);

    // ── Page-level admin guard (fallback ชั้นที่ 2) ──────────
    useEffect(() => {
        import("@/lib/supabase/client").then(({ createClient }) => {
            const supabase = createClient();
            supabase.from("admin_users")
                .select("user_id")
                .maybeSingle()
                .then(({ data }) => setIsAdmin(!!data));
        });
    }, []);

    useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);
    useEffect(() => { if (isAdmin && tab === "history") loadHistory(); }, [isAdmin, tab, loadHistory]);

    // ── early returns หลัง hooks ทั้งหมด ─────────────────────
    if (isAdmin === null) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F3EF" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: "italic", color: "#C9A98D" }}>
                    กำลังตรวจสอบสิทธิ์…
                </p>
            </div>
        );
    }
    if (!isAdmin) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#F6F3EF" }}>
                <p style={{ fontSize: 28 }}>🌿</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: "italic", color: "#6B4C35" }}>ไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                <a href="/" style={{ fontSize: 12, color: "#4A6B45", textDecoration: "none", opacity: 0.7 }}>← กลับหน้าแรก</a>
            </div>
        );
    }

    // ── TABS ─────────────────────────────────────────────────
    const TABS: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
        { key: "queue", label: "คิวสลิป", icon: <Inbox size={14} />, badge: pending.length },
        { key: "surprises", label: "Surprises", icon: <Gift size={14} />, badge: surprises.filter(s => s.status === "pending").length },
        { key: "items", label: "Wish Items", icon: <LayoutGrid size={14} /> },
        { key: "history", label: "ประวัติ", icon: <History size={14} /> },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#F6F3EF", fontFamily: "'Noto Sans Thai', sans-serif" }}>

            {/* header */}
            <div style={{ background: "white", borderBottom: "1px solid rgba(143,175,138,0.15)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.5 }}>Admin</p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", fontWeight: 300, color: "#6B4C35" }}>
                        Wishing Well Dashboard
                    </h1>
                </div>
                <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={load}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(143,175,138,0.3)", background: "transparent", cursor: "pointer", fontSize: 12, color: "#4A6B45" }}
                >
                    {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                    รีเฟรช
                </motion.button>
            </div>

            {/* tab bar */}
            <div style={{ background: "white", borderBottom: "1px solid rgba(143,175,138,0.1)", padding: "0 28px", display: "flex", gap: 2 }}>
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "12px 16px", border: "none", cursor: "pointer",
                            background: "transparent", fontSize: 13,
                            color: tab === t.key ? "#4A6B45" : "rgba(58,53,48,0.45)",
                            borderBottom: tab === t.key ? "2px solid #4A6B45" : "2px solid transparent",
                            fontFamily: "inherit", transition: "all 0.18s",
                        }}
                    >
                        {t.icon} {t.label}
                        {t.badge !== undefined && t.badge > 0 && (
                            <span style={{ background: "#4A6B45", color: "white", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 100 }}>
                                {t.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* content */}
            <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>
                {tab === "queue" && <QueueTab rows={pending} onRefresh={load} />}
                {tab === "surprises" && <SurprisesTab rows={surprises} onRefresh={load} />}
                {tab === "items" && <ItemsTab items={items} onRefresh={load} />}
                {tab === "history" && <HistoryTab rows={history} />}
            </div>
        </div>
    );
}

// ── QUEUE TAB ─────────────────────────────────────────────────
function QueueTab({ rows, onRefresh }: { rows: PendingContribution[]; onRefresh: () => void }) {
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [slipUrls, setSlipUrls] = useState<Record<string, string>>({});
    const [working, setWorking] = useState<string | null>(null);

    const loadSlip = useCallback(async (id: string, path: string) => {
        if (slipUrls[id]) return;
        try {
            const url = await getSlipSignedUrl(path);
            setSlipUrls(prev => ({ ...prev, [id]: url }));
        } catch (e) { console.error(e); }
    }, [slipUrls]);

    const handleApprove = async (id: string) => {
        setWorking(id);
        try { await approveContribution(id); onRefresh(); }
        catch (e) { console.error(e); }
        finally { setWorking(null); }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        setWorking(rejectId);
        try { await rejectContribution(rejectId, rejectReason); setRejectId(null); setRejectReason(""); onRefresh(); }
        catch (e) { console.error(e); }
        finally { setWorking(null); }
    };

    if (rows.length === 0) return <EmptyState icon={<Inbox size={28} />} label="ไม่มีสลิปรอตรวจสอบ" />;

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {rows.map(row => (
                    <motion.div key={row.id} layout
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid rgba(143,175,138,0.12)" }}
                    >
                        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>

                            {/* slip thumbnail */}
                            <div
                                style={{ width: 100, flexShrink: 0, background: "#F6F3EF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                onClick={() => loadSlip(row.id, row.slip_url)}
                            >
                                {slipUrls[row.id] ? (
                                    <img src={slipUrls[row.id]} alt="slip" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 12 }}>
                                        <Eye size={18} style={{ color: "#8FAF8A" }} />
                                        <span style={{ fontSize: 9, color: "#C9A98D", textAlign: "center" }}>กดดูสลิป</span>
                                    </div>
                                )}
                            </div>

                            {/* info */}
                            <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {row.avatar_url && <img src={row.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />}
                                    <span style={{ fontSize: 14, fontWeight: 600, color: "#3A3530" }}>{row.twitch_name}</span>
                                    <span style={{ fontSize: 11, color: "#C9A98D" }}>{timeAgo(row.created_at)}</span>
                                </div>
                                <div style={{ fontSize: 12, color: "#6B4C35" }}>
                                    <span style={{ fontWeight: 600, color: "#4A6B45" }}>{formatBaht(row.amount)}</span>
                                    {" → "}
                                    <span style={{ opacity: 0.7 }}>{row.wish_item_title}</span>
                                </div>
                            </div>

                            {/* actions */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px", flexShrink: 0 }}>
                                {/* view full slip */}
                                {slipUrls[row.id] && (
                                    <a href={slipUrls[row.id]} target="_blank" rel="noopener noreferrer"
                                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#4A6B45", textDecoration: "none" }}>
                                        <ExternalLink size={12} /> เปิด
                                    </a>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleApprove(row.id)}
                                    disabled={working === row.id}
                                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 16px", borderRadius: 8, border: "none", background: "#4A6B45", color: "white", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
                                >
                                    {working === row.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                    Approve
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => { setRejectId(row.id); setRejectReason(""); }}
                                    disabled={working === row.id}
                                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(220,80,80,0.3)", background: "rgba(220,80,80,0.06)", color: "#C05050", fontSize: 13, cursor: "pointer" }}
                                >
                                    <XCircle size={13} /> Reject
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* reject modal */}
            <AnimatePresence>
                {rejectId && (
                    <Modal onClose={() => setRejectId(null)} title="เหตุผลที่ reject">
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="ยอดไม่ตรง / สลิปไม่ชัด / อื่นๆ"
                            rows={3}
                            style={{ ...inputCls, resize: "none", marginBottom: 12 }}
                        />
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => setRejectId(null)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(143,175,138,0.3)", background: "transparent", cursor: "pointer", fontSize: 13 }}>
                                ยกเลิก
                            </button>
                            <button onClick={handleReject} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#C05050", color: "white", cursor: "pointer", fontSize: 13 }}>
                                ยืนยัน Reject
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
}

// ── SURPRISES TAB ─────────────────────────────────────────────
function SurprisesTab({ rows, onRefresh }: { rows: PendingSurprise[]; onRefresh: () => void }) {
    const [filter, setFilter] = useState<"pending" | "all">("pending");
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [slipUrls, setSlipUrls] = useState<Record<string, string>>({});
    const [working, setWorking] = useState<string | null>(null);

    const displayed = filter === "pending" ? rows.filter(r => r.status === "pending") : rows;

    const loadSlip = async (id: string, path: string) => {
        if (slipUrls[id]) return;
        try { const url = await getSlipSignedUrl(path); setSlipUrls(p => ({ ...p, [id]: url })); }
        catch (e) { console.error(e); }
    };

    const handleApprove = async (id: string) => {
        setWorking(id);
        try { await approveSurprise(id); onRefresh(); }
        catch (e) { console.error(e); }
        finally { setWorking(null); }
    };

    const handleReject = async () => {
        if (!rejectId) return;
        setWorking(rejectId);
        try { await rejectSurprise(rejectId, rejectReason); setRejectId(null); setRejectReason(""); onRefresh(); }
        catch (e) { console.error(e); }
        finally { setWorking(null); }
    };

    return (
        <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {(["pending", "all"] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        style={{ padding: "5px 14px", borderRadius: 100, border: `1px solid ${filter === f ? "transparent" : "rgba(143,175,138,0.3)"}`, background: filter === f ? "#4A6B45" : "transparent", color: filter === f ? "white" : "rgba(58,53,48,0.5)", fontSize: 11, cursor: "pointer", letterSpacing: "0.08em" }}>
                        {f === "pending" ? "รอตรวจสอบ" : "ทั้งหมด"}
                    </button>
                ))}
            </div>

            {displayed.length === 0 ? <EmptyState icon={<Gift size={28} />} label="ไม่มี surprise ที่รอตรวจสอบ" /> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {displayed.map(row => (
                        <div key={row.id} style={{ background: "white", borderRadius: 12, border: "1px solid rgba(143,175,138,0.12)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", display: "flex", alignItems: "stretch" }}>
                            {/* slip */}
                            <div style={{ width: 90, flexShrink: 0, background: "#F6F3EF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "12px 0 0 12px", overflow: "hidden" }}
                                onClick={() => loadSlip(row.id, row.slip_url)}>
                                {slipUrls[row.id]
                                    ? <img src={slipUrls[row.id]} alt="slip" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <div style={{ textAlign: "center", padding: 10 }}><Eye size={16} style={{ color: "#8FAF8A" }} /><div style={{ fontSize: 9, color: "#C9A98D", marginTop: 3 }}>ดูสลิป</div></div>
                                }
                            </div>

                            {/* info */}
                            <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {row.avatar_url && <img src={row.avatar_url} alt="" style={{ width: 20, height: 20, borderRadius: "50%" }} />}
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{row.twitch_name}</span>
                                    <StatusPill status={row.status} />
                                    <span style={{ fontSize: 10, color: "#C9A98D", marginLeft: "auto" }}>{timeAgo(row.created_at)}</span>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#3A3530" }}>{row.item_name} {row.amount ? <span style={{ color: "#4A6B45" }}>— {formatBaht(row.amount)}</span> : ""}</div>
                                {row.product_link && <a href={row.product_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4A6B45", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}><ExternalLink size={10} />{row.product_link}</a>}
                                {row.message && <p style={{ fontSize: 12, color: "#6B4C35", opacity: 0.7, fontStyle: "italic" }}>"{row.message}"</p>}
                            </div>

                            {/* actions */}
                            {row.status === "pending" && (
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", flexShrink: 0 }}>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleApprove(row.id)} disabled={working === row.id}
                                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: 8, border: "none", background: "#4A6B45", color: "white", fontSize: 12, cursor: "pointer" }}>
                                        {working === row.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={12} />} Approve
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setRejectId(row.id); setRejectReason(""); }}
                                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(220,80,80,0.3)", background: "rgba(220,80,80,0.06)", color: "#C05050", fontSize: 12, cursor: "pointer" }}>
                                        <XCircle size={12} /> Reject
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {rejectId && (
                    <Modal onClose={() => setRejectId(null)} title="เหตุผลที่ reject">
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="เหตุผล…" rows={3} style={{ ...inputCls, resize: "none", marginBottom: 12 }} />
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => setRejectId(null)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(143,175,138,0.3)", background: "transparent", cursor: "pointer", fontSize: 13 }}>ยกเลิก</button>
                            <button onClick={handleReject} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#C05050", color: "white", cursor: "pointer", fontSize: 13 }}>ยืนยัน</button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
}

// ── ITEMS TAB ─────────────────────────────────────────────────
function ItemsTab({ items, onRefresh }: { items: WishItemAdmin[]; onRefresh: () => void }) {
    const [editing, setEditing] = useState<WishItemAdmin | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [working, setWorking] = useState<string | null>(null);
    const [ordered, setOrdered] = useState<WishItemAdmin[]>(items);
    const [saving, setSaving] = useState(false);
    const dragId = useRef<string | null>(null);
    const dragOver = useRef<string | null>(null);

    // sync เมื่อ items จาก parent เปลี่ยน
    useEffect(() => { setOrdered(items); }, [items]);

    // ── drag handlers ────────────────────────────────────────
    const onDragStart = (id: string) => { dragId.current = id; };
    const onDragEnter = (id: string) => { dragOver.current = id; };
    const onDragEnd = async () => {
        if (!dragId.current || !dragOver.current || dragId.current === dragOver.current) return;
        const next = [...ordered];
        const from = next.findIndex(i => i.id === dragId.current);
        const to = next.findIndex(i => i.id === dragOver.current);
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        // update sort_order ตามลำดับใหม่
        const withOrder = next.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
        setOrdered(withOrder);
        dragId.current = null;
        dragOver.current = null;
        // save to DB
        setSaving(true);
        try {
            await Promise.all(withOrder.map(item => updateWishItem(item.id, { sort_order: item.sort_order })));
            onRefresh();
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("ลบของขวัญชิ้นนี้?")) return;
        setWorking(id);
        try { await deleteWishItem(id); onRefresh(); }
        catch (e) { console.error(e); }
        finally { setWorking(null); }
    };

    const handleGrantToggle = async (item: WishItemAdmin) => {
        setWorking(item.id);
        try { await updateWishItem(item.id, { is_granted: !item.is_granted }); onRefresh(); }
        catch (e) { console.error(e); }
        finally { setWorking(null); }
    };

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: "#C9A98D", display: "flex", alignItems: "center", gap: 5 }}>
                    {saving
                        ? <><Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> บันทึกลำดับ…</>
                        : "⠿ ลากการ์ดเพื่อเรียงลำดับ"
                    }
                </p>
                <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => {
                        setEditing({ id: "", created_at: "", title: "", description: null, image_url: null, product_link: null, category: null, mode: "crowdfund", target_amount: 0, is_granted: false, sort_order: items.length + 1 });
                        setIsNew(true);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, border: "none", background: "#4A6B45", color: "white", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
                >
                    <Plus size={14} /> เพิ่ม Wish Item
                </motion.button>
            </div>

            {/* ── Active wishes ── */}
            {ordered.filter(i => !i.is_granted).length > 0 && (
                <>
                    <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.5, marginBottom: 10 }}>
                        Active · {ordered.filter(i => !i.is_granted).length} items
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14, marginBottom: 28 }}>
                        {ordered.filter(i => !i.is_granted).map(item => (
                            <ItemCard key={item.id} item={item} working={working}
                                onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd}
                                onEdit={() => { setEditing(item); setIsNew(false); }}
                                onGrantToggle={() => handleGrantToggle(item)}
                                onDelete={() => handleDelete(item.id)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* ── Granted wishes ── */}
            {ordered.filter(i => i.is_granted).length > 0 && (
                <>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <div style={{ flex: 1, height: 1, background: "rgba(143,175,138,0.2)" }} />
                        <p style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4A6B45", opacity: 0.5, flexShrink: 0 }}>
                            ✦ Granted · {ordered.filter(i => i.is_granted).length} items
                        </p>
                        <div style={{ flex: 1, height: 1, background: "rgba(143,175,138,0.2)" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                        {ordered.filter(i => i.is_granted).map(item => (
                            <ItemCard key={item.id} item={item} working={working}
                                onDragStart={onDragStart} onDragEnter={onDragEnter} onDragEnd={onDragEnd}
                                onEdit={() => { setEditing(item); setIsNew(false); }}
                                onGrantToggle={() => handleGrantToggle(item)}
                                onDelete={() => handleDelete(item.id)}
                                isGrantedSection
                            />
                        ))}
                    </div>
                </>
            )}

            <AnimatePresence>
                {editing && (
                    <WishItemForm
                        item={editing}
                        isNew={isNew}
                        onClose={() => setEditing(null)}
                        onSaved={() => { setEditing(null); onRefresh(); }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}

// ── ITEM CARD (shared by active + granted sections) ──────────
function ItemCard({ item, working, onDragStart, onDragEnter, onDragEnd, onEdit, onGrantToggle, onDelete, isGrantedSection }: {
    item: WishItemAdmin;
    working: string | null;
    onDragStart: (id: string) => void;
    onDragEnter: (id: string) => void;
    onDragEnd: () => void;
    onEdit: () => void;
    onGrantToggle: () => void;
    onDelete: () => void;
    isGrantedSection?: boolean;
}) {
    return (
        <div
            draggable
            onDragStart={() => onDragStart(item.id)}
            onDragEnter={() => onDragEnter(item.id)}
            onDragEnd={onDragEnd}
            onDragOver={e => e.preventDefault()}
            style={{
                background: isGrantedSection ? "#E8EFE7" : "white",
                borderRadius: 12, overflow: "hidden",
                border: `1px solid ${isGrantedSection ? "rgba(143,175,138,0.3)" : "rgba(143,175,138,0.15)"}`,
                boxShadow: "0 1px 5px rgba(0,0,0,0.05)",
                cursor: "grab",
            }}
        >
            {/* drag handle */}
            <div style={{ height: 5, background: "repeating-linear-gradient(90deg, rgba(143,175,138,0.25) 0px, rgba(143,175,138,0.25) 3px, transparent 3px, transparent 7px)" }} />

            {item.image_url
                ? <img src={item.image_url} alt={item.title} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                : <div style={{ width: "100%", aspectRatio: "4/3", background: isGrantedSection ? "rgba(143,175,138,0.15)" : "#E8EFE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ImageIcon size={22} style={{ color: "#8FAF8A", opacity: 0.35 }} />
                </div>
            }
            <div style={{ padding: "11px 13px 13px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: "#3A3530", lineHeight: 1.3, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                        {item.title}
                    </h3>
                </div>
                <div style={{ fontSize: 11, color: "#C9A98D", marginBottom: 10 }}>
                    {item.mode === "crowdfund" ? "Crowdfund" : "Buy Now"} · {formatBaht(item.target_amount)} · #{item.sort_order}
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <button onClick={onEdit}
                        style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 10px", borderRadius: 7, border: "1px solid rgba(143,175,138,0.3)", background: "transparent", cursor: "pointer", fontSize: 11, color: "#4A6B45" }}>
                        <Pencil size={10} /> แก้ไข
                    </button>
                    <button onClick={onGrantToggle} disabled={working === item.id}
                        style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 10px", borderRadius: 7, border: "1px solid rgba(143,175,138,0.3)", background: isGrantedSection ? "rgba(74,107,69,0.12)" : "transparent", cursor: "pointer", fontSize: 11, color: "#4A6B45" }}>
                        <CheckCircle2 size={10} /> {isGrantedSection ? "Unmark" : "Mark Granted"}
                    </button>
                    <button onClick={onDelete} disabled={working === item.id}
                        style={{ display: "flex", alignItems: "center", gap: 3, padding: "4px 8px", borderRadius: 7, border: "1px solid rgba(220,80,80,0.25)", background: "transparent", cursor: "pointer", fontSize: 11, color: "#C05050", marginLeft: "auto" }}>
                        <Trash2 size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── HISTORY TAB ───────────────────────────────────────────────
function HistoryTab({ rows }: { rows: PendingContribution[] }) {
    if (rows.length === 0) return <EmptyState icon={<History size={28} />} label="ยังไม่มีประวัติ" />;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rows.map(row => (
                <div key={row.id} style={{ background: "white", borderRadius: 10, padding: "10px 16px", border: "1px solid rgba(143,175,138,0.1)", display: "flex", alignItems: "center", gap: 12 }}>
                    {row.avatar_url && <img src={row.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#3A3530" }}>{row.twitch_name}</span>
                        <span style={{ fontSize: 12, color: "#C9A98D", margin: "0 6px" }}>→</span>
                        <span style={{ fontSize: 13, color: "#6B4C35" }}>{row.wish_item_title}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#4A6B45" }}>{formatBaht(row.amount)}</span>
                    <StatusPill status={row.status} />
                    <span style={{ fontSize: 10, color: "#C9A98D" }}>{timeAgo(row.created_at)}</span>
                </div>
            ))}
        </div>
    );
}

// ── WISH ITEM FORM (modal) ─────────────────────────────────────
function WishItemForm({ item, isNew, onClose, onSaved }: { item: WishItemAdmin; isNew: boolean; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState({ ...item });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const imgRef = useRef<HTMLInputElement>(null);

    const set = (k: keyof WishItemAdmin, v: any) => setForm(f => ({ ...f, [k]: v }));

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const url = await uploadWishImage(file);
            set("image_url", url);
        } catch (e) { console.error(e); }
        finally { setUploading(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isNew) {
                const { id, created_at, ...rest } = form;
                await createWishItem(rest);
            } else {
                await updateWishItem(form.id, form);
            }
            onSaved();
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    return (
        <Modal onClose={onClose} title={isNew ? "เพิ่ม Wish Item ใหม่" : `แก้ไข: ${item.title}`} wide noBackdropClose>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* title */}
                <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelCls}>ชื่อของขวัญ *</label>
                    <input value={form.title} onChange={e => set("title", e.target.value)} style={inputCls} />
                </div>
                {/* description */}
                <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelCls}>คำอธิบาย</label>
                    <textarea value={form.description ?? ""} onChange={e => set("description", e.target.value)} rows={2} style={{ ...inputCls, resize: "none" }} />
                </div>
                {/* category */}
                <div>
                    <label style={labelCls}>Category</label>
                    <input value={form.category ?? ""} onChange={e => set("category", e.target.value)} placeholder="Tech, Food, …" style={inputCls} />
                </div>
                {/* mode */}
                <div>
                    <label style={labelCls}>Mode</label>
                    <div style={{ display: "flex", gap: 8 }}>
                        {(["crowdfund", "buynow"] as const).map(m => (
                            <button key={m} onClick={() => set("mode", m)}
                                style={{ flex: 1, padding: "8px", borderRadius: 7, border: `1px solid ${form.mode === m ? "transparent" : "rgba(143,175,138,0.3)"}`, background: form.mode === m ? "#4A6B45" : "transparent", color: form.mode === m ? "white" : "#3A3530", cursor: "pointer", fontSize: 12 }}>
                                {m === "crowdfund" ? "Crowdfund" : "Buy Now"}
                            </button>
                        ))}
                    </div>
                </div>
                {/* target amount */}
                <div>
                    <label style={labelCls}>ราคา / เป้าหมาย (฿) *</label>
                    <input type="number" value={form.target_amount} onChange={e => set("target_amount", parseFloat(e.target.value) || 0)} style={inputCls} />
                </div>

                {/* product link */}
                <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelCls}>ลิงก์สินค้า</label>
                    <input type="url" value={form.product_link ?? ""} onChange={e => set("product_link", e.target.value)} placeholder="https://…" style={inputCls} />
                </div>
                {/* image */}
                <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelCls}>รูปภาพ</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {form.image_url
                            ? <img src={form.image_url} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(143,175,138,0.2)" }} />
                            : <div style={{ width: 72, height: 72, background: "#E8EFE7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><ImageIcon size={20} style={{ color: "#8FAF8A" }} /></div>
                        }
                        <div style={{ flex: 1 }}>
                            <input value={form.image_url ?? ""} onChange={e => set("image_url", e.target.value)} placeholder="URL รูปภาพ หรืออัปโหลด" style={{ ...inputCls, marginBottom: 6 }} />
                            <button onClick={() => imgRef.current?.click()} disabled={uploading}
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(143,175,138,0.3)", background: "transparent", cursor: "pointer", fontSize: 12, color: "#4A6B45" }}>
                                {uploading ? <Loader2 size={11} className="animate-spin" /> : <ImageIcon size={11} />} อัปโหลดรูป
                            </button>
                            <input ref={imgRef} type="file" accept="image/*" className="hidden" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(143,175,138,0.3)", background: "transparent", cursor: "pointer", fontSize: 13 }}>ยกเลิก</button>
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleSave} disabled={saving || !form.title}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 22px", borderRadius: 8, border: "none", background: "#4A6B45", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    {isNew ? "สร้าง" : "บันทึก"}
                </motion.button>
            </div>
        </Modal>
    );
}

// ── Shared components ─────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
    const styles: Record<string, React.CSSProperties> = {
        pending: { background: "rgba(201,168,76,0.12)", color: "#9A7A2A", border: "1px solid rgba(201,168,76,0.3)" },
        approved: { background: "rgba(74,107,69,0.1)", color: "#4A6B45", border: "1px solid rgba(74,107,69,0.2)" },
        rejected: { background: "rgba(200,80,80,0.08)", color: "#C05050", border: "1px solid rgba(200,80,80,0.2)" },
    };
    const labels: Record<string, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
    return (
        <span style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 100, ...styles[status] }}>
            {labels[status] ?? status}
        </span>
    );
}

// noBackdropClose: ถ้า true จะปิดได้แค่ปุ่ม X เท่านั้น (ใช้กับ form ที่ยาว)
function Modal({ children, onClose, title, wide, noBackdropClose }: { children: React.ReactNode; onClose: () => void; title: string; wide?: boolean; noBackdropClose?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={noBackdropClose ? undefined : onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                style={{ background: "white", borderRadius: 14, padding: "22px 24px", width: "100%", maxWidth: wide ? 640 : 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: "italic", fontWeight: 300, color: "#6B4C35" }}>{title}</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={16} style={{ color: "#C9A98D" }} /></button>
                </div>
                {children}
            </motion.div>
        </motion.div>
    );
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "60px 0", color: "#C9A98D" }}>
            <div style={{ opacity: 0.4 }}>{icon}</div>
            <p style={{ fontSize: 13, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif" }}>{label}</p>
        </div>
    );
}