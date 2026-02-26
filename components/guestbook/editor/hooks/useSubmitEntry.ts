// components/guestbook/editor/hooks/useSubmitEntry.ts
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { GuestbookDraftData } from './useAutoSave';

export function useSubmitEntry() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const submitEntry = async (authorAlias: string) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error('กรุณาล็อกอินก่อนส่งข้อความนะคะ 🌸');

            const draftRaw = localStorage.getItem('guestbook_draft_data');
            if (!draftRaw) throw new Error('ไม่พบข้อมูลที่จะส่งค่ะ ลองพิมพ์อะไรสักหน่อยสิคะ ✨');

            const draft: GuestbookDraftData = JSON.parse(draftRaw);
            if (!draft.content || draft.content === '<p></p>') throw new Error('กระดาษยังว่างเปล่าอยู่เลยค่ะ 🥺');

            const { data: entry, error: entryError } = await supabase
                .from('guestbook_entries')
                .upsert({
                    user_id: user.id,
                    author_alias: authorAlias,
                    content: draft.content,
                    canvas_width: draft.canvasWidth,
                    canvas_height: draft.canvasHeight,
                    theme: draft.theme,
                    paper_color: draft.paperColor,
                    paper_texture: draft.paperTexture,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (entryError) throw entryError;

            // ลบ sticker เก่าออกก่อน แล้ว insert ใหม่
            const { error: deleteError } = await supabase
                .from('guestbook_stickers')
                .delete()
                .eq('entry_id', entry.id);
            if (deleteError) throw deleteError;

            if (draft.stickers && draft.stickers.length > 0) {
                const stickerPayload = draft.stickers.map(s => ({
                    entry_id: entry.id,
                    sticker_type: s.content,
                    x_position: s.xPercent,
                    y_position: s.yPercent, // ✨ เซฟเป็น percent แล้ว
                    rotation: s.rotation,
                    scale: s.widthPercent || 25,
                    z_index: 10
                }));
                const { error: stickerError } = await supabase
                    .from('guestbook_stickers')
                    .insert(stickerPayload);
                if (stickerError) throw stickerError;
            }

            localStorage.removeItem('guestbook_draft_data');
            localStorage.removeItem('guestbook_draft_name');

            return true;

        } catch (err: any) {
            console.error('Submit Error:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการส่งข้อความค่ะ 🥺');
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { submitEntry, isSubmitting, error };
}