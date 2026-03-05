"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Notification {
    id: string;
    type: 'wishlist_approved' | 'wishlist_rejected' | 'surprise_approved' | 'surprise_rejected';
    title: string;
    message: string;
    reject_reason: string | null;
    is_read: boolean;
    created_at: string;
    expires_at: string;
}

export function useNotifications(userId: string | null) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        const supabase = createClient();
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });
        setNotifications(data ?? []);
    }, [userId]);

    // 🔧 Bug fix #1: แค่ mark is_read = true ใน state ไม่ได้ล้างข้อความออก
    const markAllRead = useCallback(async () => {
        if (!userId) return;
        const unread = notifications.filter(n => !n.is_read);
        if (unread.length === 0) return;

        const supabase = createClient();
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        // อัปเดต state เฉพาะ flag is_read ข้อความยังอยู่
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }, [userId, notifications]);

    // 🔧 Bug fix #2: เพิ่ม deleteNotification พร้อม error check
    const deleteNotification = useCallback(async (id: string) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        // อัปเดต state เฉพาะเมื่อ delete สำเร็จ ป้องกันข้อมูลกลับมาเมื่อ refresh
        if (error) {
            console.error('[deleteNotification] Supabase error:', error);
            return;
        }
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Realtime — รับ notification ใหม่ทันทีโดยไม่ต้อง refresh
    useEffect(() => {
        if (!userId) return;
        const supabase = createClient();
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev]);
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            }, (payload) => {
                // sync state ถ้ามีการลบจาก device อื่น
                setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    // unreadCount นับเฉพาะที่ยังไม่ได้อ่าน
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return { notifications, unreadCount, markAllRead, deleteNotification };
}