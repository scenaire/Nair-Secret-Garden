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

    const fetch = useCallback(async () => {
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

    // mark all as read เมื่อ user เปิด dropdown
    const markAllRead = useCallback(async () => {
        if (!userId || notifications.length === 0) return;
        const supabase = createClient();
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);
        setNotifications([]);
    }, [userId, notifications.length]);

    useEffect(() => {
        fetch();
    }, [fetch]);

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
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    return { notifications, unreadCount: notifications.length, markAllRead };
}