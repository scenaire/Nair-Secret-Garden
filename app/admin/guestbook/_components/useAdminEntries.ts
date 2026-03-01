import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { GuestbookEntry, Sticker } from "../_types";

export function useAdminEntries() {
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEntries = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data: entriesData, error: entriesError } = await supabase
                    .from("guestbook_entries")
                    .select("*")
                    .order("created_at", { ascending: true });

                if (entriesError) throw entriesError;
                if (!entriesData) return;

                const ids = entriesData.map((e: any) => e.id);
                const { data: stickersData } = await supabase
                    .from("guestbook_stickers")
                    .select("*")
                    .in("entry_id", ids);

                const stickersByEntry: Record<string, Sticker[]> = {};
                (stickersData || []).forEach((s: any) => {
                    if (!stickersByEntry[s.entry_id]) stickersByEntry[s.entry_id] = [];
                    stickersByEntry[s.entry_id].push({
                        id: s.id,
                        content: s.sticker_type,
                        xPercent: s.x_position,
                        yPercent: s.y_position,
                        widthPercent: s.scale || 25,
                        rotation: s.rotation,
                    });
                });

                setEntries(entriesData.map((e: any) => ({
                    id: e.id,
                    content: e.content,
                    theme: e.theme || "cream",
                    paperColor: e.paper_color || "cream",
                    paperTexture: e.paper_texture || "plain",
                    authorAlias: e.author_alias || "Anonymous",
                    canvasWidth: e.canvas_width || 600,
                    canvasHeight: e.canvas_height || 800,
                    createdAt: e.created_at,
                    stickers: stickersByEntry[e.id] || [],
                })));
            } catch (err: any) {
                setError("โหลดข้อมูลไม่ได้ กรุณาลองใหม่อีกครั้ง");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntries();
    }, []);

    return { entries, isLoading, error };
}