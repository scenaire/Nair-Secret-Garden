// components/guestbook/editor/hooks/useLoadEntry.ts
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function useLoadEntry() {
    const [isFetchingDB, setIsFetchingDB] = useState(true);
    const [hasEntry, setHasEntry] = useState(false);
    const [savedData, setSavedData] = useState<any>(null);

    useEffect(() => {
        const fetchMyEntry = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: entry } = await supabase
                    .from('guestbook_entries')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (entry) {
                    const { data: stickers } = await supabase
                        .from('guestbook_stickers')
                        .select('*')
                        .eq('entry_id', entry.id);

                    const draftData = {
                        content: entry.content,
                        canvasWidth: entry.canvas_width,
                        canvasHeight: entry.canvas_height,
                        theme: entry.theme || 'cream',
                        paperColor: entry.paper_color || 'cream',
                        paperTexture: entry.paper_texture || 'plain',
                        authorAlias: entry.author_alias || 'Anonymous',
                        stickers: (stickers || []).map(s => ({
                            id: s.id,
                            content: s.sticker_type,
                            xPercent: s.x_position,
                            yPercent: s.y_position, // ✨ โหลดเป็น percent ตรงๆ จาก DB
                            widthPercent: s.scale || 25,
                            rotation: s.rotation,
                        }))
                    };

                    setHasEntry(true);
                    setSavedData(draftData);

                    if (!localStorage.getItem('guestbook_draft_data')) {
                        localStorage.setItem('guestbook_draft_data', JSON.stringify(draftData));
                        if (entry.author_alias) localStorage.setItem('guestbook_draft_name', entry.author_alias);
                    }
                }
            } catch (error) {
                console.error('Error fetching past entry:', error);
            } finally {
                setIsFetchingDB(false);
            }
        };

        fetchMyEntry();
    }, []);

    return { isFetchingDB, hasEntry, savedData };
}