// components/canvas/hooks/useCanvasPresence.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PresenceUser = {
    id: string;
    name: string;
};

type SupabasePresenceState = Record<
    string,
    { user: PresenceUser }[]
>;

/**
 * ใช้สำหรับนับคนที่อยู่ในห้องวาดรูปแบบ real-time ด้วย Supabase Realtime Presence
 */
export function useCanvasPresence(
    roomId: string,
    currentUser: PresenceUser | null
): string[] {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        // ยังไม่รู้ว่า user เป็นใคร → ไม่ต้อง join room
        if (!currentUser) return;

        const supabase = createClient();
        const channelName = `canvas:${roomId}`;

        const channel = supabase.channel(channelName, {
            config: {
                presence: {
                    // ใช้ id เป็น key ให้ presence แยกคน
                    key: currentUser.id,
                },
            },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState() as SupabasePresenceState;

                const users = Object.values(state)
                    .flat()
                    .map((entry) => entry.user.name)
                    // กันชื่อซ้ำกรณี reconnect / tab ซ้ำ
                    .filter((name, index, arr) => arr.indexOf(name) === index);

                // กันอาการว่างชั่วขณะ (flicker 0 → 1 → 0)
                setOnlineUsers((prev) =>
                    users.length === 0 && prev.length > 0 ? prev : users
                );
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    // บอก Supabase ว่าเรา online อยู่ พร้อม metadata (id + name)
                    await channel.track({
                        user: currentUser,
                    });
                }
            });

        // cleanup เวลา unmount หรือ user / roomId เปลี่ยน
        return () => {
            channel.unsubscribe();
        };
    }, [
        roomId,
        currentUser?.id, // ใช้ id อย่างเดียวใน dependency ให้ stable
        currentUser?.name,
    ]);

    return onlineUsers;
}