"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertCircle, Gift, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const TYPE_CONFIG = {
    wishlist_approved: { icon: <CheckCircle2 size={16} />, color: '#4A6B45', bg: 'rgba(74,107,69,0.08)' },
    wishlist_rejected: { icon: <AlertCircle size={16} />, color: '#C05050', bg: 'rgba(200,80,80,0.07)' },
    surprise_approved: { icon: <Gift size={16} />, color: '#4A6B45', bg: 'rgba(74,107,69,0.08)' },
    surprise_rejected: { icon: <AlertCircle size={16} />, color: '#C05050', bg: 'rgba(200,80,80,0.07)' },
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'เมื่อกี้';
    if (m < 60) return `${m} นาทีที่แล้ว`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
    return `${Math.floor(h / 24)} วันที่แล้ว`;
}

export function NotificationBell({ userId }: { userId: string | null }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    // 🔧 เพิ่ม deleteNotification จาก hook
    const { notifications, unreadCount, markAllRead, deleteNotification } = useNotifications(userId);

    // ปิด dropdown เมื่อคลิกข้างนอก
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // 🔧 Bug fix #1: markAllRead ทันทีที่เปิด dropdown ไม่ใช่ delay แล้วค่อยเรียก
    const handleOpen = () => {
        const isOpening = !open;
        setOpen(isOpening);
        if (isOpening && unreadCount > 0) {
            markAllRead();
        }
    };

    if (!userId) return null;

    return (
        <div className="relative" ref={ref}>
            {/* Bell button */}
            <button
                type="button"
                onClick={handleOpen}
                className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-[rgba(230,215,189,0.4)]"
            >
                <Bell size={15} style={{ color: '#8B5E52', opacity: unreadCount > 0 ? 1 : 0.5 }} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                            style={{ background: '#C05050' }}
                        />
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 rounded-2xl overflow-hidden"
                        style={{
                            width: 300, zIndex: 600,
                            background: '#FFFDF9',
                            border: '1px solid rgba(196,168,130,0.2)',
                            boxShadow: '0 8px 24px rgba(139,94,82,0.12)',
                        }}
                    >
                        {/* header */}
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(196,168,130,0.15)' }}>
                            <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B5E52', opacity: 0.6 }}>
                                การแจ้งเตือน
                            </p>
                        </div>

                        {/* list */}
                        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8" style={{ color: '#C9A98D' }}>
                                    <Bell size={20} style={{ opacity: 0.25 }} />
                                    <p style={{ fontSize: 12, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif" }}>
                                        ไม่มีการแจ้งเตือนใหม่
                                    </p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const cfg = TYPE_CONFIG[n.type];
                                    return (
                                        <div
                                            key={n.id}
                                            className="px-4 py-3 border-b"
                                            style={{ borderColor: 'rgba(196,168,130,0.1)', background: cfg.bg }}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <span className="mt-0.5 flex-shrink-0" style={{ color: cfg.color }}>
                                                    {cfg.icon}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p style={{ fontSize: 12, color: '#3A3530', lineHeight: 1.5 }}>
                                                        {n.message}
                                                    </p>
                                                    {n.reject_reason && (
                                                        <p style={{ fontSize: 11, color: '#C05050', marginTop: 3, fontStyle: 'italic' }}>
                                                            เหตุผล: {n.reject_reason}
                                                        </p>
                                                    )}
                                                    <p style={{ fontSize: 10, color: '#C9A98D', marginTop: 4 }}>
                                                        {timeAgo(n.created_at)}
                                                    </p>
                                                </div>

                                                {/* 🔧 Bug fix #2: ปุ่มลบแต่ละ notification */}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteNotification(n.id)}
                                                    className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full transition-colors hover:bg-[rgba(192,80,80,0.1)]"
                                                    style={{ color: '#C9A98D' }}
                                                >
                                                    <X size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}